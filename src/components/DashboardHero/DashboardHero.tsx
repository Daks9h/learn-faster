import React, { useState, useEffect, useRef, Suspense } from 'react';
import { DashboardHeroFallback } from './DashboardHeroFallback';

// Lazy-load 3D canvas so three.js, @react-three/fiber, and @react-three/drei
// are isolated in their own chunk and NOT in any other route's bundle.
const DashboardHeroCanvas = React.lazy(() => import('./DashboardHeroCanvas'));

function checkShouldUse2DFallback(): boolean {
  if (typeof window === 'undefined') return true;

  // 1. Prefers reduced motion
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
  } catch {}

  // 2. Viewport under 768px (mobile)
  if (window.innerWidth < 768) {
    return true;
  }

  // 3. Hardware concurrency <= 4
  if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return true;
  }

  // 4. Device memory <= 4 (where available)
  const nav = navigator as any;
  if (nav && typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) {
    return true;
  }

  // 5. WebGL availability check
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true;
  } catch {
    return true;
  }

  return false;
}

interface DashboardHeroProps {
  onScrollToContent?: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ onScrollToContent }) => {
  const [use2D, setUse2D] = useState<boolean>(() => checkShouldUse2DFallback());
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize listener for 768px breakpoint check
  useEffect(() => {
    const handleResize = () => {
      setUse2D(checkShouldUse2DFallback());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver performance guardrail:
  // When less than ~10% visible, pause rendering.
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.1);
      },
      {
        threshold: [0, 0.1, 0.5, 1.0],
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Tab visibility performance guardrail: pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else if (containerRef.current) {
        // Re-check bounding box
        const rect = containerRef.current.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        setIsVisible(inView);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleScroll = () => {
    if (onScrollToContent) {
      onScrollToContent();
      return;
    }
    const target = document.getElementById('scholar-profile');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-screen relative left-1/2 -translate-x-1/2 -mt-6 mb-8"
      style={{ minHeight: 'calc(100vh - 60px)' }}
    >
      {use2D ? (
        <DashboardHeroFallback onScrollToContent={handleScroll} />
      ) : (
        <Suspense fallback={<DashboardHeroFallback onScrollToContent={handleScroll} />}>
          <DashboardHeroCanvas 
            isVisible={isVisible} 
            onScrollToContent={handleScroll} 
          />
        </Suspense>
      )}
    </div>
  );
};
