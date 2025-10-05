"use client";
import { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";

export default function BaseGL() {
  // スライダーの値 (0,1,2...) に応じてテクスチャ名を切り替える
  const [texIndex, setTexIndex] = useState(0);
  const texList = ["earth1.jpeg", "earth2.jpeg"];

  const earthMap = useLoader(TextureLoader, `/image/${texList[texIndex]}`);

  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      {/* スライダー UI */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "rgba(0,0,0,0.5)",
          padding: "10px",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <input
          type="range"
          min="0"
          max={texList.length - 1}
          value={texIndex}
          onChange={(e) => setTexIndex(Number(e.target.value))}
        />
        <div>表示中: {texList[texIndex]}</div>
      </div>

      {/* Three.js Canvas */}
      <Canvas camera={{ position: [0, 0, 220], fov: 60 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={3} />
        <OrbitControls
          minDistance={150}
          maxDistance={300}
          rotateSpeed={0.4}
          zoomSpeed={0.5}
        />
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[100, 128, 64]} />
          <meshPhysicalMaterial map={earthMap} />
        </mesh>
      </Canvas>
    </main>
  );
}
