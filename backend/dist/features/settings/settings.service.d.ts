import { Model } from 'mongoose';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
import { Settings, Mapping } from './schemas/settings.schema';
export declare class SettingsService {
    private readonly settingsModel;
    private readonly mappingModel;
    private readonly logger;
    private readonly defaultSettings;
    private readonly defaultMappings;
    constructor(settingsModel: Model<Settings>, mappingModel: Model<Mapping>);
    getSettingsForUser(username: string): Promise<OverlaySettings>;
    updateSettingsForUser(username: string, newSettings: Partial<OverlaySettings>): Promise<OverlaySettings>;
    getMappingsForUser(username: string): Promise<GiftMappings>;
    updateMappingsForUser(username: string, newMappings: GiftMappings): Promise<GiftMappings>;
}
