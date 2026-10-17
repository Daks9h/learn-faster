import React from 'react';
import { ArrowRight, Compass, Radar } from 'lucide-react';
import { ScreenTab } from '../../types';

interface HomePageFallbackProps {
  onNavigate: (tab: ScreenTab) => void;
}

export const HomePageFallback: React.FC<HomePageFallbackProps> = ({ onNavigate }) => {
  return (
    <div 
      className="relative w-full h-[calc(100vh-60px)] overflow-hidden flex flex-col items-center justify-between select-none"
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
            
            {/* Bottom facets */}
            <polygon points="500,420 570,470 510,540 400,530" fill="#221330" />
            <polygon points="300,420 400,480 400,530 270,520" fill="#29163a" />
            <polygon points="400,480 500,420 400,530" fill="#251433" />
            <polygon points="230,470 300,420 270,520 200,510" fill="#1b0f27" />
          </g>

          {/* ROCKET STANDING ON ASTEROID */}
          <g id="rocket" transform="translate(400, 240)">
            {/* Rocket Landing Fins / Struts */}
            {/* Left fin */}
            <polygon points="-35,30 -58,75 -46,78 -24,40" fill="#6d6380" />
            <polygon points="-58,75 -65,77 -55,82 -46,78" fill="#473f56" />
            {/* Right fin */}
            <polygon points="35,30 58,75 46,78 24,40" fill="#9389a8" />
            <polygon points="58,75 65,77 55,82 46,78" fill="#645b75" />
            {/* Back fin */}
            <polygon points="0,32 -6,72 6,72 0,32" fill="#524962" />

            {/* Dark Engine Nozzle */}
            <polygon points="-16,56 16,56 12,68 -12,68" fill="#191322" />

            {/* Red Booster Base */}
            <polygon points="-30,16 30,16 28,56 -28,56" fill="url(#rocketRed)" />
            <polygon points="-30,16 0,16 0,56 -28,56" fill="#ba2833" />
            <polygon points="0,16 30,16 28,56 0,56" fill="#e63946" />

            {/* Main Fuselage Body */}
            <polygon points="-18,-54 18,-54 30,16 -30,16" fill="url(#rocketBodyL)" />
            {/* Shading panels on fuselage */}
            <polygon points="-18,-54 0,-54 0,16 -30,16" fill="#cfc8de" />
            <polygon points="0,-54 18,-54 30,16 0,16" fill="#ffffff" />

            {/* Porthole Cockpit Window */}
            <circle cx="0" cy="-14" r="10" fill="#887e97" />
            <circle cx="0" cy="-14" r="8" fill="#38bdf8" />
            <circle cx="-2" cy="-16" r="3" fill="#ffffff" opacity="0.6" />

            {/* Red Nose Cone Tip */}
            <polygon points="0,-102 -18,-54 18,-54" fill="url(#rocketRed)" />
            <polygon points="0,-102 -18,-54 0,-54" fill="#ba2833" />
            <polygon points="0,-102 0,-54 18,-54" fill="#e63946" />
            <circle cx="0" cy="-102" r="3" fill="#e63946" />

            {/* Access ladder rungs */}
            <line x1="-3" y1="24" x2="3" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="-3" y1="34" x2="3" y2="34" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="-3" y1="44" x2="3" y2="44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* FRONT HALF OF DEBRIS RING */}
          <g>
            <polygon points="140,430 152,420 160,428 148,438" fill="#c9813c" />
            <polygon points="200,460 212,450 220,462 208,472" fill="#d98f48" />
            <polygon points="260,490 274,482 284,494 270,504" fill="#8c7e99" />
            <polygon points="340,515 352,508 360,518 348,528" fill="#c9813c" />
            <polygon points="440,520 454,510 464,522 450,534" fill="#e2964e" />
            <polygon points="520,500 534,492 542,504 528,514" fill="#aba0b5" />
            <polygon points="600,470 614,460 622,472 608,482" fill="#c9813c" />
            <polygon points="660,440 672,430 682,442 670,452" fill="#d98f48" />
          </g>
        </svg>
      </div>

      {/* 4. REAL HTML OVERLAY TYPOGRAPHY (Learn with Jason style) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-10 sm:pt-16 flex flex-col items-center sm:items-start text-center sm:text-left pointer-events-none">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 pointer-events-auto">
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

        <p className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base md:text-lg text-[#a39cb8] font-sans font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-auto">
          Autonomous lecture synthesis, predictive exam radar, and active recall combat arenas.
        </p>

        {/* Action CTA Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3 pointer-events-auto">
          <button
            onClick={() => onNavigate('camp')}
            className="px-6 py-3.5 rounded-xl bg-[#c9813c] hover:bg-[#b57130] text-white font-display font-black text-sm sm:text-base border-2 border-white/30 shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer pointer-events-auto"
            title="Enter Course Basecamp"
          >
            <span>ENTER BASECAMP</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="px-5 py-3.5 rounded-xl bg-[#141024]/80 hover:bg-[#141024] text-white font-display font-bold text-xs sm:text-sm border-2 border-white/20 hover:border-white/40 shadow-ink transition-all flex items-center gap-2 cursor-pointer pointer-events-auto"
            title="View Scholar Profile & Course Alignment"
          >
            <span>VIEW PROFILE</span>
          </button>
        </div>
      </div>

      {/* 5. CORNER NAVIGATION LINKS (Point to existing routes like the reference) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-6 flex items-center justify-between text-xs font-mono font-bold text-[#a39cb8] pointer-events-auto">
        <button
          onClick={() => onNavigate('camp')}
          className="hover:text-[#c9813c] transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141024]/80 border border-white/10 hover:border-[#c9813c]/40"
          title="Open Camp"
        >
          <Compass className="w-3.5 h-3.5 text-[#c9813c]" />
          <span>CAMP</span>
          <span className="text-[#c9813c]">→</span>
        </button>

        <button
          onClick={() => onNavigate('radar')}
          className="hover:text-[#c9813c] transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141024]/80 border border-white/10 hover:border-[#c9813c]/40"
          title="Open Exam Radar"
        >
          <Radar className="w-3.5 h-3.5 text-[#c9813c]" />
          <span>EXAM RADAR</span>
          <span className="text-[#c9813c]">→</span>
        </button>
      </div>
    </div>
  );
};
