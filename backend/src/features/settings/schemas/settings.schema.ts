import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Settings extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, default: 5 })
  duration: number;

  @Prop({ required: true, default: 2 })
  density: number;

  @Prop({ required: true, default: 'neon-pulse' })
  theme: string;



  @Prop({ required: true, default: 'single' })
  liveMode: string;

  @Prop({ required: true, default: 'anime' })
  activeNpcCategory: string;

  @Prop({ required: true, default: false })
  menuEnabled: boolean;

  @Prop({ required: true, default: 'MENU QUÀ TẶNG' })
  menuTitle: string;

  @Prop({ required: true, default: 15 })
  menuX: number;

  @Prop({ required: true, default: 20 })
  menuY: number;

  @Prop({ required: true, default: 1.0 })
  menuScale: number;

  @Prop({ required: true, default: 1 })
  menuColumns: number;

  @Prop({ required: true, default: 'vertical' })
  menuLayout: string;

  @Prop({ required: true, default: '' })
  menuFrame: string;

  @Prop({ required: true, default: 1.0 })
  menuFrameScale: number;

  @Prop({ required: true, default: 5 })
  menuScrollThreshold: number;

  @Prop({ required: true, default: false })
  jarEnabled: boolean;

  @Prop({ required: true, default: 75 })
  jarX: number;

  @Prop({ required: true, default: 50 })
  jarY: number;

  @Prop({ required: true, default: 1.0 })
  jarScale: number;

  @Prop({ required: true, default: 0 })
  jarClearedAt: number;

  @Prop({ required: true, default: 1.0 })
  jarGiftSize: number;

  @Prop({ required: true, default: 1.0 })
  jarFallSpeed: number;

  @Prop({ required: true, default: 'standard' })
  jarType: string;

  @Prop({ required: true, default: 'silver' })
  jarColor: string;

  @Prop({ required: true, default: true })
  jarDanceEnabled: boolean;

  @Prop({ required: true, default: 'left' })
  jarDancePosition: string;

  @Prop({ required: true, default: 1.0 })
  jarDanceScale: number;

  @Prop({ required: true, default: 185 })
  jarDanceOffsetX: number;

  @Prop({ required: true, default: '/dance/capy_dance.mp4' })
  jarDanceVideo: string;

  @Prop({ required: true, default: true })
  singleEnabled: boolean;

  @Prop({ required: true, default: true })
  npcEnabled: boolean;

  @Prop({ required: true, default: true })
  videoEnabled: boolean;

  @Prop({ required: true, default: true })
  soundEnabled: boolean;

  @Prop({ required: true, default: false })
  treeEnabled: boolean;

  @Prop({ required: true, default: 'standard' })
  treeType: string;

  @Prop({ required: true, default: 'tree.png' })
  treeImage: string;

  @Prop({ required: true, default: 20 })
  treeX: number;

  @Prop({ required: true, default: 50 })
  treeY: number;

  @Prop({ required: true, default: 1.0 })
  treeScale: number;

  @Prop({ required: true, default: 1.0 })
  treeGiftSize: number;

  @Prop({ required: true, default: 0 })
  treeClearedAt: number;

  @Prop({ required: true, default: false })
  treeDebug: boolean;

  @Prop({ required: true, default: true })
  ttsEnabled: boolean;

  @Prop({ required: true, default: 'auto' })
  ttsVoice: string;

  @Prop({ required: true, default: 1.0 })
  ttsRate: number;

  @Prop({ required: true, default: 1.0 })
  ttsPitch: number;

  @Prop({ required: true, default: 1.0 })
  ttsVolume: number;

  @Prop({ required: true, default: '{nickname} nói: {comment}' })
  ttsTemplate: string;

  @Prop({ required: true, default: 100 })
  ttsMaxChars: number;

  @Prop({ required: true, default: true })
  ttsFilterEmoji: boolean;

  @Prop({ required: true, default: true })
  ttsFilterBadWords: boolean;

  @Prop({ required: true, default: 'all' })
  ttsMode: string;

  @Prop({ required: true, default: true })
  topGifterEnabled: boolean;

  @Prop({ required: true, default: 4 })
  topGifterDuration: number;

  @Prop({ required: true, default: 5 })
  topGifterRankLimit: number;

  @Prop({ required: true, default: 1 })
  topGifterMinDiamonds: number;

  @Prop({ required: true, default: true })
  likeLeaderboardEnabled: boolean;

  @Prop({ required: true, default: 'BXH TAP TAY ❤️' })
  likeLeaderboardTitle: string;

  @Prop({ required: true, default: 78 })
  likeLeaderboardX: number;

  @Prop({ required: true, default: 15 })
  likeLeaderboardY: number;

  @Prop({ required: true, default: 1.0 })
  likeLeaderboardScale: number;

  @Prop({ required: true, default: 3 })
  likeLeaderboardTopCount: number;

  @Prop({ required: true, default: 0 })
  likeLeaderboardResetAt: number;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);


