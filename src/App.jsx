import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import './App.css';

const colors = ['#f0f0f0', 'white', 'yellow', 'orange', 'red', 'violet', 'blue', 'green'];

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={3} />;
}

export default function App() {
  const [modelUrl, setModelUrl] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#f0f0f0');
  const [colorIndex, setColorIndex] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Original GLB file size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      setModelFile(file);
    }
  };

  const handleCompressAndDownload = () => {
    if (!modelFile) return;

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(URL.createObjectURL(modelFile), (gltf) => {
      const exporter = new GLTFExporter();
      exporter.parse(gltf.scene, (result) => {
        const output = JSON.stringify(result);
        const blob = new Blob([output], { type: 'model/gltf+json' });
        console.log(`Compressed GLB file size: ${(blob.size / (1024 * 1024)).toFixed(2)} MB`);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'compressed_model.glb';
        link.click();
      }, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true });
    });
  };

  const toggleBackgroundColor = () => {
    const nextIndex = (colorIndex + 1) % colors.length;
    setBackgroundColor(colors[nextIndex]);
    setColorIndex(nextIndex);
  };

  return (
    <>
      <div className="canvas-container" style={{ backgroundColor }}>
        <div className="title">3D Model Viewer</div>
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <directionalLight color="white" position={[5, 5, 5]} />
          {modelUrl && <Model url={modelUrl} />}
          <OrbitControls target={[0, 0, 0]} />
          <Stats />
        </Canvas>
        <div className="file-upload-container">
          <input type="file" accept=".glb" onChange={handleFileUpload} />
          <button onClick={handleCompressAndDownload}>Compress & Download</button>
        </div>
        <button className="toggle-bg-button" onClick={toggleBackgroundColor}>Toggle Background</button>
      </div>
    </>
  );
}
