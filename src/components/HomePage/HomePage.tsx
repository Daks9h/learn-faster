import React, { useState, useEffect, Suspense } from 'react';
import { HomePageFallback } from './HomePageFallback';
import { ScreenTab } from '../../types';

// Lazy-load 3D canvas so three.js, @react-three/fiber, and @react-three/drei
// are isolated strictly in their own chunk and NOT in any other route's bundle.
const HomePageCanvas = React.lazy(() => import('./HomePageCanvas'));

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

interface HomePageProps {
  onNavigate: (tab: ScreenTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [use2D, setUse2D] = useState<boolean>(() => checkShouldUse2DFallback());
  const [isVisible, setIsVisible] = useState(true);

  // Resize listener for 768px breakpoint check
  useEffect(() => {
    const handleResize = () => {
      setUse2D(checkShouldUse2DFallback());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tab visibility performance guardrail: pause rendering when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-60px)] overflow-hidden relative">
      {use2D ? (
        <HomePageFallback onNavigate={onNavigate} />
      ) : (
        <Suspense fallback={<HomePageFallback onNavigate={onNavigate} />}>
          <HomePageCanvas 
            isVisible={isVisible} 
            onNavigate={onNavigate} 
          />
        </Suspense>
      )}
    </div>
  );
};
