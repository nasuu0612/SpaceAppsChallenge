"use client";
import { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";

export default function BaseGL() {
  const [texIndex, setTexIndex] = useState(0);
  const [texList, setTexList] = useState<string[]>([]); // ← useState 追加

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((files) => setTexList(files));
  }, []);

  // texList が空の間はまだロードできないので return
  if (texList.length === 0) return <div>Loading...</div>;
  const earthMap = useLoader(TextureLoader, `/image/${texList[texIndex]}`);

  return (
    <main style={{ width: "100vw", height: "100vh", background: "transparent" }}>
      {/* スライダー UI */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
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
          style={{
            width: "80vw",   // 横幅
            height: "20px",   // 縦の太さ
          }}
        />
        <div>表示中: {texList[texIndex]}</div>
      </div>

      {/* Three.js Canvas */}
      <Canvas camera={{ position: [0, 0, 220], fov: 60 }} gl={{ alpha: true }}>
        {/* 背景色を完全に透過させたいなら ↓ を削除する */}
        <color attach="background" args={["#000000"]} />

        <ambientLight intensity={3} />
        <OrbitControls
          minDistance={150}
          maxDistance={300}
          rotateSpeed={0.4}
          zoomSpeed={0.5}
          enablePan={false} 
        />
        <mesh position={[0, 0, 0]}>
          {/* ベースの黒球 */}
          <sphereGeometry args={[100, 128, 64]} />
          <meshStandardMaterial color="#38277d" />
        </mesh>
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[100.1, 128, 64]} />
          <meshPhysicalMaterial
            map={earthMap}
            transparent={true}
            alphaTest={0.5}   // 必要なら追加
          />
        </mesh>
      </Canvas>
    </main>
  );
}
