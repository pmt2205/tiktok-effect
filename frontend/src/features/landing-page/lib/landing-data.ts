import type { LandingVideo } from '../types';

export const DEMO_TABS = [
  { id: 'all', label: 'Tất cả Demo', icon: 'fa-table-cells' },
  { id: 'video', label: 'Video Hiệu Ứng (Hover/Click 4K)', icon: 'fa-film' },
  { id: 'jar', label: 'Hũ Quà & Cây Quà 3D', icon: 'fa-jar' },
  { id: 'topgifter', label: 'Vinh Danh Top Gifter VIP', icon: 'fa-trophy' },
  { id: 'frame', label: 'Khung Menu Quà OBS', icon: 'fa-layer-group' },
] as const;

export const WORKFLOW_STEPS = [
  { step: '01', title: 'Kết Nối TikTok Live', desc: 'Nhập Username TikTok của bạn vào Dashboard. Hệ thống tự động phát hiện khi bạn bắt đầu phát livestream.' },
  { step: '02', title: 'Cấu Hình Hiệu Ứng', desc: 'Chọn các mẫu Hũ Quà 3D, gán Video/Âm thanh tương ứng với từng loại gift hoặc tùy chỉnh theo sở thích.' },
  { step: '03', title: 'Mở Overlay Trên OBS', desc: 'Sao chép đường dẫn Browser Source và dán vào OBS Studio. Bạn đã sẵn sàng bùng nổ tương tác!' },
] as const;

// Demo Media Items — Video Effects Grid (User can swap MP4 files easily)
export const demoVideos: LandingVideo[] = [
  { id: 'video-user-1', title: 'Hiệu Ứng User Dance 01', src: '/videouser/usertest1.mp4', poster: '/space-bg.png', gift: 'Video User 01', badge: 'User Effect 01', desc: 'Video hiệu ứng người dùng tùy chỉnh dành cho TikTok Live.' },
  { id: 'video-user-2', title: 'Hiệu Ứng User Dance 02', src: '/videouser/usertest2.mp4', poster: '/space-bg.png', gift: 'Video User 02', badge: 'User Effect 02', desc: 'Video hiệu ứng người dùng tùy chỉnh dành cho TikTok Live.' },
  { id: 'video-user-3', title: 'Hiệu Ứng User Dance 03', src: '/videouser/usertest3.mp4', poster: '/space-bg.png', gift: 'Video User 03', badge: 'User Effect 03', desc: 'Video hiệu ứng người dùng tùy chỉnh dành cho TikTok Live.' },
  { id: 'video-user-4', title: 'Hiệu Ứng User Dance 04', src: '/videouser/usertest4.mp4', poster: '/space-bg.png', gift: 'Video User 04', badge: 'User Effect 04', desc: 'Video hiệu ứng người dùng tùy chỉnh dành cho TikTok Live.' },
  { id: 'video-user-5', title: 'Hiệu Ứng User Dance 05', src: '/videouser/usertest5.mp4', poster: '/space-bg.png', gift: 'Video User 05', badge: 'User Effect 05', desc: 'Video hiệu ứng người dùng tùy chỉnh dành cho TikTok Live.' },
  { id: 'video-capy-1', title: 'Capybara Dance Effect', src: '/dance/capy_dance.mp4', poster: '/space-bg.png', gift: 'Capybara Dance', badge: 'Capybara', desc: 'Hiệu ứng Capybara nhảy vui nhộn trên overlay.' },
];

export const demoJars = [
  { id: 'jar-custom-1', title: 'Hũ Mèo Hồng Custom', category: 'jar', src: '/jar/jar_custom/jar_ct1/jar.png', badge: 'Custom Jar', desc: 'Hũ quà mèo hồng nhiều lớp với nơ, pha lê và phụ kiện dễ thương dành cho hiệu ứng quà rơi.' },
  { id: 'jar-decoration-2', title: 'Viền Mây Trái Tim', category: 'jar', src: '/jar/decoration/jar_pro_2_decoration.png', badge: 'Decoration', desc: 'Mây, sao và trái tim trong suốt bao quanh hũ quà.' },
  { id: 'jar-decoration-3', title: 'Viền Pha Lê Sao', category: 'jar', src: '/jar/decoration/jar_pro_3_decoration.png', badge: 'Decoration', desc: 'Dây pha lê và ngôi sao lấp lánh phủ quanh hũ thường.' },
  { id: 'jar-decoration-4', title: 'Viền Thỏ Pha Lê', category: 'jar', src: '/jar/decoration/jar_pro_4_decoration.png', badge: 'Decoration', desc: 'Viền thỏ, ngọc trai và trái tim dành cho hũ quà.' },
  { id: 'tree-1', title: 'Cây Quà Tích Lũy', category: 'jar', src: '/tree/tree.png', badge: 'Tree Effect', desc: 'Mô hình Cây Quà tự động nở hoa theo tổng xu tích lũy phiên live.' },
  { id: 'tree-2', title: 'Cây Quà Tích Lũy 3D', category: 'jar', src: '/tree/tree_pro.png', badge: 'Tree Effect', desc: 'Mô hình Cây Quà tự động nở hoa theo tổng xu tích lũy phiên live.' },
];

