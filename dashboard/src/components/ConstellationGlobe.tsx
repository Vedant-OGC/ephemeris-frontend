import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Satellite, SatelliteHealth } from '../types';
import { Target, Globe as GlobeIcon, RotateCcw, ZoomIn, ZoomOut, Compass, Sparkles, Navigation } from 'lucide-react';

interface ConstellationGlobeProps {
  satellites: Satellite[];
  selectedSatelliteId: string;
  onSelectSatellite: (id: string) => void;
  isSimulating: boolean;
}

// Generate high-resolution procedural Earth texture (2048x1024)
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Space Oceanic Background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#03050c');
  oceanGrad.addColorStop(0.3, '#060b18');
  oceanGrad.addColorStop(0.5, '#071022');
  oceanGrad.addColorStop(0.7, '#060b18');
  oceanGrad.addColorStop(1, '#03050c');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Technical Lat/Lon Coordinate Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = 0; lat <= 1024; lat += 64) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(2048, lat);
    ctx.stroke();
  }
  for (let lon = 0; lon <= 2048; lon += 64) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, 1024);
    ctx.stroke();
  }

  // Equator line highlight
  ctx.strokeStyle = 'rgba(111, 242, 192, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(2048, 512);
  ctx.stroke();

  // Prime Meridian highlight
  ctx.beginPath();
  ctx.moveTo(1024, 0);
  ctx.lineTo(1024, 1024);
  ctx.stroke();

  // Helper for drawing stylized landmasses
  const drawLandmass = (pathFn: () => void, fillColor = '#09182d', strokeColor = '#1e3a5f') => {
    ctx.save();
    ctx.beginPath();
    pathFn();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  };

  // 3. Eurasia & Asia
  drawLandmass(() => {
    ctx.moveTo(1100, 320);
    ctx.bezierCurveTo(1200, 260, 1400, 280, 1550, 340);
    ctx.bezierCurveTo(1650, 400, 1680, 520, 1580, 580);
    ctx.bezierCurveTo(1450, 620, 1380, 560, 1320, 510);
    ctx.bezierCurveTo(1240, 480, 1160, 440, 1100, 320);
  }, '#0a1d35', '#1e406d');

  // 4. Indian Subcontinent & Regional Footprint (NavIC Core Area)
  drawLandmass(() => {
    ctx.moveTo(1330, 420);
    ctx.lineTo(1450, 430);
    ctx.lineTo(1420, 560); // Southern tip (Kanyakumari)
    ctx.lineTo(1320, 490);
    ctx.closePath();
  }, '#0f324d', '#6FF2C0');

  // Sri Lanka
  drawLandmass(() => {
    ctx.ellipse(1430, 585, 12, 18, 0.2, 0, Math.PI * 2);
  }, '#0f324d', '#6FF2C0');

  // NavIC 1500km Primary Coverage Ring on Earth Texture
  ctx.save();
  ctx.beginPath();
  ctx.arc(1385, 490, 130, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(111, 242, 192, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.restore();

  // 5. Africa
  drawLandmass(() => {
    ctx.moveTo(1050, 440);
    ctx.bezierCurveTo(1160, 450, 1200, 560, 1180, 680);
    ctx.bezierCurveTo(1140, 780, 1080, 780, 1040, 680);
    ctx.bezierCurveTo(980, 580, 960, 470, 1050, 440);
  });

  // 6. Europe
  drawLandmass(() => {
    ctx.moveTo(1000, 300);
    ctx.bezierCurveTo(1120, 260, 1180, 320, 1140, 410);
    ctx.bezierCurveTo(1060, 440, 980, 400, 1000, 300);
  });

  // 7. Southeast Asia & East Asia
  drawLandmass(() => {
    ctx.moveTo(1500, 450);
    ctx.bezierCurveTo(1600, 440, 1660, 500, 1620, 600);
    ctx.bezierCurveTo(1540, 620, 1480, 560, 1500, 450);
  });

  // 8. Australia
  drawLandmass(() => {
    ctx.ellipse(1680, 720, 90, 70, 0.1, 0, Math.PI * 2);
  });

  // 9. Americas (North & South)
  drawLandmass(() => {
    ctx.moveTo(480, 260);
    ctx.bezierCurveTo(620, 280, 660, 400, 580, 480);
    ctx.bezierCurveTo(500, 500, 440, 420, 480, 260);
  });
  drawLandmass(() => {
    ctx.moveTo(600, 520);
    ctx.bezierCurveTo(720, 560, 740, 720, 660, 840);
    ctx.bezierCurveTo(580, 800, 560, 660, 600, 520);
  });

  // 10. City Lights Clusters (Luminous Dots)
  const drawCityLight = (x: number, y: number, r: number, color: string, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const cities = [
    // India & Regional (Bengaluru ISTRAC, Delhi, Mumbai, Hyderabad, Kolkata, Chennai)
    [1390, 510, 3.5, '#6FF2C0', 1.0], // Bengaluru
    [1365, 430, 3.2, '#6FF2C0', 0.95], // Delhi
    [1340, 480, 3.2, '#38BDF8', 0.95], // Mumbai
    [1380, 485, 2.8, '#6FF2C0', 0.9], // Hyderabad
    [1440, 470, 2.8, '#FBBF24', 0.9], // Kolkata
    [1400, 530, 3.0, '#38BDF8', 0.9], // Chennai
    // Global Hubs
    [1520, 580, 3.2, '#38BDF8', 0.9], // Singapore
    [1680, 400, 3.5, '#FBBF24', 0.9], // Tokyo
    [1250, 440, 3.2, '#FBBF24', 0.9], // Dubai
    [1060, 310, 3.2, '#38BDF8', 0.85], // London
    [540, 360, 3.8, '#FBBF24', 0.9], // New York
  ];
  cities.forEach(([x, y, r, c, a]) => drawCityLight(x as number, y as number, r as number, c as string, a as number));

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const ConstellationGlobe: React.FC<ConstellationGlobeProps> = ({
  satellites,
  selectedSatelliteId,
  onSelectSatellite,
  isSimulating,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Mouse drag & interaction states
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });

  const [satLabels, setSatLabels] = useState<{
    id: string;
    x: number;
    y: number;
    color: string;
    health: SatelliteHealth;
    visible: boolean;
  }[]>([]);

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    earthMesh: THREE.Mesh;
    globeGroup: THREE.Group;
    satelliteMeshes: Map<string, THREE.Group>;
    satAngles: Map<string, number>;
  } | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040306);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.4, 5.8);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Master Globe Group for Smooth Rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(6, 4, 6);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x6FF2C0, 1.2);
    cyanRimLight.position.set(-6, -2, -4);
    scene.add(cyanRimLight);

    // Earth Sphere
    const earthRadius = 1.45;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTexture = createEarthCanvasTexture();
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 30,
      specular: new THREE.Color(0x1a3a5a),
      emissive: new THREE.Color(0x02050b),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    // Face India towards default camera view
    earthMesh.rotation.y = -Math.PI * 0.42;
    earthMesh.rotation.x = 0.18;
    globeGroup.add(earthMesh);

    // Atmospheric Glow Shell
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.025, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x6FF2C0,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Deep Space Starfield
    const starCount = 400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 30 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Orbital Rings Group (Within globeGroup so they tilt/rotate together if desired)
    const orbitRings = new THREE.Group();
    globeGroup.add(orbitRings);

    // 1. GEO Equatorial Ring (0° inclination, r = 2.48)
    const geoRingGeo = new THREE.RingGeometry(2.46, 2.49, 128);
    const geoRingMat = new THREE.MeshBasicMaterial({
      color: 0x6FF2C0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const geoRing = new THREE.Mesh(geoRingGeo, geoRingMat);
    geoRing.rotation.x = Math.PI / 2;
    orbitRings.add(geoRing);

    // 2. GSO Inclined Rings (29° inclination, NavIC orbital planes)
    const gsoAngles = [0, Math.PI * 0.5];
    gsoAngles.forEach((angle) => {
      const gsoRingGeo = new THREE.RingGeometry(2.46, 2.49, 128);
      const gsoRingMat = new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const gsoRing = new THREE.Mesh(gsoRingGeo, gsoRingMat);
      gsoRing.rotation.x = (29 * Math.PI) / 180;
      gsoRing.rotation.y = angle;
      orbitRings.add(gsoRing);
    });

    // Satellite meshes mapping
    const satelliteMeshes = new Map<string, THREE.Group>();
    const satAngles = new Map<string, number>();

    satellites.forEach((sat) => {
      const satGroup = new THREE.Group();

      // Satellite Main Body
      const bodyGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      satGroup.add(bodyMesh);

      // Solar Panels
      const panelGeo = new THREE.BoxGeometry(0.3, 0.04, 0.01);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x38BDF8,
        metalness: 0.95,
        roughness: 0.05,
      });
      const panelMesh = new THREE.Mesh(panelGeo, panelMat);
      satGroup.add(panelMesh);

      // Status Beacon Glow (Steady, luminous)
      const beaconColor = sat.color ? parseInt(sat.color.replace('#', '0x')) : 0x6FF2C0;
      const beaconGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        transparent: true,
        opacity: 0.95,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.07;
      satGroup.add(beacon);

      globeGroup.add(satGroup);
      satelliteMeshes.set(sat.id, satGroup);
      satAngles.set(sat.id, sat.currentAngle);
    });

    sceneRef.current = {
      scene,
      camera,
      renderer,
      earthMesh,
      globeGroup,
      satelliteMeshes,
      satAngles,
    };

    // Animation Loop with Drag Damping
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (sceneRef.current) {
        const { globeGroup, earthMesh, satelliteMeshes, satAngles, camera, renderer, scene } = sceneRef.current;

        // Auto-rotation when not dragging
        if (autoRotate && !isDraggingRef.current) {
          globeGroup.rotation.y += delta * 0.08;
        }

        // Apply drag damping
        if (!isDraggingRef.current) {
          globeGroup.rotation.y += rotationVelocityRef.current.x;
          globeGroup.rotation.x += rotationVelocityRef.current.y;
          rotationVelocityRef.current.x *= 0.92;
          rotationVelocityRef.current.y *= 0.92;
        }

        const updatedLabels: typeof satLabels = [];

        satellites.forEach((sat) => {
          const satMesh = satelliteMeshes.get(sat.id);
          let angle = satAngles.get(sat.id) || 0;

          if (isSimulating) {
            angle += sat.orbitSpeed * 1.5;
            satAngles.set(sat.id, angle);
          }

          if (satMesh) {
            const r = sat.orbitRadius;
            let x = 0, y = 0, z = 0;

            if (sat.type === 'GEO') {
              x = Math.cos(angle) * r;
              z = Math.sin(angle) * r;
              y = Math.sin(angle * 0.5) * (sat.inclination * 0.01);
            } else {
              const inc = sat.inclinationRad || 0.506;
              x = Math.cos(angle) * r;
              z = Math.sin(angle) * r * Math.cos(inc);
              y = Math.sin(angle) * r * Math.sin(inc);
            }

            satMesh.position.set(x, y, z);
            satMesh.lookAt(0, 0, 0);

            // Project 3D coordinate through master globe matrix
            const worldPos = new THREE.Vector3();
            satMesh.getWorldPosition(worldPos);

            const tempV = worldPos.clone();
            tempV.project(camera);

            const isFront = tempV.z < 1.0;
            const sx = ((tempV.x + 1) * width) / 2;
            const sy = ((-tempV.y + 1) * height) / 2;

            if (isFront && sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
              updatedLabels.push({
                id: sat.id,
                x: sx,
                y: sy,
                color: sat.color,
                health: sat.health,
                visible: true,
              });
            }
          }
        });

        setSatLabels(updatedLabels);
        renderer.render(scene, camera);
      }
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = newWidth / newHeight;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [autoRotate, isSimulating, satellites]);

  // Pointer Drag Handlers for 3D Orbit Control
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !sceneRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    const rotSpeed = 0.005;
    sceneRef.current.globeGroup.rotation.y += deltaX * rotSpeed;
    sceneRef.current.globeGroup.rotation.x += deltaY * rotSpeed;

    // Clamp vertical tilt
    sceneRef.current.globeGroup.rotation.x = Math.max(
      -Math.PI * 0.35,
      Math.min(Math.PI * 0.35, sceneRef.current.globeGroup.rotation.x)
    );

    rotationVelocityRef.current = {
      x: deltaX * rotSpeed * 0.5,
      y: deltaY * rotSpeed * 0.5,
    };

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;
    const zoomDelta = e.deltaY * 0.002;
    const newDistance = camera.position.length() + zoomDelta;
    if (newDistance >= 3.5 && newDistance <= 9.0) {
      camera.position.setLength(newDistance);
    }
  };

  // Camera Focus Controls
  const handleFocusSelected = () => {
    if (!sceneRef.current) return;
    const { camera, satelliteMeshes } = sceneRef.current;
    const mesh = satelliteMeshes.get(selectedSatelliteId);
    if (mesh) {
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      camera.position.set(worldPos.x * 1.3, worldPos.y * 1.3 + 0.5, worldPos.z * 1.3 + 2.2);
      camera.lookAt(worldPos);
    }
  };

  const handleResetCamera = () => {
    if (!sceneRef.current) return;
    const { camera, globeGroup } = sceneRef.current;
    camera.position.set(0, 1.4, 5.8);
    camera.lookAt(0, 0, 0);
    globeGroup.rotation.set(0, 0, 0);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;
    const factor = direction === 'in' ? 0.88 : 1.14;
    const newLength = camera.position.length() * factor;
    if (newLength >= 3.5 && newLength <= 9.0) {
      camera.position.setLength(newLength);
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-[480px] bg-[#040306] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between select-none"
    >
      {/* 1. Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div>
          <h2 className="text-xs uppercase font-mono tracking-widest text-white font-bold flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>NAVIC CONSTELLATION ORBIT TRACKER</span>
          </h2>
          <p className="text-[10px] text-white/50 font-mono mt-0.5">
            Real-Time 3D Spatial Geometry [IRNSS-1A..1I] &bull; 3 GEO (0°) + 5 GSO (29°)
          </p>
        </div>

        {/* Orbit Filter Chips */}
        <div className="pointer-events-auto flex items-center space-x-1 liquid-glass bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
          {['ALL', 'GEO', 'IGSO'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterType(mode)}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                filterType === mode
                  ? 'bg-emerald-500/20 text-[#6FF2C0] border border-emerald-500/40 font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Health Status Legend Box */}
      <div className="absolute top-16 left-4 z-10 liquid-glass bg-black/80 border border-white/10 rounded-xl p-3 shadow-2xl pointer-events-auto font-mono">
        <div className="text-[9px] uppercase tracking-widest text-white/50 font-semibold mb-1.5">
          FLEET HEALTH
        </div>
        <div className="space-y-1.5 text-xs font-medium">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#6FF2C0]"></span>
            <span className="text-white/90 text-[11px]">Nominal (7 Sats)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
            <span className="text-white/90 text-[11px]">Diurnal Peak (1 Sat)</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Three.js Canvas with Pointer Drag Event Handlers */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* 4. Interactive 2D Satellite Badges floating over 3D coordinates */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {satLabels.map((lbl) => {
          const isSelected = lbl.id === selectedSatelliteId;
          return (
            <div
              key={lbl.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSatellite(lbl.id);
              }}
              style={{
                left: `${lbl.x}px`,
                top: `${lbl.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xl ${
                isSelected
                  ? 'bg-white text-black border-2 border-[#6FF2C0] scale-125 z-20 button-glow'
                  : 'bg-black/85 hover:bg-black text-white border border-white/20 hover:scale-110 z-10'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: lbl.color }}
              />
              <span style={{ color: isSelected ? '#000' : lbl.color }}>{lbl.id}</span>
            </div>
          );
        })}
      </div>

      {/* 5. Camera & Interactive Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2 pointer-events-auto">
        <div className="liquid-glass bg-black/80 border border-white/10 rounded-xl p-1 flex flex-col space-y-1 shadow-2xl">
          <button
            onClick={handleFocusSelected}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-[#6FF2C0] transition-colors cursor-pointer"
            title="Focus Camera on Selected Satellite"
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCamera}
            className="px-2 py-1 rounded-lg hover:bg-white/10 text-[9px] font-mono font-bold text-[#6FF2C0] transition-colors cursor-pointer"
            title="Reset Perspective"
          >
            RESET
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              autoRotate ? 'text-[#6FF2C0] bg-emerald-950/40' : 'text-white/40 hover:text-white'
            }`}
            title={autoRotate ? 'Pause Earth Rotation' : 'Auto Rotate Earth'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="liquid-glass bg-black/80 border border-white/10 rounded-xl p-1 flex space-x-1 shadow-2xl">
          <button
            onClick={() => handleZoom('in')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Selected Target Quick Badge */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
        <div className="liquid-glass bg-black/80 border border-white/10 rounded-full px-4 py-1.5 text-xs flex items-center space-x-2 font-mono shadow-2xl">
          <span className="text-white/40 text-[10px]">TARGET:</span>
          <span className="font-bold text-[#6FF2C0]">{selectedSatelliteId}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 text-[10px]">ALTITUDE:</span>
          <span className="text-white text-[10px]">
            {satellites.find((s) => s.id === selectedSatelliteId)?.altitudeKm.toLocaleString() || '35,786'} km
          </span>
        </div>
      </div>
    </div>
  );
};
