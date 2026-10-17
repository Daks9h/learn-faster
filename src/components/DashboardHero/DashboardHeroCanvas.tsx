import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronDown, ArrowDown } from 'lucide-react';

interface DashboardHeroCanvasProps {
  isVisible: boolean;
  onScrollToContent: () => void;
}

// 1. Faceted Craggy Low-Poly Asteroid
const LowPolyAsteroid: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate an icosahedron and subtly displace vertices for organic craggy facets
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(4.2, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    // Deterministic pseudo-random displacement based on index
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const noise = (Math.sin(v.x * 3.5) * Math.cos(v.y * 3.5) * Math.sin(v.z * 3.5)) * 0.35;
      v.multiplyScalar(1 + noise);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -4.6, 0]}>
      <meshStandardMaterial
        color="#322248"
        roughness={0.88}
        metalness={0.12}
        flatShading={true}
      />
    </mesh>
  );
};

// 2. Low-Poly Rocket (sitting atop the asteroid)
const LowPolyRocket: React.FC = () => {
  const rocketGroupRef = useRef<THREE.Group>(null);

  return (
    <group ref={rocketGroupRef} position={[0, 0.45, 0]}>
      {/* Fuselage / Main White Body (7-sided faceted cylinder) */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.55, 0.9, 2.0, 7]} />
        <meshStandardMaterial
          color="#f4f1fa"
          roughness={0.35}
          metalness={0.15}
          flatShading={true}
        />
      </mesh>

      {/* Red Nose Cone (top tip) */}
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[0.55, 1.0, 7]} />
        <meshStandardMaterial
          color="#d93829"
          roughness={0.3}
          metalness={0.2}
          flatShading={true}
        />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#c72e20" roughness={0.2} flatShading={true} />
      </mesh>

      {/* Red Tail Booster Base */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.9, 0.98, 0.75, 7]} />
        <meshStandardMaterial
          color="#d93829"
          roughness={0.3}
          metalness={0.2}
          flatShading={true}
        />
      </mesh>

      {/* Dark Engine Nozzle Bottom */}
      <mesh position={[0, -0.88, 0]}>
        <cylinderGeometry args={[0.45, 0.6, 0.2, 7]} />
        <meshStandardMaterial color="#1f182c" roughness={0.9} flatShading={true} />
      </mesh>

      {/* Cockpit Window Porthole (Facing forward +Z) */}
      <group position={[0, 1.1, 0.76]}>
        {/* Chrome Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.05, 6, 12]} />
          <meshStandardMaterial color="#948b9b" metalness={0.6} roughness={0.3} flatShading={true} />
        </mesh>
        {/* Cyan Tinted Glass */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.23, 12]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.4} roughness={0.1} />
        </mesh>
      </group>

      {/* 4 Low-Poly Fins / Landing Struts */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.98, -0.4, 0]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.12, 1.3, 0.38]} />
            <meshStandardMaterial color="#7a708e" roughness={0.6} flatShading={true} />
          </mesh>
          {/* Landing Pad */}
          <mesh position={[1.22, -1.0, 0]}>
            <boxGeometry args={[0.28, 0.08, 0.28]} />
            <meshStandardMaterial color="#554c68" roughness={0.7} flatShading={true} />
          </mesh>
        </group>
      ))}

      {/* Access Ladder Rungs Facing Front */}
      <group position={[0, -0.4, 0.98]}>
        {/* Side Rails */}
        <mesh position={[-0.1, 0.05, 0]}>
          <boxGeometry args={[0.02, 1.1, 0.02]} />
          <meshStandardMaterial color="#f3effa" roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0.05, 0]}>
          <boxGeometry args={[0.02, 1.1, 0.02]} />
          <meshStandardMaterial color="#f3effa" roughness={0.5} />
        </mesh>
        {/* Rungs */}
        {[-0.4, -0.2, 0.0, 0.2, 0.4].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <boxGeometry args={[0.2, 0.02, 0.02]} />
            <meshStandardMaterial color="#f3effa" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// 3. Orbiting Debris Belt (ONE single InstancedMesh for max performance)
const OrbitingDebris: React.FC = () => {
  const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 80 : 220;
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  // Instanced rock geometry (low-poly dodecahedron)
  const rockGeometry = useMemo(() => new THREE.DodecahedronGeometry(0.18, 0), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions, scales, and rotations along the elliptical belt
  useEffect(() => {
    if (!instancedRef.current) return;

    const colors = [
      new THREE.Color('#c9813c'), // copper orange
      new THREE.Color('#d98f48'), // warm gold
      new THREE.Color('#e2964e'), // light copper
      new THREE.Color('#8f819d'), // asteroid purple-grey
      new THREE.Color('#aba0b5'), // light stone
      new THREE.Color('#5e546c'), // dark stone
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const radius = 5.2 + Math.random() * 2.6; // belt spread
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.9; // vertical scatter

      dummy.position.set(x, y, z);
      const scale = 0.6 + Math.random() * 1.1;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();

      instancedRef.current.setMatrixAt(i, dummy.matrix);

      // Randomly pick debris color
      const color = colors[Math.floor(Math.random() * colors.length)];
      instancedRef.current.setColorAt(i, color);
    }

    instancedRef.current.instanceMatrix.needsUpdate = true;
    if (instancedRef.current.instanceColor) {
      instancedRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, dummy]);

  // Orbit rotation
  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    // Tilted belt plane matching the reference camera angle
    <group ref={ringRef} rotation={[0.42, 0, -0.22]}>
      <instancedMesh
        ref={instancedRef}
        args={[rockGeometry, undefined, count]}
      >
        <meshStandardMaterial
          roughness={0.85}
          metalness={0.1}
          flatShading={true}
        />
      </instancedMesh>
    </group>
  );
};

// 4. Combined Scene Controller (Gentle Pointer Parallax + Slow Idle Rotation)
const SceneController: React.FC = () => {
  const sceneGroupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!sceneGroupRef.current) return;

    // Slow ambient rotation around Y axis
    sceneGroupRef.current.rotation.y += delta * 0.04;

    // Smooth pointer parallax
    const targetRotX = pointer.y * 0.08;
    const targetRotZ = -pointer.x * 0.08;
    sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.x, targetRotX, 0.04);
    sceneGroupRef.current.rotation.z = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.z, targetRotZ, 0.04);
  });

  return (
    <group ref={sceneGroupRef}>
      <LowPolyRocket />
      <LowPolyAsteroid />
      <OrbitingDebris />
    </group>
  );
};

