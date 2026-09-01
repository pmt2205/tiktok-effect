import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('api/tts')
export class TtsProxyController {
  @Get('google')
  async getGoogleTts(
    @Query('text') text: string,
    @Res() res: Response,
  ) {
    if (!text || !text.trim()) {
      return res.status(400).send('Text parameter is required');
    }
    try {
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=vi&client=tw-ob`;
      const response = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });

      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch audio from Google TTS');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } catch (err: any) {
      return res.status(500).send(err.message || 'TTS Error');
    }
  }
}
