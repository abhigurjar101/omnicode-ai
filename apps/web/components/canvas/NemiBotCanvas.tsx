"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface NemiBotCanvasProps {
  isFocused?: boolean;
  isExecuting?: boolean;
  statusText?: string;
  className?: string;
  onScreenClick?: () => void;
}

export function NemiBotCanvas({
  isFocused = false,
  isExecuting = false,
  statusText = "",
  className = "",
  onScreenClick,
}: NemiBotCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState(true);

  const stateRef = useRef({
    isFocused,
    isExecuting,
    statusText,
    targetMouseX: 0,
    targetMouseY: 0,
    currentMouseX: 0,
    currentMouseY: 0,
  });

  useEffect(() => {
    stateRef.current.isFocused = isFocused;
    stateRef.current.isExecuting = isExecuting;
    stateRef.current.statusText = statusText;
  }, [isFocused, isExecuting, statusText]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) { setWebGlAvailable(false); return; }
    } catch { setWebGlAvailable(false); return; }

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;

    try {
      // 1. Scene
      const scene = new THREE.Scene();

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(
        24,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0.05, 6.5);
      camera.lookAt(0.3, 0.05, 0);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);

      // -------------------------------------------------------
      // 4. LIGHTING — Strong crimson BACK-RIGHT rim, dark front
      // -------------------------------------------------------
      // Low ambient to keep front faces DARK (matching reference)
      const ambientLight = new THREE.AmbientLight(0x0d0101, 2.0);
      scene.add(ambientLight);

      // Soft white key light from upper-LEFT front (adds gentle specular to bevel edges only)
      const keyLight = new THREE.DirectionalLight(0xfff0f0, 1.2);
      keyLight.position.set(-3.5, 4.0, 3.5);
      scene.add(keyLight);

      // PRIMARY: Strong crimson back-right rim (the dominant light in the reference)
      const rimMain = new THREE.DirectionalLight(0xff0d1a, 22.0);
      rimMain.position.set(3.5, 3.2, -3.0);
      scene.add(rimMain);

      // Secondary lower-right rim (illuminates body bottom-right corner)
      const rimLow = new THREE.DirectionalLight(0xff0d1a, 16.0);
      rimLow.position.set(4.5, -1.0, -2.6);
      scene.add(rimLow);

      // Top back crimson rim for hood/visor highlight
      const rimTop = new THREE.DirectionalLight(0xff1525, 12.0);
      rimTop.position.set(0.5, 5.8, -2.5);
      scene.add(rimTop);

      // Left back warm crimson fill (wraps around left side)
      const rimLeft = new THREE.DirectionalLight(0xcc0d18, 7.0);
      rimLeft.position.set(-3.0, 2.0, -3.5);
      scene.add(rimLeft);

      // -------------------------------------------------------
      // 5. SUBTLE SMOKE / ATMOSPHERIC NEBULA (behind the device)
      // -------------------------------------------------------
      const smokeCanvas = document.createElement("canvas");
      smokeCanvas.width = 128;
      smokeCanvas.height = 128;
      const sCtx = smokeCanvas.getContext("2d");
      if (sCtx) {
        const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        sGrad.addColorStop(0, "rgba(70, 5, 10, 0.18)");
        sGrad.addColorStop(0.5, "rgba(35, 2, 5, 0.08)");
        sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        sCtx.fillStyle = sGrad;
        sCtx.fillRect(0, 0, 128, 128);
      }
      const smokeTexture = new THREE.CanvasTexture(smokeCanvas);
      const smokeParticles: THREE.Mesh[] = [];

      for (let i = 0; i < 10; i++) {
        const geo = new THREE.PlaneGeometry(5.5 + Math.random() * 3.0, 5.5 + Math.random() * 3.0);
        const mat = new THREE.MeshBasicMaterial({
          map: smokeTexture,
          transparent: true,
          opacity: 0.10 + Math.random() * 0.12,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          1.2 + (Math.random() - 0.5) * 3.0,
          0.6 + (Math.random() - 0.5) * 2.5,
          -1.8 - Math.random() * 1.2
        );
        mesh.rotation.z = Math.random() * Math.PI * 2;
        scene.add(mesh);
        smokeParticles.push(mesh);
      }

      // -------------------------------------------------------
      // 6. 3D NEMI DEVICE — DARK MAROON BODY (matching reference)
      // -------------------------------------------------------
      const botRoot = new THREE.Group();
      scene.add(botRoot);

      // Responsive layout
      const updateResponsiveLayout = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);

        if (w < 768) {
          // Mobile
          camera.position.set(0.15, 0.04, 7.4);
          camera.lookAt(0.5, 0, 0);
          botRoot.position.set(1.35, -0.15, 0);
          botRoot.scale.setScalar(0.64);
        } else if (w < 1024) {
          // Tablet
          camera.position.set(0, 0.05, 7.0);
          camera.lookAt(0.35, 0, 0);
          botRoot.position.set(1.10, -0.18, 0);
          botRoot.scale.setScalar(0.76);
        } else {
          // Desktop
          camera.position.set(0, 0.05, 6.5);
          camera.lookAt(0.3, 0.05, 0);
          botRoot.position.set(0.88, -0.12, 0);
          botRoot.scale.setScalar(0.88);
        }
      };
      updateResponsiveLayout();

      // ---- MATERIALS ----
      // PRIMARY BODY: Dark wine/maroon red — the key visual difference from old gunmetal
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x3a0a0d,  // dark maroon/wine red — matches reference
        metalness: 0.74,
        roughness: 0.32,
      });

      // Slightly lighter maroon for chest plate (subtle surface variation)
      const chestMat = new THREE.MeshStandardMaterial({
        color: 0x2e0808,
        metalness: 0.70,
        roughness: 0.38,
      });

      // Monitor housing: dark charcoal (darker than body so the RED stands out more)
      const monitorMat = new THREE.MeshStandardMaterial({
        color: 0x1a1c24,
        metalness: 0.86,
        roughness: 0.22,
      });

      // Visor/hood titanium
      const hoodMat = new THREE.MeshStandardMaterial({
        color: 0x1f2130,
        metalness: 0.92,
        roughness: 0.16,
      });

      // Polished chrome
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xccd4e0,
        metalness: 0.98,
        roughness: 0.07,
      });

      // Dark alloy (fan blades)
      const darkAlloyMat = new THREE.MeshStandardMaterial({
        color: 0x3a4050,
        metalness: 0.95,
        roughness: 0.12,
      });

      // Matte cavity black
      const cavityMat = new THREE.MeshStandardMaterial({
        color: 0x030406,
        metalness: 0.40,
        roughness: 0.65,
      });

      // Amber indicator
      const amberMat = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff5500,
        emissiveIntensity: 7.0,
        roughness: 0.10,
      });

      // Subtle red rim edge
      const redEdgeMat = new THREE.MeshStandardMaterial({
        color: 0xff3333,
        emissive: 0xcc1111,
        emissiveIntensity: 0.35,
        metalness: 0.96,
        roughness: 0.10,
      });

      // ---- 1. TORSO / BODY CHASSIS ----
      const torsoGroup = new THREE.Group();
      botRoot.add(torsoGroup);
      torsoGroup.position.set(0, -0.15, 0);

      // Main body box
      const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.58, 1.15), bodyMat);
      torsoMesh.position.set(0, -0.12, 0);
      torsoGroup.add(torsoMesh);

      // Rounded shoulder top fillet
      const shoulderTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 1.78, 32),
        bodyMat
      );
      shoulderTop.rotation.z = Math.PI / 2;
      shoulderTop.position.set(0, 0.67, 0);
      torsoGroup.add(shoulderTop);

      // Front chest plate (inset)
      const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(1.68, 1.42, 0.05), chestMat);
      chestPlate.position.set(0, -0.10, 0.58);
      torsoGroup.add(chestPlate);

      // ---- RECESSED TURBINE FAN (Front Left) ----
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(-0.35, 0.10, 0.60);
      torsoGroup.add(turbineGroup);

      const turbineRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.032, 20, 48),
        chromeMat
      );
      turbineGroup.add(turbineRing);

      const turbineCavity = new THREE.Mesh(
        new THREE.CylinderGeometry(0.30, 0.30, 0.08, 36),
        cavityMat
      );
      turbineCavity.rotation.x = Math.PI / 2;
      turbineCavity.position.set(0, 0, -0.04);
      turbineGroup.add(turbineCavity);

      const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 24), chromeMat);
      spinner.rotation.x = Math.PI / 2;
      spinner.position.set(0, 0, 0.03);
      turbineGroup.add(spinner);

      const fanBladeGroup = new THREE.Group();
      turbineGroup.add(fanBladeGroup);
      for (let b = 0; b < 5; b++) {
        const angle = (b / 5) * Math.PI * 2;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.23, 0.065), darkAlloyMat);
        blade.position.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, -0.01);
        blade.rotation.z = angle + 0.42;
        fanBladeGroup.add(blade);
      }

      // ---- RIGHT SIDE GEOMETRIC PANEL INSET ----
      const notchGroup = new THREE.Group();
      notchGroup.position.set(0.42, 0.10, 0.59);
      torsoGroup.add(notchGroup);

      const notchMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.42, 0.03), bodyMat);
      notchMesh.rotation.z = -0.12;
      notchGroup.add(notchMesh);

      const notchTrim = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.035), chromeMat);
      notchTrim.position.set(0, 0.19, 0.01);
      notchTrim.rotation.z = -0.12;
      notchGroup.add(notchTrim);

      // ---- VENT GRID (below fan) ----
      const ventGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.02, 12);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 10; c++) {
          const vent = new THREE.Mesh(ventGeo, cavityMat);
          vent.rotation.x = Math.PI / 2;
          vent.position.set(-0.56 + c * 0.09, -0.46 + r * 0.065, 0.61);
          torsoGroup.add(vent);
        }
      }

      // ---- GLOWING AMBER INDICATOR ----
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, 0.04), amberMat);
      badge.position.set(0.48, -0.46, 0.61);
      torsoGroup.add(badge);
      const badgeLight = new THREE.PointLight(0xff6600, 3.0, 1.8);
      badgeLight.position.set(0.48, -0.46, 0.74);
      torsoGroup.add(badgeLight);

      // ---- 2. NECK / PEDESTAL ----
      const neckGroup = new THREE.Group();
      neckGroup.position.set(0, 0.68, 0);
      botRoot.add(neckGroup);

      // Neck column (dark maroon matching body)
      const neckCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 0.20, 48),
        bodyMat  // was chromeMat — now dark maroon to match reference
      );
      neckGroup.add(neckCollar);

      // Thin chrome accent rings
      const rimGeo = new THREE.TorusGeometry(0.24, 0.018, 16, 48);
      const collarTopRim = new THREE.Mesh(rimGeo, chromeMat);
      collarTopRim.rotation.x = Math.PI / 2;
      collarTopRim.position.set(0, 0.09, 0);
      neckGroup.add(collarTopRim);

      const collarBotRim = new THREE.Mesh(rimGeo, chromeMat);
      collarBotRim.rotation.x = Math.PI / 2;
      collarBotRim.position.set(0, -0.09, 0);
      neckGroup.add(collarBotRim);

      // ---- 3. MONITOR HEAD & HOOD ----
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.28, 0.02);
      headGroup.rotation.x = -0.06;
      headGroup.rotation.y = 0.07;
      botRoot.add(headGroup);

      // Main monitor housing (charcoal)
      const monitorHousing = new THREE.Mesh(new THREE.BoxGeometry(1.44, 1.02, 0.72), monitorMat);
      monitorHousing.position.set(0, 0, -0.10);
      headGroup.add(monitorHousing);

      // Angled visor hood
      const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.08, 0.54), hoodMat);
      hoodTop.position.set(0, 0.52, 0.32);
      hoodTop.rotation.x = 0.18;
      headGroup.add(hoodTop);

      const hoodRear = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.06, 0.30), hoodMat);
      hoodRear.position.set(0, 0.52, -0.18);
      hoodRear.rotation.x = -0.22;
      headGroup.add(hoodRear);

      const hoodSideGeo = new THREE.BoxGeometry(0.08, 1.00, 0.48);
      const hoodLeft = new THREE.Mesh(hoodSideGeo, hoodMat);
      hoodLeft.position.set(-0.73, 0.02, 0.30);
      hoodLeft.rotation.y = -0.06;
      headGroup.add(hoodLeft);

      const hoodRight = new THREE.Mesh(hoodSideGeo, hoodMat);
      hoodRight.position.set(0.73, 0.02, 0.30);
      hoodRight.rotation.y = 0.06;
      headGroup.add(hoodRight);

      // Visor lip (red edge)
      const visorLip = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.035, 0.04), redEdgeMat);
      visorLip.position.set(0, 0.57, 0.58);
      headGroup.add(visorLip);

      // Side pivot hinges (chrome)
      const earGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24);
      const earLeft = new THREE.Mesh(earGeo, chromeMat);
      earLeft.rotation.z = Math.PI / 2;
      earLeft.position.set(-0.77, 0.02, 0.04);
      headGroup.add(earLeft);

      const earRight = new THREE.Mesh(earGeo, chromeMat);
      earRight.rotation.z = Math.PI / 2;
      earRight.position.set(0.77, 0.02, 0.04);
      headGroup.add(earRight);

      // CRT bezel frame
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.88, 0.05), cavityMat);
      bezel.position.set(0, 0.02, 0.30);
      headGroup.add(bezel);

      // ---- 4. CRT SCREEN — SERVICES LIST (exact Junca Studio reference) ----
      const crtCanvas = document.createElement("canvas");
      crtCanvas.width = 640;
      crtCanvas.height = 480;
      const crtCtx = crtCanvas.getContext("2d");
      const crtTexture = new THREE.CanvasTexture(crtCanvas);

      const screenGeo = new THREE.PlaneGeometry(1.18, 0.80, 16, 16);
      const screenMat = new THREE.MeshBasicMaterial({ map: crtTexture, transparent: false });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0.02, 0.38);
      headGroup.add(screenMesh);

      const renderCrtScreen = (time: number) => {
        if (!crtCtx) return;

        // Near-black background
        crtCtx.fillStyle = "#010204";
        crtCtx.fillRect(0, 0, 640, 480);

        // Subtle scanlines
        crtCtx.fillStyle = "rgba(0, 0, 0, 0.28)";
        for (let y = 0; y < 480; y += 4) {
          crtCtx.fillRect(0, y, 640, 2);
        }

        crtCtx.textAlign = "left";
        crtCtx.shadowBlur = 0;

        // ● SERVICES header — red dot + white text (matching reference exactly)
        crtCtx.font = "bold 18px 'Courier New', monospace";
        crtCtx.fillStyle = "#ff2020";
        crtCtx.fillText("●", 62, 88);

        crtCtx.fillStyle = "#CCCCCC";
        crtCtx.fillText(" SERVICES", 78, 88);

        // Services list items (NEMI-CODE adapted from Junca Studio reference)
        crtCtx.font = "14px 'Courier New', monospace";
        crtCtx.fillStyle = "#A8B0BC";
        const services = [
          "01  Autonomous coding",
          "02  Multi-agent mesh",
          "03  3D & motion design",
          "04  Brand & UX systems",
          "05  SEO & GEO",
        ];

        services.forEach((line, i) => {
          // Subtle blinking cursor on last visible line, synchronized to time
          const isActive = Math.floor(time * 1.6) % services.length === i;
          crtCtx.fillStyle = isActive ? "#D8E0EC" : "#7A8898";
          crtCtx.fillText(line, 62, 118 + i * 30);
        });

        // Bottom status line
        crtCtx.font = "11px 'Courier New', monospace";
        crtCtx.fillStyle = "#55677A";
        crtCtx.shadowBlur = 0;
        crtCtx.fillText("NEMI OS  v0.1", 62, 428);

        crtCtx.textAlign = "right";
        crtCtx.fillStyle = "#6A7A8C";
        crtCtx.fillText("AI REPOR", 578, 428);

        crtTexture.needsUpdate = true;
      };

      // ---- 7. MOUSE TRACKING ----
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        stateRef.current.targetMouseX = x * 2;
        stateRef.current.targetMouseY = y * 2;
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("resize", updateResponsiveLayout);

      // ---- 8. ANIMATION LOOP ----
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Smooth mouse lerp
        stateRef.current.currentMouseX +=
          (stateRef.current.targetMouseX - stateRef.current.currentMouseX) * 0.04;
        stateRef.current.currentMouseY +=
          (stateRef.current.targetMouseY - stateRef.current.currentMouseY) * 0.04;

        // Idle breathing bob
        const idleBob = Math.sin(t * 0.9) * 0.018;
        const idleSway = Math.cos(t * 0.6) * 0.009;

        botRoot.position.y = -0.12 + idleBob;

        // Head tracks cursor
        headGroup.rotation.y = 0.07 + stateRef.current.currentMouseX * 0.16 + idleSway;
        headGroup.rotation.x = -0.06 - stateRef.current.currentMouseY * 0.10;

        // Fan rotation
        fanBladeGroup.rotation.z += 0.024;

        // Smoke drift
        for (let i = 0; i < smokeParticles.length; i++) {
          smokeParticles[i].rotation.z += 0.0005 * (i % 2 === 0 ? 1 : -1);
        }

        renderCrtScreen(t);
        renderer.render(scene, camera);
      };

      animate();

      // ---- 9. CLEANUP ----
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", updateResponsiveLayout);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (e) {
      console.error("Three.js initialization error:", e);
      setWebGlAvailable(false);
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative cursor-pointer select-none ${className}`}
      onClick={onScreenClick}
      title="Click to launch NEMI-CODE Workspace"
    >
      {!webGlAvailable && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-black/80 backdrop-blur-md">
          <div className="max-w-md border border-[#ff2a2a]/40 bg-[#160205] p-6 text-left">
            <div className="text-[13px] font-mono text-[#ff4a4a] mb-2 font-semibold">● 3D ACCELERATION INACTIVE</div>
            <p className="text-[14px] text-[#A7A7A7] leading-relaxed mb-4">
              Hardware WebGL rendering is currently unavailable in this environment.
            </p>
            <button
              onClick={onScreenClick}
              className="px-4 py-2 bg-[#ff2626] text-white text-[13px] font-medium"
            >
              Open NEMI Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
