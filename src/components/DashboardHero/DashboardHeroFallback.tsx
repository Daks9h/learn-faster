import React from 'react';
import { ChevronDown, ArrowDown } from 'lucide-react';

interface DashboardHeroFallbackProps {
  onScrollToContent: () => void;
}

export const DashboardHeroFallback: React.FC<DashboardHeroFallbackProps> = ({ onScrollToContent }) => {
  return (
    <div 
      className="relative w-full h-[calc(100vh-60px)] min-h-[580px] max-h-[960px] overflow-hidden flex flex-col items-center justify-between select-none"
      style={{
        background: 'radial-gradient(ellipse 90% 55% at 50% 100%, rgba(145, 50, 65, 0.42) 0%, rgba(55, 20, 75, 0.3) 40%, rgba(11, 10, 20, 0.95) 80%, #0b0a14 100%)',
      }}
    >
      {/* 1. LAYERED CSS STARFIELD */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 45px 35px, #fff, transparent),
            radial-gradient(1.5px 1.5px at 120px 180px, #ffdfba, transparent),
            radial-gradient(1px 1px at 260px 85px, #fff, transparent),
            radial-gradient(1px 1px at 340px 220px, #d4bbff, transparent),
            radial-gradient(2px 2px at 480px 140px, #fff, transparent),
            radial-gradient(1px 1px at 580px 310px, #ffeedd, transparent),
            radial-gradient(1.5px 1.5px at 720px 90px, #fff, transparent),
            radial-gradient(1px 1px at 840px 240px, #e2d4ff, transparent),
            radial-gradient(2px 2px at 980px 160px, #fff, transparent),
            radial-gradient(1px 1px at 1120px 290px, #ffd1b3, transparent)
          `,
          backgroundSize: '360px 360px',
        }}
      />

      {/* 2. FAINT WARM HORIZON GLOW (Matching Learn with Jason) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 90%, rgba(201, 129, 60, 0.25) 0%, rgba(135, 55, 64, 0.18) 50%, transparent 100%)',
        }}
      />

      {/* 3. CENTERPIECE LOW-POLY ILLUSTRATION (SVG) */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none z-10">
        <svg
          viewBox="0 0 800 600"
          className="w-full max-w-2xl max-h-[65vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          aria-hidden="true"
        >
          <defs>
            {/* Asteroid gradient glow */}
            <radialGradient id="asteroidGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c9813c" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#63245c" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0b0a14" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rocketBodyL" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e2dcf2" />
              <stop offset="100%" stopColor="#b3abc8" />
            </linearGradient>
            <linearGradient id="rocketRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e63946" />
              <stop offset="100%" stopColor="#9d1a24" />
            </linearGradient>
          </defs>

          {/* Ambient Glow Aura */}
          <circle cx="400" cy="460" r="280" fill="url(#asteroidGlow)" />

          {/* BACK HALF OF DEBRIS RING */}
          <g opacity="0.6">
            <polygon points="180,380 185,372 192,376 188,385" fill="#c9813c" />
            <polygon points="220,360 226,355 230,362 224,366" fill="#8c7e99" />
            <polygon points="270,345 278,340 282,348 274,352" fill="#d98f48" />
            <polygon points="320,335 325,330 330,336 324,340" fill="#a59cb0" />
            <polygon points="480,335 486,330 492,336 485,340" fill="#c9813c" />
            <polygon points="530,345 538,340 542,347 535,352" fill="#d98f48" />
            <polygon points="580,360 586,355 592,362 584,367" fill="#8c7e99" />
            <polygon points="620,380 626,373 634,378 628,386" fill="#c9813c" />
          </g>

          {/* PURPLE FACETED ASTEROID (Polygonal Low-Poly Sphere) */}
          <g id="asteroid">
            {/* Center & Top facets */}
            <polygon points="400,320 460,350 400,380 340,350" fill="#4d3566" />
            <polygon points="400,320 470,300 460,350" fill="#583c74" />
            <polygon points="400,320 330,300 340,350" fill="#3f2b54" />
            
            {/* Mid facets */}
            <polygon points="460,350 540,360 500,420 400,380" fill="#3b2650" />
            <polygon points="340,350 400,380 300,420 260,360" fill="#4a3162" />
            <polygon points="400,380 500,420 400,480 300,420" fill="#342048" />
            
            {/* Outer flanks */}
            <polygon points="470,300 550,320 540,360 460,350" fill="#462f5e" />
            <polygon points="330,300 250,320 260,360 340,350" fill="#35224a" />
            <polygon points="540,360 610,410 570,470 500,420" fill="#2d1a3e" />
            <polygon points="260,360 190,410 230,470 300,420" fill="#3e2756" />

            {/* Bottom bulk */}
            <polygon points="500,420 570,470 480,560 400,480" fill="#241434" />
            <polygon points="300,420 400,480 320,560 230,470" fill="#2f1c44" />
            <polygon points="400,480 480,560 400,600 320,560" fill="#1c0e2a" />
            <polygon points="570,470 610,530 480,560" fill="#1e102c" />
            <polygon points="230,470 190,530 320,560" fill="#261538" />
          </g>

          {/* LOW-POLY ROCKET */}
          <g id="rocket" transform="translate(0, -10)">
            {/* Struts / Landing Legs */}
            {/* Left leg */}
            <polygon points="355,300 330,335 340,340 365,305" fill="#716785" />
            <polygon points="330,335 320,345 342,345 340,340" fill="#4f4660" />
            {/* Right leg */}
            <polygon points="445,300 470,335 460,340 435,305" fill="#9187a5" />
            <polygon points="470,335 480,345 458,345 460,340" fill="#675d7c" />

            {/* Engine nozzle & Red Tail Section */}
            <polygon points="380,320 420,320 415,330 385,330" fill="#221832" />
            <polygon points="370,270 430,270 425,320 375,320" fill="url(#rocketRed)" />
            <polygon points="395,270 405,270 405,320 395,320" fill="#b82430" />

            {/* Rocket Center Fuselage */}
            <polygon points="375,170 425,170 430,270 370,270" fill="url(#rocketBodyL)" />
            <polygon points="375,170 400,165 400,270 370,270" fill="#ffffff" />
            <polygon points="400,165 425,170 430,270 400,270" fill="#cfc8de" />

            {/* Nose Cone */}
            <polygon points="400,105 375,170 400,165" fill="#f04a57" />
            <polygon points="400,105 400,165 425,170" fill="#b82430" />
            <circle cx="400" cy="104" r="3.5" fill="#e63946" />

            {/* Porthole Windows */}
            <circle cx="400" cy="195" r="14" fill="#584c70" />
            <circle cx="400" cy="195" r="11" fill="#7dd3fc" />
            <circle cx="397" cy="192" r="3.5" fill="#ffffff" />

            {/* Access Ladder */}
            <line x1="395" y1="280" x2="395" y2="340" stroke="#f3effa" strokeWidth="2" />
            <line x1="405" y1="280" x2="405" y2="340" stroke="#f3effa" strokeWidth="2" />
            <line x1="395" y1="290" x2="405" y2="290" stroke="#f3effa" strokeWidth="2" />
            <line x1="395" y1="305" x2="405" y2="305" stroke="#f3effa" strokeWidth="2" />
            <line x1="395" y1="320" x2="405" y2="320" stroke="#f3effa" strokeWidth="2" />
            <line x1="395" y1="335" x2="405" y2="335" stroke="#f3effa" strokeWidth="2" />
          </g>

          {/* FRONT HALF OF DEBRIS RING (Overlapping the Asteroid) */}
          <g>
            <polygon points="120,440 132,430 138,442 126,450" fill="#c9813c" />
            <polygon points="160,460 170,452 176,462 165,470" fill="#e2964e" />
            <polygon points="210,480 222,472 228,485 215,492" fill="#8f819d" />
            <polygon points="260,500 274,490 282,504 268,512" fill="#c9813c" />
            <polygon points="320,520 332,510 340,524 326,532" fill="#d98f48" />
            <polygon points="380,535 392,525 400,538 386,546" fill="#a89db4" />
            <polygon points="440,532 454,524 460,536 448,544" fill="#c9813c" />
            <polygon points="500,515 514,505 522,518 506,528" fill="#e2964e" />
            <polygon points="560,490 574,480 580,494 566,502" fill="#8f819d" />
            <polygon points="620,465 632,455 640,468 626,476" fill="#c9813c" />
            <polygon points="670,440 682,430 688,442 675,450" fill="#d98f48" />
            {/* Small fine debris particles */}
            <circle cx="145" cy="450" r="3" fill="#c9813c" />
            <circle cx="190" cy="475" r="2.5" fill="#f3effa" />
            <circle cx="240" cy="495" r="3.5" fill="#d98f48" />
            <circle cx="295" cy="515" r="2" fill="#a89db4" />
            <circle cx="355" cy="530" r="3" fill="#c9813c" />
            <circle cx="415" cy="540" r="2.5" fill="#ffffff" />
            <circle cx="475" cy="528" r="3" fill="#c9813c" />
            <circle cx="535" cy="505" r="2.5" fill="#d98f48" />
            <circle cx="595" cy="480" r="3.5" fill="#a89db4" />
            <circle cx="645" cy="455" r="2" fill="#c9813c" />
          </g>
        </svg>
      </div>

      {/* 4. REAL HTML OVERLAY TYPOGRAPHY (Learn with Jason style) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-8 sm:pt-14 flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
          <h1 
            className="font-display font-black text-6xl sm:text-8xl md:text-9xl text-[#c9813c] leading-none tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            style={{ letterSpacing: '-0.04em' }}
          >
            Learn
          </h1>
          <span 
            className="font-display font-light text-3xl sm:text-5xl md:text-6xl text-[#e2d8f0]/85 tracking-wide"
            style={{ letterSpacing: '-0.02em' }}
          >
            Faster
          </span>
        </div>

        <p className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base md:text-lg text-[#a39cb8] font-sans font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Autonomous lecture synthesis, predictive exam radar, and active recall combat arenas.
        </p>

        {/* Action CTA Button */}
        <div className="mt-6 sm:mt-8 flex items-center gap-3">
          <button
            onClick={onScrollToContent}
            className="px-6 py-3 rounded-xl bg-[#c9813c] hover:bg-[#b57130] text-white font-display font-black text-sm sm:text-base border-2 border-white/30 shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer pointer-events-auto"
          >
            <span>OPEN DASHBOARD</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. SCROLL INDICATOR CUE AT BOTTOM */}
      <div className="relative z-20 mb-3 flex flex-col items-center gap-1 text-[#a39cb8] pointer-events-auto cursor-pointer" onClick={onScrollToContent}>
        <span className="font-mono text-[11px] tracking-widest uppercase font-bold text-[#c9813c]">
          Scroll to view
        </span>
        <ChevronDown className="w-5 h-5 text-[#c9813c] animate-bounce" />
      </div>

      {/* 6. GRADIENT FADE JOIN INTO THE DASHBOARD PAGE (~120px) */}
      <div 
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-15"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(11, 10, 20, 0.6) 50%, #0b0a14 100%)',
        }}
      />
    </div>
  );
};
