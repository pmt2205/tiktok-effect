import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Settings } from './schemas/settings.schema';
import { NpcCategory } from './schemas/npc-category.schema';
export declare class SettingsService implements OnModuleInit {
    private readonly settingsModel;
    private readonly npcCategoryModel;
    private readonly logger;
    private readonly defaultSettings;
    private onSettingsUpdateCb?;
    registerCallbacks(callbacks: {
        onSettingsUpdate: (username: string, settings: any) => void;
    }): void;
    constructor(settingsModel: Model<Settings>, npcCategoryModel: Model<NpcCategory>);
    onModuleInit(): Promise<void>;
    getSettingsForUser(username: string): Promise<any>;
    updateSettingsForUser(username: string, newSettings: Partial<any>): Promise<any>;
    getAllNpcCategories(): Promise<NpcCategory[]>;
    createNpcCategory(name: string, displayName: string): Promise<NpcCategory>;
    deleteNpcCategory(id: string): Promise<any>;
}
