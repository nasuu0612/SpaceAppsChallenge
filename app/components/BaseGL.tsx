"use client";
import { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import { TextureLoader } from "three"

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // 緯度経度 → 球面座標変換
  function latLonToXYZ(lat: number, lon: number, radius: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
  }

export default function BaseGL() {
  const [texIndex, setTexIndex] = useState(0);
  const [texList, setTexList] = useState<string[]>([]); // ← useState 追加

  useEffect(() => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((files) => setTexList(files));
  }, []);

  // texList が空の間はまだロードできないので return
  if (texList.length === 0)
    return
  <div style={{ width: "100vw", height: "100vh", background: "black", textAlign: "center" }}>
    Loading...
  </div>;
  const earthMap = useLoader(TextureLoader, `/image/${texList[texIndex]}`);

  // 北極・南極線
  const polarLinePoints: [number, number, number][] = [
    latLonToXYZ(90, 0, 110),   // 北極上方に突き出す
    latLonToXYZ(-90, 0, 110),  // 南極下方に突き出す
  ];

  // ラベル位置
  const northLabelPos = latLonToXYZ(90, 0, 115);
  const southLabelPos = latLonToXYZ(-90, 0, 115);

  return (
    <main style={{ width: "100vw", height: "100vh", background: "transparent" }}>
      {/* NDVIカラーチャート */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "30px",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: "20px",
          height: "250px",
          borderRadius: "5px",
          background:
            "linear-gradient(to top, #841a00ff, #ffb347, #ffff00, #00ff00, #006400)", // 下が低NDVI、上が高NDVI
          border: "1px solid white",
        }}
      ></div>

      {/* カラーチャートラベル */}
      <div
        style={{
          position: "absolute",
          top: "calc(50% - 125px)",
          right: "60px",
          zIndex: 10,
          height: "250px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
          fontSize: "14px",
          textAlign: "right",
        }}
      >
        <span>多い</span>
        <span>少ない</span>
      </div>
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
        <div>
          表示中: {
            texList[texIndex]
              ? (() => {
                const name = texList[texIndex].replace(/\..+$/, ""); // 拡張子除去
                const year = name.substring(0, 4);
                const month = name.substring(4, 6);
                const day = name.substring(6, 8);
                return `${year}年 ${month}月 ${day}日`;
              })()
              : ""
          }</div>
      </div>

      {/* Three.js Canvas */}
      <Canvas camera={{ position: [0, 0, 300], fov: 60 }} gl={{ alpha: true }}>
        {/* 背景色を完全に透過させたいなら ↓ を削除する */}
        <color attach="background" args={["#000000"]} />

        <ambientLight intensity={3} />
        <OrbitControls
          minDistance={typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 150}
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

        {/* 北極〜南極線 */}
        <Line points={polarLinePoints} color="cyan" lineWidth={2} />

        {/* N/Sラベル */}
        <Text position={northLabelPos} fontSize={8} color="white" anchorX="center" anchorY="middle">
          N
        </Text>
        <Text position={southLabelPos} fontSize={8} color="white" anchorX="center" anchorY="middle">
          S
        </Text>

      </Canvas>
    </main>
  );
}