export const DashboardHeroCanvas: React.FC<DashboardHeroCanvasProps> = ({
  isVisible,
  onScrollToContent,
}) => {
  return (
    <div 
      className="relative w-full h-[calc(100vh-60px)] min-h-[580px] max-h-[960px] overflow-hidden flex flex-col items-center justify-between select-none"
      style={{
        background: 'radial-gradient(ellipse 90% 55% at 50% 100%, rgba(145, 50, 65, 0.42) 0%, rgba(55, 20, 75, 0.3) 40%, rgba(11, 10, 20, 0.95) 80%, #0b0a14 100%)',
      }}
    >
      {/* 1. 3D R3F CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas
          aria-hidden="true"
          frameloop={isVisible ? 'always' : 'never'}
          dpr={[1, 1.5]}
          gl={{
            antialias: typeof window !== 'undefined' ? window.innerWidth > 768 : true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0.4, 13.5], fov: 46 }}
        >
          {/* Ambient space illumination */}
          <ambientLight intensity={0.85} color="#d4cce6" />

          {/* Warm directional light from top right */}
          <directionalLight position={[14, 20, 15]} intensity={1.5} color="#fff4eb" />

          {/* Warm copper rim light from bottom left */}
          <pointLight position={[-10, -18, -6]} intensity={1.8} color="#c9813c" />

          {/* Background starfield */}
          <Stars
            radius={70}
            depth={40}
            count={2600}
            factor={3.5}
            saturation={0}
            fade={true}
            speed={0.6}
          />

          {/* Main 3D content */}
          <SceneController />
        </Canvas>
      </div>

      {/* 2. FAINT WARM HORIZON GLOW (Pure CSS Layer matching Learn with Jason) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none z-5"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 90%, rgba(201, 129, 60, 0.22) 0%, rgba(135, 55, 64, 0.16) 50%, transparent 100%)',
        }}
      />

      {/* 3. REAL HTML OVERLAY TYPOGRAPHY (Learn with Jason style) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-8 sm:pt-14 flex flex-col items-center sm:items-start text-center sm:text-left pointer-events-none">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 pointer-events-auto">
          <h1 
            className="font-display font-black text-6xl sm:text-8xl md:text-9xl text-[#c9813c] leading-none tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            style={{ letterSpacing: '-0.04em' }}
          >
            LectureAI
          </h1>
          <span 
            className="font-display font-light text-2xl sm:text-4xl md:text-5xl text-[#e2d8f0]/80 tracking-wide"
            style={{ letterSpacing: '-0.02em' }}
          >
            with AI
          </span>
        </div>

        <p className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base md:text-lg text-[#a39cb8] font-sans font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-auto">
          Autonomous lecture synthesis, predictive exam radar, and active recall combat arenas.
        </p>

        {/* Action CTA Button */}
        <div className="mt-6 sm:mt-8 flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onScrollToContent}
            className="px-6 py-3 rounded-xl bg-[#c9813c] hover:bg-[#b57130] text-white font-display font-black text-sm sm:text-base border-2 border-white/30 shadow-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer pointer-events-auto"
          >
            <span>EXPLORE SCHOLAR BASECAMP</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. SCROLL INDICATOR CUE AT BOTTOM */}
      <div 
        className="relative z-20 mb-3 flex flex-col items-center gap-1 text-[#a39cb8] pointer-events-auto cursor-pointer" 
        onClick={onScrollToContent}
      >
        <span className="font-mono text-[11px] tracking-widest uppercase font-bold text-[#c9813c]">
          Scroll to view
        </span>
        <ChevronDown className="w-5 h-5 text-[#c9813c] animate-bounce" />
      </div>

      {/* 5. GRADIENT FADE JOIN INTO THE DASHBOARD PAGE (~120px) */}
      <div 
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-15"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(11, 10, 20, 0.6) 50%, #0b0a14 100%)',
        }}
      />
    </div>
  );
};

export default DashboardHeroCanvas;
