"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

interface JuncaRobotCanvasProps {
  onLoaded?: () => void;
  className?: string;
  isSoundActive?: boolean;
}

export function JuncaRobotCanvas({
  onLoaded,
  className = "",
  isSoundActive = false,
}: JuncaRobotCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const isSoundRef = useRef(isSoundActive);

  useEffect(() => {
    isSoundRef.current = isSoundActive;
  }, [isSoundActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.01, 200);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig (Exact recreation from Junca Studio source)
    const ambientLight = new THREE.AmbientLight(0x660000, 0.65);
    scene.add(ambientLight);

    // Top warm key light
    const topKey = new THREE.DirectionalLight(0xffecd0, 2.8);
    topKey.position.set(-1.4, 3.2, 1.1);
    scene.add(topKey);

    // Right fill
    const rightFill = new THREE.DirectionalLight(0xb8d4ff, 1.8);
    rightFill.position.set(5.9, 0.9, 1.6);
    scene.add(rightFill);

    // Left fill
    const leftFill = new THREE.DirectionalLight(0xb8d4ff, 1.8);
    leftFill.position.set(-5.9, 0.8, 0.4);
    scene.add(leftFill);

    // Back razor crimson rim light
    const rimLight = new THREE.DirectionalLight(0xed3327, 4.5);
    rimLight.position.set(0.4, 0.3, -5.9);
    scene.add(rimLight);

    // Soft top fill
    const softTop = new THREE.DirectionalLight(0xf2f4ff, 1.2);
    softTop.position.set(0.6, 3.9, 0.2);
    scene.add(softTop);

    // 3. Environment Map (EXR)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const exrLoader = new EXRLoader();
    exrLoader.load(
      "/robot/env_256.exr",
      (texture) => {
        if (isDisposed) {
          texture.dispose();
          return;
        }
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.environmentIntensity = 1.37;
        scene.environmentRotation.set(0, 2.47, 0);
        texture.dispose();
        pmremGenerator.dispose();
      },
      undefined,
      (err) => {
        console.warn("EXR environment failed, using fallback lighting", err);
      }
    );

    // 4. Procedural Crimson Atmospheric Smoke Clouds (Exact Junca Studio cloud nebula)
    const createSmokeTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, "rgba(220, 45, 25, 0.7)");
        grad.addColorStop(0.3, "rgba(160, 25, 15, 0.45)");
        grad.addColorStop(0.65, "rgba(90, 8, 8, 0.2)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    };

    const cloudGroup = new THREE.Group();
    cloudGroup.name = "clouds";
    scene.add(cloudGroup);

    const smokeTex = createSmokeTexture();
    const cloudCount = 20;
    const cloudPuffs: { mesh: THREE.Mesh; seed: number; speed: number; basePos: THREE.Vector3 }[] = [];

    for (let i = 0; i < cloudCount; i++) {
      const geo = new THREE.PlaneGeometry(1.6, 1.6);
      const mat = new THREE.MeshBasicMaterial({
        map: smokeTex,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Distribute in a crescent behind the robot
      const angle = (i / cloudCount) * Math.PI * 1.5 - 0.4;
      const dist = 0.8 + Math.random() * 0.7;
      const x = Math.cos(angle) * dist + 0.15;
      const y = 0.1 + (Math.random() - 0.4) * 1.2;
      const z = Math.sin(angle) * dist - 0.5;

      mesh.position.set(x, y, z);
      const scale = 1.0 + Math.random() * 1.1;
      mesh.scale.set(scale, scale, 1);
      cloudGroup.add(mesh);

      cloudPuffs.push({
        mesh,
        seed: Math.random() * 10,
        speed: 0.15 + Math.random() * 0.2,
        basePos: mesh.position.clone(),
      });
    }

    // 5. Robot Hierarchy & Materials
    const robotRoot = new THREE.Group();
    robotRoot.name = "robotRoot";
    scene.add(robotRoot);

    const headPivot = new THREE.Group();
    headPivot.name = "headPivot";
    const bodyPivot = new THREE.Group();
    bodyPivot.name = "bodyPivot";
    robotRoot.add(bodyPivot);
    robotRoot.add(headPivot);

    let fanBladesMesh: THREE.Object3D | null = null;
    let fanSpeed = 1.0;

    let headCenter = new THREE.Vector3();
    let headRadius = 0.16;
    let headHeight = 0.18;

    // Load GLTF with Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const HEAD_NODE_NAMES = new Set([
      "Cube_Plate",
      "Cube_Plate.001",
      "Cube_Plate_Piece.001",
      "Slice.004",
      "Slice.005",
      "Slice.006",
      "Slice.007",
      "Slice.008",
    ]);

    const FAN_BLADES_NAMES = new Set(["fan_blades"]);
    const CHROME_NODES = new Set(["Cou", "Cylinder"]);
    const LED_NODES = new Set(["Boutons LEDS"]);

    const updateCameraFraming = () => {
      const isMobile = window.innerWidth <= 809;
      const fov = 32;
      camera.fov = fov;
      camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight);
      camera.updateProjectionMatrix();

      const t = THREE.MathUtils.degToRad(fov) * 0.5;
      const n = Math.atan(Math.tan(t) * camera.aspect);

      const headFill = isMobile ? 1.05 : 0.76;
      const drop = isMobile ? 0.3 : 2.85;
      const shiftX = isMobile ? 0 : 0.68;

      const Le = headRadius / (Math.sin(Math.min(t, n)) * headFill);

      const azimuth = (84 * Math.PI) / 180;
      const elevation = (4 * Math.PI) / 180;

      const Re = new THREE.Vector3(
        Math.sin(azimuth) * Math.cos(elevation),
        Math.sin(elevation),
        Math.cos(azimuth) * Math.cos(elevation)
      );

      const Be = new THREE.Vector3().crossVectors(Re, new THREE.Vector3(0, 1, 0)).normalize();

      const targetCenter = headCenter.clone().setY(headCenter.y - headHeight * drop);
      const V = targetCenter.clone().addScaledVector(Be, headRadius * shiftX * (camera.aspect > 1 ? 1 : 0));

      camera.position.copy(V).addScaledVector(Re, Le);
      camera.lookAt(V);
    };

    gltfLoader.load(
      "/robot/junca_robot.glb",
      (gltf) => {
        if (isDisposed) return;

        const model = gltf.scene;

        // Texture bake loading
        const textureLoader = new THREE.TextureLoader();
        const aoMap = textureLoader.load("/robot/junca_ao.webp");
        aoMap.flipY = false;
        const lightMap = textureLoader.load("/robot/junca_lightmap_1024.webp");
        lightMap.flipY = false;

        // Authentic Junca Studio Materials (Exact match to 4653056, 16711680, 11647170)
        // mat_case_alu: #470000 deep crimson chassis
        const aluMaterial = new THREE.MeshStandardMaterial({
          name: "mat_case_alu",
          color: new THREE.Color(0x470000),
          metalness: 0.83,
          roughness: 0.39,
          side: THREE.DoubleSide,
          aoMap: aoMap,
          aoMapIntensity: 0.55,
          lightMap: lightMap,
          lightMapIntensity: 0.35,
        });

        // mat_case_anod: #ff0000 pure crimson red
        const anodMaterial = new THREE.MeshStandardMaterial({
          name: "mat_case_anod",
          color: new THREE.Color(0xff0000),
          metalness: 0.95,
          roughness: 0.55,
          side: THREE.DoubleSide,
        });

        // mat_chrome: #b1b8c2 polished liquid mirror chrome
        const chromeMaterial = new THREE.MeshStandardMaterial({
          name: "mat_chrome",
          color: new THREE.Color(0xb1b8c2),
          metalness: 1.0,
          roughness: 0.04,
        });

        // mat_fan: crimson anodized turbine fan blades
        const fanMaterial = new THREE.MeshStandardMaterial({
          name: "mat_fan",
          color: new THREE.Color(0xcc1a1a),
          metalness: 0.92,
          roughness: 0.32,
        });

        // Screen: obsidian glossy visor
        const screenMaterial = new THREE.MeshStandardMaterial({
          name: "Screen",
          color: new THREE.Color(0x000101),
          roughness: 0.55,
          metalness: 0.1,
        });

        // ScreenGlow: glowing screen display
        const screenGlowMaterial = new THREE.MeshStandardMaterial({
          name: "ScreenGlow",
          color: new THREE.Color(0x000000),
          emissive: new THREE.Color(0x061b46),
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        });

        // Boutons LEDS: glowing orange telemetry bar in chest
        const orangeLedMaterial = new THREE.MeshStandardMaterial({
          name: "OLED_strip",
          color: new THREE.Color(0xff5500),
          emissive: new THREE.Color(0xff4500),
          emissiveIntensity: 3.5,
          roughness: 0.2,
          metalness: 0.1,
        });

        const headNodes: THREE.Object3D[] = [];
        const bodyNodes: THREE.Object3D[] = [];

        // Traverse & Assign Materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const matName = mesh.material && "name" in mesh.material ? mesh.material.name : "";

            if (matName.includes("ScreenGlow")) {
              mesh.material = screenGlowMaterial;
            } else if (matName.includes("Screen")) {
              mesh.material = screenMaterial;
            } else if (LED_NODES.has(mesh.name) || matName.includes("LED")) {
              mesh.material = orangeLedMaterial;
            } else if (CHROME_NODES.has(mesh.name) || matName.includes("chrome")) {
              mesh.material = chromeMaterial;
            } else if (FAN_BLADES_NAMES.has(mesh.name) || matName.includes("fan")) {
              mesh.material = fanMaterial;
            } else if (matName.includes("mat_case_anod") || mesh.name.includes("trappe")) {
              mesh.material = anodMaterial;
            } else {
              mesh.material = aluMaterial;
            }
          }
        });

        // Separate Head and Body nodes
        const children = [...model.children];
        for (const child of children) {
          if (FAN_BLADES_NAMES.has(child.name)) {
            fanBladesMesh = child;
            bodyNodes.push(child);
          } else if (HEAD_NODE_NAMES.has(child.name)) {
            headNodes.push(child);
          } else {
            bodyNodes.push(child);
          }
        }

        // Calculate Head Pivot Center
        const headBox = new THREE.Box3();
        for (const n of headNodes) {
          headBox.expandByObject(n);
        }
        headBox.getCenter(headCenter);
        headHeight = headBox.max.y - headBox.min.y;
        headRadius = headBox.getSize(new THREE.Vector3()).length() * 0.5;

        const pivotY = headBox.min.y;
        headPivot.position.set(headCenter.x, pivotY, headCenter.z);

        for (const n of headNodes) {
          n.position.x -= headCenter.x;
          n.position.y -= pivotY;
          n.position.z -= headCenter.z;
          headPivot.add(n);
        }

        for (const n of bodyNodes) {
          bodyPivot.add(n);
        }

        // Apply exact Junca Studio camera framing
        updateCameraFraming();

        setLoading(false);
        if (onLoaded) onLoaded();
      },
      undefined,
      (err) => {
        console.error("Error loading Junca Robot GLTF:", err);
        setLoading(false);
      }
    );

    // 6. Mouse Tracking & Spring Interpolation
    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetPointer.x = Math.max(-1, Math.min(1, x));
      targetPointer.y = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      updateCameraFraming();
    };

    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth pointer interpolation
      pointer.x += (targetPointer.x - pointer.x) * (delta * 4.5);
      pointer.y += (targetPointer.y - pointer.y) * (delta * 4.5);

      // Idle oscillations
      const headIdleY = Math.sin(time * 0.8) * 0.02;
      const headIdleX = Math.cos(time * 1.1) * 0.015;
      const bobY = Math.sin(time * 1.4) * 0.008;

      // Head tracking
      headPivot.rotation.y = pointer.x * 0.35 + headIdleY;
      headPivot.rotation.x = -pointer.y * 0.22 + headIdleX;
      headPivot.rotation.z = -pointer.x * 0.08;

      // Body slight reaction
      bodyPivot.rotation.y = pointer.x * 0.08;
      bodyPivot.rotation.x = -pointer.y * 0.04;
      bodyPivot.rotation.z = -pointer.x * 0.02;

      // Floating bob
      robotRoot.position.y = bobY;

      // Turbine fan rotation
      if (fanBladesMesh) {
        const targetSpeed = isSoundRef.current ? 16.0 : 3.0;
        fanSpeed += (targetSpeed - fanSpeed) * (delta * 2.5);
        fanBladesMesh.rotation.x -= fanSpeed * delta * Math.PI * 2;
      }

      // Animate background smoke puffs
      for (const puff of cloudPuffs) {
        puff.mesh.position.x = puff.basePos.x + Math.sin(time * puff.speed + puff.seed) * 0.06;
        puff.mesh.position.y = puff.basePos.y + Math.cos(time * puff.speed * 0.8 + puff.seed) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      dracoLoader.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onLoaded]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black transition-opacity duration-700 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/20 border-t-[#ED3327] animate-spin" />
            <span className="font-mono text-[11px] tracking-wider text-white/60 uppercase">
              Initializing 3D Unit
            </span>
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
