import React from 'react';
import { DashboardHeroFallback } from './DashboardHeroFallback';

interface DashboardHeroCanvasProps {
  isVisible: boolean;
  onScrollToContent: () => void;
}

// Stage 3 stub; implemented with Three.js / R3F low-poly scene in Stage 4
export const DashboardHeroCanvas: React.FC<DashboardHeroCanvasProps> = ({ onScrollToContent }) => {
  return <DashboardHeroFallback onScrollToContent={onScrollToContent} />;
};

export default DashboardHeroCanvas;
