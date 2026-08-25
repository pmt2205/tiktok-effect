import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(req: any, queryUsername?: string): Promise<any>;
    updateSettings(req: any, settings: Partial<any> & {
        username?: string;
    }, queryUsername?: string): Promise<any>;
    getMappings(): Promise<any>;
    getAllNpcCategories(): Promise<any[]>;
    createNpcCategory(name: string, displayName: string): Promise<any>;
    deleteNpcCategory(id: string): Promise<any>;
}
