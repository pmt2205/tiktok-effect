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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(username, password, role) {
        const existing = await this.usersService.findByUsername(username);
        if (existing) {
            throw new common_1.ConflictException('Username already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await this.usersService.create(username, hash, role);
        return {
            userId: user._id,
            username: user.username,
            role: user.role,
        };
    }
    async login(username, password) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const payload = {
            sub: user._id,
            username: user.username,
            role: user.role,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                userId: user._id,
                username: user.username,
                role: user.role,
                allowConnect: user.allowConnect ?? false,
                allowNpc: user.allowNpc ?? false,
            },
        };
    }
    async loginWithGoogle(idToken) {
        if (!idToken) {
            throw new common_1.UnauthorizedException('Missing Google ID token');
        }
        try {
            const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (!res.ok) {
                throw new common_1.UnauthorizedException('Invalid Google ID token');
            }
            const payload = await res.json();
            const clientId = process.env.GOOGLE_CLIENT_ID;
            if (clientId && payload.aud !== clientId) {
                throw new common_1.UnauthorizedException('Google ID token client ID mismatch');
            }
            const email = payload.email;
            if (!email) {
                throw new common_1.UnauthorizedException('Google token missing email profile details');
            }
            let user = await this.usersService.findByUsername(email);
            if (!user) {
                const placeholderPassword = Math.random().toString(36).slice(-10) + Date.now();
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(placeholderPassword, salt);
                user = await this.usersService.create(email, hash, 'user');
            }
            const appPayload = {
                sub: user._id,
                username: user.username,
                role: user.role,
            };
            return {
                accessToken: this.jwtService.sign(appPayload),
                user: {
                    userId: user._id,
                    username: user.username,
                    role: user.role,
                    allowConnect: user.allowConnect ?? false,
                    allowNpc: user.allowNpc ?? false,
                },
            };
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException) {
                throw err;
            }
            throw new common_1.UnauthorizedException(`Google login failed: ${err.message}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map