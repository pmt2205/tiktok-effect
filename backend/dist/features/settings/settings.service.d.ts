import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
import { Settings, Mapping } from './schemas/settings.schema';
export declare class SettingsService implements OnModuleInit {
    private readonly settingsModel;
    private readonly mappingModel;
    private readonly logger;
    private settings;
    private mappings;
    constructor(settingsModel: Model<Settings>, mappingModel: Model<Mapping>);
    onModuleInit(): Promise<void>;
    getSettings(): OverlaySettings;
    updateSettings(newSettings: Partial<OverlaySettings>): OverlaySettings;
    getMappings(): GiftMappings;
    updateMappings(newMappings: GiftMappings): GiftMappings;
    private persistMappings;
}
