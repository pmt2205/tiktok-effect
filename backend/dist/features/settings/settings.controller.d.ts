import { SettingsService } from './settings.service';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(req: any): Promise<OverlaySettings>;
    updateSettings(req: any, settings: Partial<OverlaySettings>): Promise<OverlaySettings>;
    getMappings(req: any): Promise<GiftMappings>;
    updateMappings(req: any, mappings: GiftMappings): Promise<GiftMappings>;
}
