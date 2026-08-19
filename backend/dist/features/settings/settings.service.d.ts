import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
export declare class SettingsService {
    private readonly logger;
    private settings;
    private mappings;
    getSettings(): OverlaySettings;
    updateSettings(newSettings: Partial<OverlaySettings>): OverlaySettings;
    getMappings(): GiftMappings;
    updateMappings(newMappings: GiftMappings): GiftMappings;
}
