"use client";
import { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import { TextureLoader } from "three";

// 緯度経度 → XYZ
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
  const [texList, setTexList] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchAndPreload() {
      const res = await fetch("/api/images");
      const files: string[] = await res.json();

      // 全部の画像を TextureLoader でプリロード
      const loader = new TextureLoader();
      await Promise.all(
        files.map(
          (file) =>
            new Promise<void>((resolve, reject) => {
              loader.load(
                `/image/${file}`,
                () => resolve(),
                undefined,
                (err) => reject(err)
              );
            })
        )
      );

      setTexList(files);
      setLoaded(true);
    }

    fetchAndPreload();
  }, []);

  if (!loaded) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "black",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "2rem",
        }}
      >
        MORIMORI Earth starting......
      </div>
    );
  }

  // 表示用のテクスチャ
  const earthMap = useLoader(TextureLoader, `/image/${texList[texIndex]}`);

  // 北極南極線
  const polarLinePoints: [number, number, number][] = [
    latLonToXYZ(90, 0, 110),
    latLonToXYZ(-90, 0, 110),
  ];

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
        "linear-gradient(to top, #841a00ff, #ffb347, #ffff00, #00ff00, #006400)",
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
            width: "80vw",
            height: "20px",
          }}
        />
        <div>
          表示中:{" "}
          {(() => {
            const name = texList[texIndex].replace(/\..+$/, "");
            const year = name.substring(0, 4);
            const month = name.substring(4, 6);
            const day = name.substring(6, 8);
            return `${year}年 ${month}月 ${day}日`;
          })()}
        </div>
      </div>

      {/* Canvas はロード完了してからだけ出す */}
      <Canvas camera={{ position: [0, 0, 300], fov: 60 }} gl={{ alpha: true }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={3} />
        <OrbitControls minDistance={150} maxDistance={300} enablePan={false} />

        {/* ベース球 */}
        <mesh>
          <sphereGeometry args={[100, 128, 64]} />
          <meshStandardMaterial color="#38277d" />
        </mesh>

        {/* テクスチャ球 */}
        <mesh>
          <sphereGeometry args={[100.1, 128, 64]} />
          <meshPhysicalMaterial map={earthMap} transparent alphaTest={0.5} />
        </mesh>

        {/* 北極〜南極線 */}
        <Line points={polarLinePoints} color="cyan" lineWidth={2} />
        <Text position={latLonToXYZ(90, 0, 115)} fontSize={8} color="white">
          N
        </Text>
        <Text position={latLonToXYZ(-90, 0, 115)} fontSize={8} color="white">
          S
        </Text>
      </Canvas>
    </main>
  );
}