// Menu Frames (Khung Menu Quà OBS)
export const demoMenuFrames = [
  { id: 'frame-1', title: 'Khung Menu Hoàng Gia Vàng Kim', category: 'frame', src: '/frame/khung1.png', badge: 'Menu Vàng 24K', desc: 'Bảng khung hiển thị danh sách quà & bảng giá streamer phong cách hoàng gia.' },
  { id: 'frame-vuongmien', title: 'Khung Menu Vương Miện VIP', category: 'frame', src: '/frame/vuongmien.png', badge: 'Menu Vương Miện', desc: 'Khung đính vương miện đính đá sang trọng hiển thị danh sách gift.' },
  { id: 'frame-kpop', title: 'Khung Menu Sân Sấu Neon K-Pop', category: 'frame', src: '/frame/kpop.png', badge: 'Menu Neon', desc: 'Khung bảng quà phong cách concert K-Pop hiện đại rực rỡ.' },
  { id: 'frame-vang', title: 'Khung Menu Hào Quang Vàng', category: 'frame', src: '/frame/vang.png', badge: 'Menu Glow', desc: 'Khung hào quang lấp lánh trình bày bảng danh sách quà trên livestream.' },
  { id: 'frame-may', title: 'Khung Menu Mây Trắng Cute', category: 'frame', src: '/frame/may.png', badge: 'Menu Cute', desc: 'Khung mây trắng xinh xắn dễ thương cho phiên live tương tác.' },
];

export const features = [
  { icon: 'fa-wand-magic-sparkles', title: 'Hiệu Ứng Quà Thời Gian Thực', text: 'Tự động kích hoạt video MP4 4K & âm thanh MP3 cực phiêu ngay khi viewer tặng gift trên TikTok Live.' },
  { icon: 'fa-jar', title: 'Hũ Quà & Cây Quà 3D Tích Lũy', text: 'Mọi món gift rơi tự nhiên vào hũ quà 3D chân thực. Cây quà tự động lớn dần theo mốc tích lũy.' },
  { icon: 'fa-crown', title: 'Vinh Danh Top Gifter Thời Gian Thực', text: 'Bảng xếp hạng & khung đại diện Top 1, Top 2, Top 3 tự động cập nhật với hiệu ứng ánh kim lấp lánh.' },
  { icon: 'fa-volume-high', title: 'TTS Đọc Tên Viewer & Gift AI', text: 'Giọng đọc AI tự nhiên công bố người tặng quà, chúc mừng viewer và tăng tương tác tức thì.' },
  { icon: 'fa-sliders', title: 'Điều Chỉnh Trực Tiếp Zero-Reload', text: 'Thay đổi vị trí, kích thước, hiệu ứng ngay trên Dashboard mà không tốn công dựng lại OBS Scene.' },
  { icon: 'fa-bolt', title: 'Siêu Nhẹ & Tối Ưu OBS Studio', text: 'Kết nối qua Browser Source với độ trễ < 50ms, không tốn tài nguyên CPU/GPU máy tính streamer.' },
];

export const plans = [
  {
    name: 'Gói Thường',
    price: 'Miễn phí',
    note: 'Thích hợp cho streamer mới bắt đầu trải nghiệm phiên live gọn nhẹ',
    accent: 'secondary',
    features: ['5 gift kích hoạt hiệu ứng video', 'Menu quà tối đa 5 gift', 'Hũ quà cơ bản', 'Không bao gồm Cây Quà', 'Cập nhật thời gian thực < 100ms'],
  },
  {
    name: 'Gói Pro',
    price: '99K',
    period: 'lần đầu',
    renewalPrice: '49K/tháng',
    note: 'Dành cho streamer live chuyên nghiệp thường xuyên',
    accent: 'primary',
    features: [
      '10 gift hiệu ứng custom video & sound',
      'Được chọn toàn bộ kiểu Hũ Quà',
      'Cây Quà cơ bản',
      'Menu quà tối đa 10 gift',
      'Hỗ trợ kỹ thuật 24/7',
    ],
  },
  {
    name: 'Gói Pro Max',
    price: '299K',
    period: 'lần đầu',
    renewalPrice: '149K/tháng',
    note: 'Giải pháp toàn diện nhất cho Streamer & MCN chuyên nghiệp',
    accent: 'mixed',
    popular: true,
    features: [
      'Không giới hạn số lượng gift & hiệu ứng',
      'Full tùy chọn Hũ Quà 3D, Cây Quà & Bảng Tên',
      'Tải video & âm thanh custom riêng',
      'TTS AI chuẩn giọng vùng miền',
      'Vinh danh Top Gifter & Tap-tap Counter',
      'Ưu tiên dựng Hũ Quà & Video 3D theo yêu cầu',
    ],
  },
];

export const faqs = [
  {
    q: 'TikTok Live Effect kết nối với OBS Studio như thế nào?',
    a: 'Bạn chỉ cần copy đường dẫn URL Browser Source duy nhất từ Dashboard và dán vào phần Browser Source trong OBS Studio. Mọi tùy chỉnh giao diện sẽ tự động đồng bộ tức thì.',
  },
  {
    q: 'Trình overlay có gây giật lag hay giảm FPS khi đang chơi game không?',
    a: 'Hoàn toàn không! Mọi xử lý hiệu ứng được tối ưu hóa GPU trang web với dung lượng cực nhẹ, không ảnh hưởng đến hiệu năng game hay luồng stream của bạn.',
  },
  {
    q: 'Tôi có thể tải video MP4 hoặc âm thanh MP3 cá nhân lên không?',
    a: 'Có! Hệ thống hỗ trợ tải video MP4, WebM (nền trong suốt) và tệp âm thanh MP3/WAV cá nhân để bạn tự do tạo dấu ấn riêng cho kênh livestream.',
  },
  {
    q: 'Tôi muốn đặt thiết kế hũ quà 3D hoặc video hiệu ứng riêng thì làm thế nào?',
    a: 'Chúng tôi nhận thiết kế hũ quà 3D mang thương hiệu cá nhân và dựng video hiệu ứng theo yêu cầu. Bạn chỉ cần liên hệ Hotline/Zalo 0795 533 253 để được hỗ trợ tức thì.',
  },
];
