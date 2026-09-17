import Image from 'next/image';
import type { LandingImage } from '../types';

interface ImageLightboxModalProps { item: LandingImage; onClose: () => void; }

export default function ImageLightboxModal({ item, onClose }: ImageLightboxModalProps) {
  return (
    <div className="modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border-color bg-bg-surface p-6 shadow-2xl animate-[fade-in-up_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <button
              onClick={() => onClose()}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-color bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/60 p-4">
              <Image src={item.src} alt={item.title} fill className="object-contain" />
            </div>
            <h3 className="mt-4 font-header text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{item.desc}</p>
          </div>
        </div>
  );
}

