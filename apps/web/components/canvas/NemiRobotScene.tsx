"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type RobotState =
  | "idle"
  | "thinking"
  | "coding"
  | "debugging"
  | "testing"
  | "success"
  | "error"
  | "waiting";

interface NemiRobotSceneProps {
  state?: RobotState;
  className?: string;
  onBotClick?: () => void;
}

export function NemiRobotScene({
  state = "idle",
  className = "",
  onBotClick,
}: NemiRobotSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState(true);

  const stateRef = useRef({
    currentState: state,
    targetMouseX: 0,
    targetMouseY: 0,
    currentMouseX: 0,
    currentMouseY: 0,
    blinkProgress: 0,
    lastBlink: 0,
  });

  useEffect(() => {
    stateRef.current.currentState = state;
  }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGlAvailable(false);
        return;
      }
    } catch {
      setWebGlAvailable(false);
      return;
    }

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;

    try {
      const scene = new THREE.Scene();

      // Camera: Clean perspective framing
      const camera = new THREE.PerspectiveCamera(
        34,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5.8);
      camera.lookAt(0, 0, 0);

      // WebGL Renderer with HDR Tonemapping
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0x180508, 1.1);
      scene.add(ambientLight);

      // Key white specular light from upper-left
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
      keyLight.position.set(-2.5, 3.5, 4.0);
      scene.add(keyLight);

      // Intense Crimson Rim Light from behind right (highlighting helmet curve & shoulder joint)
      const rimRedLight = new THREE.DirectionalLight(0xed3327, 9.5);
      rimRedLight.position.set(4.0, 2.5, -1.8);
      scene.add(rimRedLight);

      // Deep Ruby Point Light behind robot
      const backRuby = new THREE.PointLight(0xba000d, 8.5, 15);
      backRuby.position.set(2.8, 1.0, -1.5);
      scene.add(backRuby);

      // Soft Red fill from lower front
      const frontFill = new THREE.PointLight(0x500204, 2.8, 9);
      frontFill.position.set(1.5, -1.2, 3.2);
      scene.add(frontFill);

      // --- VOLUMETRIC CRIMSON ATMOSPHERE PARTICLES ---
      const smokeParticles: THREE.Mesh[] = [];
      const smokeCanvas = document.createElement("canvas");
      smokeCanvas.width = 128;
      smokeCanvas.height = 128;
      const sCtx = smokeCanvas.getContext("2d");
      if (sCtx) {
        const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        sGrad.addColorStop(0, "rgba(237, 51, 39, 0.42)");
        sGrad.addColorStop(0.45, "rgba(120, 5, 10, 0.22)");
        sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        sCtx.fillStyle = sGrad;
        sCtx.fillRect(0, 0, 128, 128);
      }
      const smokeTexture = new THREE.CanvasTexture(smokeCanvas);

      for (let i = 0; i < 20; i++) {
        const smokeGeo = new THREE.PlaneGeometry(3.5 + Math.random() * 2, 3.5 + Math.random() * 2);
        const smokeMat = new THREE.MeshBasicMaterial({
          map: smokeTexture,
          transparent: true,
          opacity: 0.35 + Math.random() * 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const smMesh = new THREE.Mesh(smokeGeo, smokeMat);
        smMesh.position.set(
          1.8 + (Math.random() - 0.5) * 3.5,
          0.8 + (Math.random() - 0.5) * 3.0,
          -1.5 - Math.random() * 2.2
        );
        smMesh.rotation.z = Math.random() * Math.PI * 2;
        scene.add(smMesh);
        smokeParticles.push(smMesh);
      }

      // --- MATERIALS ---
      const darkGunmetalMat = new THREE.MeshStandardMaterial({
        color: 0x14161d,
        metalness: 0.88,
        roughness: 0.22,
      });

      const titaniumArmorMat = new THREE.MeshStandardMaterial({
        color: 0xebedf2,
        metalness: 0.72,
        roughness: 0.18,
      });

      const chromeSteelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.98,
        roughness: 0.08,
      });

      const glowingRedMat = new THREE.MeshStandardMaterial({
        color: 0xed3327,
        emissive: 0xed3327,
        emissiveIntensity: 4.2,
        roughness: 0.12,
      });

      // --- ROBOT ROOT (Positioned in Upper-Right Quadrant above NEMI Agent chat) ---
      const botRoot = new THREE.Group();
      scene.add(botRoot);

      // Positioning: Center the robot majestically across the window canopy
      const updateBotPosition = () => {
        botRoot.position.set(0, -0.3, 0.1);
        botRoot.scale.set(1.18, 1.18, 1.18);
      };
      updateBotPosition();

      // --- 1. TORSO & MECHANICAL RIGHT ARM ---
      const torsoGroup = new THREE.Group();
      botRoot.add(torsoGroup);
      torsoGroup.position.set(0, -0.75, -0.2);

      // Chest chassis block
      const chestGeo = new THREE.CylinderGeometry(0.75, 0.65, 1.2, 32);
      const chestMesh = new THREE.Mesh(chestGeo, darkGunmetalMat);
      torsoGroup.add(chestMesh);

      // Titanium front chest plate with bold "NEMI" branding matching Image 2
      const chestCanvas = document.createElement("canvas");
      chestCanvas.width = 512;
      chestCanvas.height = 256;
      const cCtx = chestCanvas.getContext("2d");
      if (cCtx) {
        cCtx.fillStyle = "#E4E8F0";
        cCtx.fillRect(0, 0, 512, 256);
        cCtx.fillStyle = "#0B0E14";
        cCtx.font = "900 88px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        cCtx.textAlign = "center";
        cCtx.textBaseline = "middle";
        cCtx.fillText("NEMI", 256, 128);
      }
      const chestTexture = new THREE.CanvasTexture(chestCanvas);
      const chestArmorWithLogoMat = new THREE.MeshStandardMaterial({
        map: chestTexture,
        metalness: 0.78,
        roughness: 0.24,
      });

      const chestPlateGeo = new THREE.BoxGeometry(0.92, 0.65, 0.12);
      const chestPlate = new THREE.Mesh(chestPlateGeo, chestArmorWithLogoMat);
      chestPlate.position.set(0, 0.05, 0.58);
      torsoGroup.add(chestPlate);

      // --- RIGHT MASSIVE SHOULDER BALL JOINT (Prominent in Image 2) ---
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(0.9, 0.35, 0.05);
      torsoGroup.add(shoulderGroup);

      // Large shoulder sphere
      const shoulderGeo = new THREE.SphereGeometry(0.42, 32, 24);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, darkGunmetalMat);
      shoulderGroup.add(shoulderMesh);

      // Bright glowing red neon halo ring around shoulder
      const shoulderRingGeo = new THREE.TorusGeometry(0.44, 0.04, 16, 32);
      const shoulderRing = new THREE.Mesh(shoulderRingGeo, glowingRedMat);
      shoulderRing.rotation.y = Math.PI / 2;
      shoulderGroup.add(shoulderRing);

      // Upper arm hydraulic armature extending down
      const armUpperGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.9, 24);
      const armUpper = new THREE.Mesh(armUpperGeo, darkGunmetalMat);
      armUpper.position.set(0.12, -0.55, 0.05);
      armUpper.rotation.z = -0.2;
      shoulderGroup.add(armUpper);

      // Chrome hydraulic piston rod
      const rodGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.65, 16);
      const rod = new THREE.Mesh(rodGeo, chromeSteelMat);
      rod.position.set(0.28, -0.5, 0.12);
      rod.rotation.z = -0.2;
      shoulderGroup.add(rod);

      // --- 2. NECK JOINT ---
      const neckGroup = new THREE.Group();
      neckGroup.position.set(0, 0.55, 0);
      botRoot.add(neckGroup);

      const neckCollarGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.2, 32);
      const neckCollar = new THREE.Mesh(neckCollarGeo, chromeSteelMat);
      neckGroup.add(neckCollar);

      const neckRingGeo = new THREE.TorusGeometry(0.38, 0.03, 16, 32);
      const neckRing = new THREE.Mesh(neckRingGeo, glowingRedMat);
      neckRing.rotation.x = Math.PI / 2;
      neckGroup.add(neckRing);

      // --- 3. FRIENDLY ROUNDED HEAD & HELMET ---
      const headGroup = new THREE.Group();
      // Position head so center is at y ≈ 0.65 (perfect upper-right framing)
      headGroup.position.set(0, 0.85, 0.1);
      // Gentle friendly tilt towards the workspace editor
      headGroup.rotation.y = -0.26;
      headGroup.rotation.x = 0.05;
      headGroup.rotation.z = -0.03;
      botRoot.add(headGroup);

      // Helmet main rounded dome
      const domeGeo = new THREE.SphereGeometry(0.78, 32, 24);
      domeGeo.scale(1.08, 0.86, 0.78);
      const domeMesh = new THREE.Mesh(domeGeo, darkGunmetalMat);
      headGroup.add(domeMesh);

      // Helmet titanium brow shield
      const browGeo = new THREE.BoxGeometry(1.22, 0.15, 0.35);
      const browMesh = new THREE.Mesh(browGeo, titaniumArmorMat);
      browMesh.position.set(0, 0.44, 0.48);
      headGroup.add(browMesh);

      // Glowing red brow trim line
      const browGlowGeo = new THREE.BoxGeometry(1.15, 0.04, 0.06);
      const browGlow = new THREE.Mesh(browGlowGeo, glowingRedMat);
      browGlow.position.set(0, 0.48, 0.66);
      headGroup.add(browGlow);

      // Top aerodynamic sensor fin
      const finGeo = new THREE.BoxGeometry(0.07, 0.2, 0.55);
      const finMesh = new THREE.Mesh(finGeo, darkGunmetalMat);
      finMesh.position.set(0, 0.75, -0.05);
      headGroup.add(finMesh);

      const finGlowGeo = new THREE.BoxGeometry(0.035, 0.035, 0.5);
      const finGlow = new THREE.Mesh(finGlowGeo, glowingRedMat);
      finGlow.position.set(0, 0.84, -0.05);
      headGroup.add(finGlow);

      // Side Ear Fixtures with Glowing Crimson Rings (Left & Right)
      const earGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 24);
      const earRingGeo = new THREE.TorusGeometry(0.21, 0.03, 16, 32);

      // Left Ear
      const earLeft = new THREE.Mesh(earGeo, darkGunmetalMat);
      earLeft.rotation.z = Math.PI / 2;
      earLeft.position.set(-0.84, 0, 0);
      headGroup.add(earLeft);

      const earRingLeft = new THREE.Mesh(earRingGeo, glowingRedMat);
      earRingLeft.rotation.y = Math.PI / 2;
      earRingLeft.position.set(-0.91, 0, 0);
      headGroup.add(earRingLeft);

      // Right Ear
      const earRight = new THREE.Mesh(earGeo, darkGunmetalMat);
      earRight.rotation.z = Math.PI / 2;
      earRight.position.set(0.84, 0, 0);
      headGroup.add(earRight);

      const earRingRight = new THREE.Mesh(earRingGeo, glowingRedMat);
      earRingRight.rotation.y = Math.PI / 2;
      earRingRight.position.set(0.91, 0, 0);
      headGroup.add(earRingRight);

      // --- 4. GLOSSY SCREEN & RADIANT GLOWING RED SMILING EYES (^ ^) ---
      const faceCanvas = document.createElement("canvas");
      faceCanvas.width = 512;
      faceCanvas.height = 384;
      const faceCtx = faceCanvas.getContext("2d");
      const faceTexture = new THREE.CanvasTexture(faceCanvas);

      // Curved front screen visor sitting PROUDLY in front of the helmet dome
      const faceGeo = new THREE.PlaneGeometry(1.25, 0.85, 16, 16);
      const posAttr = faceGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        posAttr.setZ(i, -Math.pow(dist / 1.3, 2) * 0.04);
      }
      faceGeo.computeVertexNormals();

      const faceMat = new THREE.MeshBasicMaterial({
        map: faceTexture,
        transparent: false,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      // Positioned at z = 0.68 so it sits cleanly in front of domeMesh
      faceMesh.position.set(0, 0, 0.68);
      headGroup.add(faceMesh);

      // Render expressive smiling eyes (^ ^) exactly matching Image 2
      const renderFace = (time: number) => {
        if (!faceCtx) return;

        // Pitch-black glossy glass background
        faceCtx.fillStyle = "#050608";
        faceCtx.fillRect(0, 0, 512, 384);

        // CRT scanline texture
        faceCtx.fillStyle = "rgba(0, 0, 0, 0.28)";
        for (let y = 0; y < 384; y += 4) {
          faceCtx.fillRect(0, y, 512, 2);
        }

        const currentState = stateRef.current.currentState;

        // Blinking
        if (time - stateRef.current.lastBlink > 3.8) {
          stateRef.current.blinkProgress = 1.0;
          stateRef.current.lastBlink = time;
        }
        if (stateRef.current.blinkProgress > 0) {
          stateRef.current.blinkProgress -= 0.14;
        }
        const isBlinking = stateRef.current.blinkProgress > 0.25;

        const leftEyeX = 175;
        const rightEyeX = 337;
        const eyeY = 195;

        if (isBlinking) {
          faceCtx.strokeStyle = "#ED3327";
          faceCtx.lineWidth = 10;
          faceCtx.lineCap = "round";
          faceCtx.shadowColor = "#ED3327";
          faceCtx.shadowBlur = 20;

          faceCtx.beginPath();
          faceCtx.moveTo(leftEyeX - 32, eyeY);
          faceCtx.lineTo(leftEyeX + 32, eyeY);
          faceCtx.stroke();

          faceCtx.beginPath();
          faceCtx.moveTo(rightEyeX - 32, eyeY);
          faceCtx.lineTo(rightEyeX + 32, eyeY);
          faceCtx.stroke();
        } else if (currentState === "thinking") {
          const floatOffset = Math.sin(time * 3.5) * 6;
          faceCtx.fillStyle = "#ED3327";
          faceCtx.shadowColor = "#ED3327";
          faceCtx.shadowBlur = 28;

          faceCtx.beginPath();
          faceCtx.arc(leftEyeX, eyeY - 10 + floatOffset, 24, 0, Math.PI * 2);
          faceCtx.fill();

          faceCtx.beginPath();
          faceCtx.arc(rightEyeX, eyeY - 10 + floatOffset, 24, 0, Math.PI * 2);
          faceCtx.fill();
        } else if (currentState === "coding") {
          faceCtx.fillStyle = "#ED3327";
          faceCtx.shadowColor = "#ED3327";
          faceCtx.shadowBlur = 25;

          faceCtx.beginPath();
          faceCtx.roundRect(leftEyeX - 35, eyeY - 12, 70, 26, 13);
          faceCtx.roundRect(rightEyeX - 35, eyeY - 12, 70, 26, 13);
          faceCtx.fill();

          faceCtx.fillStyle = "#ffffff";
          faceCtx.beginPath();
          faceCtx.arc(leftEyeX + 10, eyeY - 2, 5, 0, Math.PI * 2);
          faceCtx.arc(rightEyeX + 10, eyeY - 2, 5, 0, Math.PI * 2);
          faceCtx.fill();
        } else {
          // DEFAULT / IDLE:
          // TWO RADIANT GLOWING RED SMILING ARCS: ^ ^
          // Exactly matching Image 2!
          faceCtx.strokeStyle = "#ED3327";
          faceCtx.lineWidth = 16;
          faceCtx.lineCap = "round";
          faceCtx.shadowColor = "#ED3327";
          faceCtx.shadowBlur = 34;

          faceCtx.beginPath();
          faceCtx.arc(leftEyeX, eyeY + 24, 46, Math.PI * 1.18, Math.PI * 1.82);
          faceCtx.stroke();

          faceCtx.beginPath();
          faceCtx.arc(rightEyeX, eyeY + 24, 46, Math.PI * 1.18, Math.PI * 1.82);
          faceCtx.stroke();

          // Inner bright core highlight
          faceCtx.strokeStyle = "#ffa59e";
          faceCtx.lineWidth = 6;
          faceCtx.shadowBlur = 12;

          faceCtx.beginPath();
          faceCtx.arc(leftEyeX, eyeY + 24, 46, Math.PI * 1.24, Math.PI * 1.76);
          faceCtx.stroke();

          faceCtx.beginPath();
          faceCtx.arc(rightEyeX, eyeY + 24, 46, Math.PI * 1.24, Math.PI * 1.76);
          faceCtx.stroke();
        }

        faceTexture.needsUpdate = true;
      };

      // Mouse Parallax tracking
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        stateRef.current.targetMouseX = x * 2;
        stateRef.current.targetMouseY = y * 2;
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      const handleClick = () => {
        if (onBotClick) onBotClick();
      };
      container.addEventListener("click", handleClick);

      // --- ANIMATION LOOP ---
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();
        const stateData = stateRef.current;

        // Smooth mouse damping
        stateData.currentMouseX += (stateData.targetMouseX - stateData.currentMouseX) * 0.05;
        stateData.currentMouseY += (stateData.targetMouseY - stateData.currentMouseY) * 0.05;

        // Gentle breathing motion
        const breathe = Math.sin(elapsed * 1.6) * 0.025;
        botRoot.position.y = -0.3 + breathe;

        // Head tracking: tilts gently towards cursor and code from center
        headGroup.rotation.y = stateData.currentMouseX * 0.18 + Math.sin(elapsed * 0.6) * 0.015;
        headGroup.rotation.x = 0.05 - stateData.currentMouseY * 0.1;
        torsoGroup.rotation.y = stateData.currentMouseX * 0.05;

        // Volumetric smoke drift
        smokeParticles.forEach((sm, idx) => {
          sm.rotation.z += 0.0006 * (idx % 2 === 0 ? 1 : -1);
          sm.position.y += Math.sin(elapsed * 0.4 + idx) * 0.0008;
        });

        // Render face
        renderFace(elapsed);

        // Render 3D Scene
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        updateBotPosition();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        container.removeEventListener("click", handleClick);

        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }

        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        });
        renderer.dispose();
      };
    } catch (e) {
      console.warn("WebGL initialization encountered an error:", e);
      setWebGlAvailable(false);
    }
  }, [onBotClick]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full pointer-events-auto cursor-pointer ${className}`}
      title="NEMI CORE-01 Bot — Ready for Autonomous Software Engineering"
    >
      {/* High-Resolution SVG Fallback matching friendly robot with glowing red smiling eyes */}
      {!webGlAvailable && (
        <div className="absolute inset-0 flex items-center justify-center opacity-90 pointer-events-none">
          <svg
            width="340"
            height="420"
            viewBox="0 0 340 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-auto h-[55%] drop-shadow-[0_0_50px_rgba(237,51,39,0.55)]"
          >
            {/* Robot Head */}
            <rect x="60" y="30" width="220" height="160" rx="36" fill="#111317" stroke="#ED3327" strokeWidth="2.5" />
            <rect x="80" y="50" width="180" height="120" rx="20" fill="#050608" stroke="#3A1515" strokeWidth="2" />
            {/* Glowing Smiling Eyes ^ ^ */}
            <path d="M110 125 Q 135 90 160 125" stroke="#ED3327" strokeWidth="12" strokeLinecap="round" fill="none" filter="drop-shadow(0 0 12px #ED3327)" />
            <path d="M180 125 Q 205 90 230 125" stroke="#ED3327" strokeWidth="12" strokeLinecap="round" fill="none" filter="drop-shadow(0 0 12px #ED3327)" />
            {/* Torso & Shoulder Ball Joint */}
            <rect x="100" y="210" width="140" height="180" rx="22" fill="#111317" stroke="#ED3327" strokeWidth="2" />
            <circle cx="255" cy="240" r="38" fill="#111317" stroke="#ED3327" strokeWidth="3" />
            <circle cx="255" cy="240" r="14" fill="#ED3327" filter="drop-shadow(0 0 10px #ED3327)" />
          </svg>
        </div>
      )}
    </div>
  );
}
