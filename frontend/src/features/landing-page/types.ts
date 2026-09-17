export interface LandingImage {
  src: string;
  title: string;
  desc: string;
}

export interface LandingVideo extends LandingImage {
  id: string;
  gift: string;
  badge: string;
  poster?: string;
}
