"use client";
import { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";

export default function BaseGL() {
  const [texName, setTexName] = useState("earth1.jpeg");
  const earthMap = useLoader(TextureLoader, `/image/${texName}`);

  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      {/* 切り替えボタン */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10, color:"white" }}>
        <button onClick={() => setTexName("earth1.jpeg")} style={{padding: 20}}>Earth 1</button>
        <button onClick={() => setTexName("earth2.jpeg")} style={{padding: 20}}>Earth 2</button>
      </div>

      <Canvas>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={3} />
        <OrbitControls
          minDistance={101}
          maxDistance={200}
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
