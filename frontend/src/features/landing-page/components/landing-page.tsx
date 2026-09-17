'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DemoShowcaseSection from './demo-showcase-section';
import FaqSection from './faq-section';
import CustomDesignBanner from './custom-design-banner';
import FeaturesSection from './features-section';
import LandingBackground from './landing-background';
import LandingCta from './landing-cta';
import LandingFooter from './landing-footer';
import LandingHeader from './landing-header';
import LandingHero from './landing-hero';
import PricingSection from './pricing-section';
import WorkflowSection from './workflow-section';
import type { LandingImage, LandingVideo } from '../types';

const ImageLightboxModal = dynamic(() => import('./image-lightbox-modal'));
const VideoLightboxModal = dynamic(() => import('./video-lightbox-modal'));

export default function LandingPage() {
  const [isLightMode, setIsLightMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('light-mode'),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [lightboxImage, setLightboxImage] = useState<LandingImage | null>(null);
  const [lightboxVideo, setLightboxVideo] = useState<LandingVideo | null>(null);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('light-mode');
      localStorage.setItem('theme_preference', 'dark');
      setIsLightMode(false);
    } else {
      root.classList.add('light-mode');
      localStorage.setItem('theme_preference', 'light');
      setIsLightMode(true);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-bg-dark text-text-main transition-colors duration-300">
      <LandingBackground />

      <LandingHeader
        isLightMode={isLightMode}
        mobileMenuOpen={mobileMenuOpen}
        onToggleTheme={toggleTheme}
        onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      <LandingHero />

      <CustomDesignBanner />

      <DemoShowcaseSection onOpenImage={setLightboxImage} onOpenVideo={setLightboxVideo} />

      <FeaturesSection />

      <WorkflowSection />

      <PricingSection />

      <FaqSection />

      <LandingCta />

      {lightboxImage && <ImageLightboxModal item={lightboxImage} onClose={() => setLightboxImage(null)} />}

      {lightboxVideo && <VideoLightboxModal item={lightboxVideo} onClose={() => setLightboxVideo(null)} />}

      <LandingFooter />
    </main>
  );
}
