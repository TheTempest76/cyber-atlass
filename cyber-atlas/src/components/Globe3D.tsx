"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import React, { useRef } from "react";
import * as THREE from "three";

function RotatingGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={new THREE.Color("#00e5ff")}
          metalness={0.1}
          roughness={0.35}
          emissive={new THREE.Color("#00ffff")}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.005, 32, 32]} />
        <meshBasicMaterial color="#7cf9d6" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Cyber grid: latitude and longitude lines */}
      {(() => {
        const elements: React.ReactElement[] = [];
        const latCount = 8;
        const lonCount = 12;
        const radius = 1.01;

        // helper to build circle points in a plane
        const createCircle = (r: number, segments = 128) => {
          const pts: [number, number, number][] = [];
          for (let i = 0; i <= segments; i += 1) {
            const t = (i / segments) * Math.PI * 2;
            pts.push([Math.cos(t) * r, Math.sin(t) * r, 0]);
          }
          return pts;
        };

        // Latitudes (parallel circles in XY, then rotate to various phi)
        for (let i = 1; i < latCount; i += 1) {
          const phi = (i / latCount) * Math.PI - Math.PI / 2; // -90..+90
          const r = Math.cos(phi) * radius;
          const y = Math.sin(phi) * radius;
          const pts = createCircle(r);
          elements.push(
            <group key={`lat-${i}`} position={[0, y, 0]}> 
              <Line points={pts} color="#00fff0" lineWidth={1} transparent opacity={0.3} />
            </group>
          );
        }

        // Longitudes (meridian circles around Y axis)
        for (let j = 0; j < lonCount; j += 1) {
          const rotY = (j / lonCount) * Math.PI * 2;
          const pts = createCircle(radius);
          elements.push(
            <group key={`lon-${j}`} rotation={[Math.PI / 2, rotY, 0]}>
              <Line points={pts} color="#00fff0" lineWidth={1} transparent opacity={0.25} />
            </group>
          );
        }

        return elements;
      })()}

      {/* Markers at key coords (example hotspots) */}
      {[
        { lat: 37.7749, lon: -122.4194 }, // SF
        { lat: 51.5074, lon: -0.1278 },   // London
        { lat: 28.6139, lon: 77.209 },    // Delhi
        { lat: 35.6762, lon: 139.6503 },  // Tokyo
      ].map((m, idx) => {
        const phi = THREE.MathUtils.degToRad(90 - m.lat);
        const theta = THREE.MathUtils.degToRad(m.lon + 180);
        const r = 1.03;
        const x = -r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);
        return (
          <mesh key={idx} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="#00ffbf" />
          </mesh>
        );
      })}

      {/* Shield ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.005, 16, 256]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </mesh>

      {/* Halo */}
      <mesh>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

export default function Globe3D() {
  return (
    <div className="relative h-[360px] sm:h-[420px] w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.2], fov: 45, near: 0.1, far: 100 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[2.5, 3, 2]}
          intensity={1.2}
          color={new THREE.Color("#b6fff6")}
          castShadow
        />
        <directionalLight
          position={[-3, -2, -4]}
          intensity={0.4}
          color={new THREE.Color("#7fffd4")}
        />

        <RotatingGlobe />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-transparent to-black/10" />
    </div>
  );
}


