"use client"
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
export default function BaseGL() {
   const earthMap = useLoader(TextureLoader,"/image/earth.jpeg")
    return (
        <main style={{width: "100vw", height: "100vh"}}>
            <Canvas>
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={3}/>
                <OrbitControls minDistance={101} maxDistance={200} rotateSpeed={0.4} zoomSpeed={0.5}/>
                <mesh castShadow position={[0, 0, 0]}>
                    <sphereGeometry args={[100, 128, 64]}/>
                   <meshPhysicalMaterial map={earthMap}/>
                </mesh>
            </Canvas>
        </main>
    );
}