import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedGiftId, setActivePreviewVideo } from '../store/user-slice';
import { Gift } from '@/types';

export function useUserEffects() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';
  const mappings = useAppSelector((state) => state.dashboard.mappings) || {};
  const customGifts = useAppSelector((state) => state.dashboard.customGifts) || [];

  const selectedGiftId = useAppSelector((state) => state.userDashboard.selectedGiftId);
  const activePreviewVideo = useAppSelector((state) => state.userDashboard.activePreviewVideo) || '';

  const selectedGift = customGifts.find((g) => g.giftId === selectedGiftId) || null;

  const openPreview = (gift: Gift) => {
    dispatch(setSelectedGiftId(gift.giftId));
    if (gift.videos && gift.videos.length > 0) {
      dispatch(setActivePreviewVideo(gift.videos[0]));
    } else {
      dispatch(setActivePreviewVideo(''));
    }
  };

  const closePreview = () => {
    dispatch(setSelectedGiftId(null));
    dispatch(setActivePreviewVideo(null));
  };

  const selectVideo = (video: string) => {
    dispatch(setActivePreviewVideo(video));
  };

  const t = {
    vi: {
      title: 'Màn hình hiệu ứng quà tặng',
      subtitle: 'Xem cấu hình video và hiệu ứng tương ứng của các quà tặng TikTok phổ biến nhất',
      coins: 'Xu',
      close: 'Đóng',
      preview: 'XEM VIDEO',
      customVideo: 'Video đã set',
      presetVideos: 'Danh sách video đã tải lên',
      activeConfig: 'Cấu hình hiện tại',
      effectType: 'Hiệu ứng',
      status: 'Trạng thái hoạt động',
      notConfigured: 'Chưa cấu hình',
      previewPlayerTitle: 'Trình xem trước video',
      noMapping: 'Mặc định (Không có video tùy chỉnh)',
    },
    en: {
      title: 'Gift Effects Visualizer',
      subtitle: 'Check configured videos and particle effects for the most popular TikTok gifts',
      coins: 'Coins',
      close: 'Close',
      preview: 'PREVIEW VIDEO',
      customVideo: 'Mapped Video',
      presetVideos: 'Uploaded Video Presets',
      activeConfig: 'Active Configuration',
      effectType: 'Effect',
      status: 'Active Status',
      notConfigured: 'Not Configured',
      previewPlayerTitle: 'Video Preview Player',
      noMapping: 'Default (No custom video)',
    }
  }[language];

  return {
    language,
    mappings,
    customGifts,
    selectedGift,
    activeVideo: activePreviewVideo,
    openPreview,
    closePreview,
    selectVideo,
    t,
  };
}
