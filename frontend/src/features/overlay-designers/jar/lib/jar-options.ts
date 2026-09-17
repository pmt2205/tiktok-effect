export const JAR_NAME_OPTIONS = [
  { id: 'pink', label: 'Kenaly Pink', src: '/jar/name_jar/teddy.png' },
  { id: 'violet', label: 'Kenaly Violet', src: '/jar/name_jar/cute.png' },
  { id: 'moon', label: 'Kenaly Moon', src: '/jar/name_jar/moon.png' },
] as const;

export const JAR_EFFECT_OPTIONS = [
  { id: 'effect-1', labelVi: 'Hiệu ứng 1', labelEn: 'Effect 1', src: '/jar/effect_jar/effect1.mp4' },
  { id: 'effect-2', labelVi: 'Hiệu ứng 2', labelEn: 'Effect 2', src: '/jar/effect_jar/effect2.mp4' },
] as const;

export const JAR_STYLE_OPTIONS = [
  { id: 'standard', nameVi: 'Mặc định', nameEn: 'Standard', preview: '/jar/jar.png' },
  { id: 'pro_1', nameVi: 'Pro 1', nameEn: 'Pro 1', preview: '/jar/jar_pro_1.png' },
  { id: 'pro_2', nameVi: 'Pro 2', nameEn: 'Pro 2', preview: '/jar/jar_pro_2.png' },
  { id: 'pro_3', nameVi: 'Pro 3', nameEn: 'Pro 3', preview: '/jar/jar_pro_3.png' },
  { id: 'pro_4', nameVi: 'Pro 4', nameEn: 'Pro 4', preview: '/jar/jar_pro_4.png' },
] as const;

export const JAR_COLOR_PRESETS = [
  { value: 'rgba(226, 179, 163, 0.85)', labelVi: 'Hồng Vàng', labelEn: 'Rose Gold' },
  { value: 'rgba(244, 155, 187, 0.85)', labelVi: 'Hồng Đậm', labelEn: 'Pink' },
  { value: 'rgba(255, 255, 255, 0.85)', labelVi: 'Bạc/Trắng', labelEn: 'Silver' },
  { value: 'rgba(0, 242, 254, 0.85)', labelVi: 'Xanh Neon', labelEn: 'Neon' },
  { value: 'rgba(255, 0, 80, 0.85)', labelVi: 'Đỏ TikTok', labelEn: 'Red' },
] as const;
