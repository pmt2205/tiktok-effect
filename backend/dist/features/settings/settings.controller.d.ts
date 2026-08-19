import { SettingsService } from './settings.service';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): OverlaySettings;
    updateSettings(settings: Partial<OverlaySettings>): OverlaySettings;
    getMappings(): GiftMappings;
    updateMappings(mappings: GiftMappings): GiftMappings;
}
