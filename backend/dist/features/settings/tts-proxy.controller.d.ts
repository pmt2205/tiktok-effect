import { Response } from 'express';
export declare class TtsProxyController {
    getGoogleTts(text: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
