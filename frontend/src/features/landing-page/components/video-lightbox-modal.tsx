import ChromaKeyVideo from './chroma-key-video';
import type { LandingVideo } from '../types';

interface VideoLightboxModalProps { item: LandingVideo; onClose: () => void; }

export default function VideoLightboxModal({ item, onClose }: VideoLightboxModalProps) {
  return (
    <div className="modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl rounded-2xl border border-secondary/40 bg-bg-surface p-6 shadow-[0_0_50px_var(--color-secondary-glow)] animate-[fade-in-up_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <button
              onClick={() => onClose()}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-color bg-white/10 text-white hover:bg-white/20 cursor-pointer z-20"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl flex items-center justify-center">
              {item.src.includes('capy_dance') ? (
                <ChromaKeyVideo src={item.src} className="h-full w-full" />
              ) : (
                <video
                  src={item.src}
                  poster={item.poster}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-color pb-3">
              <div>
                <span className="keep-white rounded bg-secondary/20 px-2.5 py-0.5 text-xs font-extrabold text-secondary">
                  VIDEO DEMO 4K (ĐÃ XÓA PHÔNG XANH)
                </span>
                <h3 className="mt-1 font-header text-xl font-bold text-white">{item.title}</h3>
              </div>
              <span className="font-header text-sm font-bold text-primary">{item.gift}</span>
            </div>

            <p className="mt-2 text-xs text-text-muted">{item.desc}</p>
            
            <div className="mt-4 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-color/40">
              <span className="font-mono text-secondary">Đường dẫn tệp: {item.src}</span>
              <span className="text-success font-bold">✓ Sẵn Sàng Thay Thế MP4</span>
            </div>
          </div>
        </div>
  );
}
