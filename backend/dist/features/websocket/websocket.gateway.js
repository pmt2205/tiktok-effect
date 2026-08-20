"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebsocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const tiktok_service_1 = require("../tiktok/tiktok.service");
const settings_service_1 = require("../settings/settings.service");
const gifts_service_1 = require("../gifts/gifts.service");
const users_service_1 = require("../users/users.service");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    constructor(tiktokService, settingsService, jwtService, giftsService, usersService) {
        this.tiktokService = tiktokService;
        this.settingsService = settingsService;
        this.jwtService = jwtService;
        this.giftsService = giftsService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(WebsocketGateway_1.name);
    }
    onModuleInit() {
        this.tiktokService.registerCallbacks({
            onStatusChange: (status) => {
                this.server.emit('event', { type: 'status', data: status });
            },
            onChat: (data) => {
                this.server.emit('event', { type: 'chat', data });
            },
            onGift: (data) => {
                this.server.emit('event', { type: 'gift', data });
            },
            onRoomUser: (data) => {
                this.server.emit('event', { type: 'roomUser', data });
            },
            onGiftsList: (gifts) => {
                this.server.emit('event', { type: 'gifts-list', data: gifts });
            },
        });
        this.giftsService.registerChangeCallback((gifts) => {
            this.server.emit('event', { type: 'gifts-update', data: gifts });
        });
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id} (Total: ${this.server.engine.clientsCount})`);
        client.emit('event', {
            type: 'status',
            data: this.tiktokService.getStatus(),
        });
        const gifts = this.tiktokService.getAvailableGifts();
        if (gifts && gifts.length > 0) {
            client.emit('event', {
                type: 'gifts-list',
                data: gifts,
            });
        }
        client.emit('event', {
            type: 'settings-update',
            data: this.settingsService.getSettings(),
        });
        client.emit('event', {
            type: 'mappings-update',
            data: this.settingsService.getMappings(),
        });
        this.giftsService.findAll()
            .then(dbGifts => {
            client.emit('event', {
                type: 'gifts-update',
                data: dbGifts,
            });
        })
            .catch(err => this.logger.error('Failed to send database gifts to new client:', err));
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleCommand(client, packet) {
        this.logger.log(`Received command: ${packet.type}`);
        const adminCommands = ['connect-stream', 'disconnect-stream', 'simulate-event'];
        if (adminCommands.includes(packet.type)) {
            try {
                if (!packet.token) {
                    throw new Error('No authentication token provided');
                }
                const decoded = this.jwtService.verify(packet.token);
                if (packet.type === 'connect-stream' || packet.type === 'disconnect-stream') {
                    const dbUser = await this.usersService.findByUsername(decoded.username);
                    const allowUserConnect = dbUser ? dbUser.allowConnect : false;
                    if (decoded.role !== 'admin' && !allowUserConnect) {
                        throw new Error('Unauthorized role: Stream connection is disabled for your user account');
                    }
                }
                else {
                    if (decoded.role !== 'admin') {
                        throw new Error('Unauthorized role: Admin privileges required');
                    }
                }
            }
            catch (err) {
                this.logger.warn(`Unauthorized WS command: ${packet.type} - ${err.message}`);
                client.emit('event', {
                    type: 'error',
                    data: `Unauthorized: ${err.message}`,
                });
                return;
            }
        }
        switch (packet.type) {
            case 'connect-stream':
                if (packet.username) {
                    this.tiktokService.connect(packet.username);
                }
                break;
            case 'disconnect-stream':
                this.tiktokService.disconnect();
                break;
            case 'get-status':
                client.emit('event', {
                    type: 'status',
                    data: this.tiktokService.getStatus(),
                });
                break;
            case 'simulate-event':
                if (packet.eventType === 'gift' || packet.eventType === 'chat') {
                    this.logger.log(`Broadcasting simulated ${packet.eventType} event`);
                    this.server.emit('event', {
                        type: packet.eventType,
                        data: { ...packet.payload, isSimulated: true },
                    });
                }
                else if (packet.eventType === 'settings-update') {
                    if (packet.payload) {
                        this.settingsService.updateSettings(packet.payload);
                    }
                    this.server.emit('event', {
                        type: 'settings-update',
                        data: packet.payload,
                    });
                }
                else if (packet.eventType === 'mappings-update') {
                    if (packet.payload) {
                        this.settingsService.updateMappings(packet.payload);
                    }
                    this.server.emit('event', {
                        type: 'mappings-update',
                        data: packet.payload,
                    });
                }
                break;
            default:
                this.logger.warn(`Unknown command type: ${packet.type}`);
        }
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('command'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleCommand", null);
exports.WebsocketGateway = WebsocketGateway = WebsocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [tiktok_service_1.TiktokService,
        settings_service_1.SettingsService,
        jwt_1.JwtService,
        gifts_service_1.GiftsService,
        users_service_1.UsersService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map