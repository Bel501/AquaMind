import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface SceneTargets {
  hero: number;
  data: number;
  prediction: number;
  leaks: number;
  optimal: number;
  waves: number;
  camX: number;
  camY: number;
  camZ: number;
}

interface WaterCanvas3DProps {
  enabled: boolean;
  targetsRef: React.MutableRefObject<SceneTargets>;
}

// Pre-allocated math helpers (zero GC inside render loop)
const _dummy = new THREE.Object3D();
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

function detectSoftwareGl(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function WaterCanvas3D({ enabled, targetsRef }: WaterCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile =
      window.matchMedia('(max-width: 767px)').matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 900);
    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: !isSoftwareGl && !isMobile,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const domEl = renderer.domElement;
    domEl.style.width = '100%';
    domEl.style.height = '100%';
    domEl.style.display = 'block';
    container.appendChild(domEl);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    domEl.addEventListener('webglcontextlost', onContextLost);
    domEl.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05121f);
    scene.fog = new THREE.FogExp2(0x05121f, 0.042);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 7.2);

    // Studio environment map for realistic water refraction and pipe highlights
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Warm/cool balanced 3-point lighting + hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x22d3ee, 0x05121f, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xe0f9ff, 2.5);
    keyLight.position.set(4.5, 5.5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 2.1);
    rimLight.position.set(-5, -2, -3.5);
    scene.add(rimLight);

    const agriAccentLight = new THREE.PointLight(0xa3e635, 1.4, 18);
    agriAccentLight.position.set(3, 3.2, 2.2);
    scene.add(agriAccentLight);

    // Subtle background light orbs to enrich water droplet refraction
    const backdropGroup = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.65, 14, 14);
    const orbColors = [0x22d3ee, 0x2dd4bf, 0x0284c7, 0xa3e635];
    const disposables: Array<{ dispose: () => void }> = [orbGeo, envTarget];

    for (let i = 0; i < 6; i++) {
      const orbMat = new THREE.MeshBasicMaterial({
        color: orbColors[i % orbColors.length],
        transparent: true,
        opacity: 0.16,
      });
      disposables.push(orbMat);
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set((i - 2.5) * 1.4, Math.sin(i * 1.7) * 1.6, -4.5 - (i % 3));
      orb.scale.setScalar(1.2 + (i % 3) * 0.65);
      backdropGroup.add(orb);
    }
    scene.add(backdropGroup);

    // =========================================================================
    // STATE 1: HERO — Composite Water Droplet + Caustic Core + Instanced Particles
    // =========================================================================
    const heroGroup = new THREE.Group();
    heroGroup.position.set(isMobile ? 0 : 1.7, 0.08, 0);
    scene.add(heroGroup);

    const dropPoints: THREE.Vector2[] = [];
    const latheSegs = isMobile ? 24 : 42;
    for (let i = 0; i <= latheSegs; i++) {
      const t = i / latheSegs;
      const y = (t - 0.42) * 2.75;
      const r = Math.sin(t * Math.PI) * Math.pow(1 - t * 0.72, 0.65) * 1.32;
      dropPoints.push(new THREE.Vector2(Math.max(0.001, r), y));
    }
    const dropGeo = new THREE.LatheGeometry(dropPoints, isMobile ? 28 : 54);
    const dropBasePos = new Float32Array(dropGeo.attributes.position.array);
    disposables.push(dropGeo);

    const useTransmission = !isSoftwareGl && !isMobile;
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xdffbff,
      transmission: useTransmission ? 0.94 : 0,
      opacity: useTransmission ? 1 : 0.62,
      transparent: true,
      roughness: 0.06,
      metalness: 0.0,
      ior: 1.333,
      thickness: 2.1,
      attenuationColor: new THREE.Color(0x0ea5e9),
      attenuationDistance: 2.6,
      iridescence: 0.4,
      iridescenceIOR: 1.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    disposables.push(dropMat);

    const dropMesh = new THREE.Mesh(dropGeo, dropMat);
    heroGroup.add(dropMesh);

    // Inner caustic core
    const coreGeo = new THREE.IcosahedronGeometry(0.42, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    disposables.push(coreGeo, coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = -0.15;
    heroGroup.add(coreMesh);

    // Thin orbital ring around droplet
    const dropRingGeo = new THREE.TorusGeometry(1.72, 0.012, 10, 72);
    const dropRingMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.35,
    });
    disposables.push(dropRingGeo, dropRingMat);
    const dropRingMesh = new THREE.Mesh(dropRingGeo, dropRingMat);
    dropRingMesh.rotation.set(Math.PI * 0.36, 0.25, 0);
    heroGroup.add(dropRingMesh);

    // Instanced water micro-droplets orbiting
    const dropletCount = isMobile ? 42 : 120;
    const microGeo = new THREE.SphereGeometry(0.032, 8, 8);
    const microMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    disposables.push(microGeo, microMat);

    const dropletsInstanced = new THREE.InstancedMesh(microGeo, microMat, dropletCount);
    dropletsInstanced.frustumCulled = false;
    const dropletData = Array.from({ length: dropletCount }, () => ({
      radius: 1.55 + Math.random() * 2.1,
      angle: Math.random() * Math.PI * 2,
      speed: 0.16 + Math.random() * 0.34,
      yOffset: (Math.random() - 0.5) * 2.9,
      scale: 0.55 + Math.random() * 1.35,
    }));
    heroGroup.add(dropletsInstanced);

    // =========================================================================
    // STATE 2: DATA — IoT Sensor Network + Pulsing Data Packets
    // =========================================================================
    const networkGroup = new THREE.Group();
    networkGroup.scale.setScalar(0.001);
    scene.add(networkGroup);

    const nodeCount = isMobile ? 18 : 32;
    const nodePositions: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.65 + (i % 3) * 0.42;
      nodePositions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.85,
          r * Math.sin(phi) * Math.sin(theta)
        )
      );
    }

    const nodeGeo = new THREE.IcosahedronGeometry(0.072, 1);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const nodeRingGeo = new THREE.TorusGeometry(0.13, 0.012, 8, 24);
    const nodeRingMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.5,
    });
    disposables.push(nodeGeo, nodeMat, nodeRingGeo, nodeRingMat);

    const nodesMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const nodeRingsMesh = new THREE.InstancedMesh(nodeRingGeo, nodeRingMat, nodeCount);

    nodePositions.forEach((pos, idx) => {
      _dummy.position.copy(pos);
      _dummy.rotation.set(idx * 0.4, idx * 0.7, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      nodesMesh.setMatrixAt(idx, _dummy.matrix);
      nodeRingsMesh.setMatrixAt(idx, _dummy.matrix);
    });
    nodesMesh.computeBoundingSphere();
    nodeRingsMesh.computeBoundingSphere();
    networkGroup.add(nodesMesh, nodeRingsMesh);

    const lineVerts: number[] = [];
    const edges: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.85) {
          lineVerts.push(
            nodePositions[i].x,
            nodePositions[i].y,
            nodePositions[i].z,
            nodePositions[j].x,
            nodePositions[j].y,
            nodePositions[j].z
          );
          edges.push([nodePositions[i], nodePositions[j]]);
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.4,
    });
    disposables.push(linesGeo, linesMat);
    networkGroup.add(new THREE.LineSegments(linesGeo, linesMat));

    const pulseCount = Math.min(edges.length, isMobile ? 14 : 34);
    const pulseGeo = new THREE.SphereGeometry(0.044, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xa3e635 });
    disposables.push(pulseGeo, pulseMat);
    const pulsesMesh = new THREE.InstancedMesh(pulseGeo, pulseMat, pulseCount);
    pulsesMesh.frustumCulled = false;
    networkGroup.add(pulsesMesh);

    // =========================================================================
    // STATE 3: PREDICTION — Isometric Low-Poly Terrain + Time-Series ML Curves
    // =========================================================================
    const terrainGroup = new THREE.Group();
    terrainGroup.rotation.set(-0.52, 0.65, 0.14);
    terrainGroup.scale.setScalar(0.001);
    scene.add(terrainGroup);

    const tSeg = isMobile ? 16 : 24;
    const terrainGeo = new THREE.PlaneGeometry(5.6, 5.6, tSeg, tSeg);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const tColors: number[] = [];
    const cDry = new THREE.Color(0x0a253a);
    const cMid = new THREE.Color(0x2dd4bf);
    const cIrrigated = new THREE.Color(0xa3e635);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const h =
        Math.sin(x * 0.9) * Math.cos(z * 0.85) * 0.55 +
        Math.sin((x + z) * 0.6) * 0.25;
      posAttr.setY(i, h);

      const normH = THREE.MathUtils.clamp((h + 0.7) / 1.4, 0, 1);
      const col =
        normH < 0.55
          ? cDry.clone().lerp(cMid, normH / 0.55)
          : cMid.clone().lerp(cIrrigated, (normH - 0.55) / 0.45);
      tColors.push(col.r, col.g, col.b);
    }
    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(tColors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.68,
      metalness: 0.12,
      transparent: true,
      opacity: 0.94,
    });
    const terrainWireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    disposables.push(terrainGeo, terrainMat, terrainWireMat);

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    const terrainWire = new THREE.Mesh(terrainGeo, terrainWireMat);
    terrainWire.position.y = 0.015;
    terrainGroup.add(terrainMesh, terrainWire);

    function buildForecastCurve(yBase: number, amp: number, colorHex: number) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 14; i++) {
        const x = -2.3 + (i / 14) * 4.6;
        const y = yBase + Math.sin(i * 0.65) * amp + (i / 14) * 0.45;
        const z = Math.cos(i * 0.45) * 0.7;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 44, 0.032, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.92,
      });
      disposables.push(tubeGeo, tubeMat);
      return new THREE.Mesh(tubeGeo, tubeMat);
    }

    terrainGroup.add(buildForecastCurve(1.05, 0.25, 0x22d3ee));
    terrainGroup.add(buildForecastCurve(1.45, 0.18, 0xa3e635));

    // =========================================================================
    // STATE 4: LEAKS — Composite 3D Pipe Network + Pulsing Leak + Spray Particles
    // =========================================================================
    const pipesGroup = new THREE.Group();
    pipesGroup.scale.setScalar(0.001);
    scene.add(pipesGroup);

    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x0e344e,
      metalness: 0.68,
      roughness: 0.28,
      emissive: 0x062033,
    });
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      metalness: 0.45,
      roughness: 0.55,
      emissive: 0x0891b2,
      emissiveIntensity: 0.35,
    });
    disposables.push(pipeMat, collarMat);

    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
    const flangeGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.14, 16);
    const jointGeo = new THREE.SphereGeometry(0.17, 14, 14);
    disposables.push(cylGeo, flangeGeo, jointGeo);

    function addPipeSegment(p1: THREE.Vector3, p2: THREE.Vector3, radius = 0.13) {
      _vecA.subVectors(p2, p1);
      const len = _vecA.length();
      const cyl = new THREE.Mesh(cylGeo, pipeMat);
      cyl.scale.set(radius, len, radius);
      cyl.position.copy(p1).addScaledVector(_vecA, 0.5);
      cyl.quaternion.setFromUnitVectors(_up, _vecB.copy(_vecA).normalize());
      pipesGroup.add(cyl);

      // Flanged collar midway
      const flange = new THREE.Mesh(flangeGeo, collarMat);
      flange.scale.set(radius, 1, radius);
      flange.position.copy(p1).addScaledVector(_vecA, 0.5);
      flange.quaternion.copy(cyl.quaternion);
      pipesGroup.add(flange);

      const joint = new THREE.Mesh(jointGeo, collarMat);
      joint.position.copy(p1);
      pipesGroup.add(joint);
    }

    addPipeSegment(new THREE.Vector3(-2.6, 0.6, 0), new THREE.Vector3(0.4, 0.6, 0));
    addPipeSegment(new THREE.Vector3(0.4, 0.6, 0), new THREE.Vector3(0.4, -1.0, 0.5));
    addPipeSegment(new THREE.Vector3(0.4, -1.0, 0.5), new THREE.Vector3(2.6, -1.0, 0.5));
    addPipeSegment(new THREE.Vector3(-1.2, 0.6, 0), new THREE.Vector3(-1.2, -0.7, -1.1));
    addPipeSegment(new THREE.Vector3(-1.2, -0.7, -1.1), new THREE.Vector3(1.8, -0.7, -1.1));

    const leakPos = new THREE.Vector3(0.4, 0.6, 0);
    const leakCoreGeo = new THREE.SphereGeometry(0.21, 16, 16);
    const leakCoreMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
    const leakHaloGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const leakHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(leakCoreGeo, leakCoreMat, leakHaloGeo, leakHaloMat);

    const leakCore = new THREE.Mesh(leakCoreGeo, leakCoreMat);
    leakCore.position.copy(leakPos);
    const leakHalo = new THREE.Mesh(leakHaloGeo, leakHaloMat);
    leakHalo.position.copy(leakPos);
    pipesGroup.add(leakCore, leakHalo);

    const ringGeo = new THREE.RingGeometry(0.25, 0.31, 32);
    disposables.push(ringGeo);
    const pulseRings = [0, 1, 2].map((i) => {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfb7185 : 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      disposables.push(mat);
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.position.copy(leakPos);
      pipesGroup.add(mesh);
      return { mesh, mat, phase: i / 3 };
    });

    // Spray particles escaping from leak
    const sprayCount = isMobile ? 12 : 24;
    const sprayGeo = new THREE.SphereGeometry(0.032, 6, 6);
    const sprayMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
    disposables.push(sprayGeo, sprayMat);
    const sprayMesh = new THREE.InstancedMesh(sprayGeo, sprayMat, sprayCount);
    sprayMesh.frustumCulled = false;
    const sprayData = Array.from({ length: sprayCount }, (_, i) => ({
      phase: i / sprayCount,
      vx: (Math.random() - 0.35) * 1.1,
      vz: (Math.random() - 0.5) * 1.1,
    }));
    pipesGroup.add(sprayMesh);

    // =========================================================================
    // STATE 5: OPTIMAL SPHERE & CTA WAVES
    // =========================================================================
    const optimalGroup = new THREE.Group();
    optimalGroup.scale.setScalar(0.001);
    scene.add(optimalGroup);

    const calmSphereGeo = new THREE.SphereGeometry(1.15, isMobile ? 24 : 44, isMobile ? 24 : 44);
    const auraGeo1 = new THREE.TorusGeometry(1.65, 0.015, 12, 80);
    const auraMat1 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.45,
    });
    const auraGeo2 = new THREE.TorusGeometry(2.05, 0.01, 10, 80);
    const auraMat2 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.26,
    });
    disposables.push(calmSphereGeo, auraGeo1, auraMat1, auraGeo2, auraMat2);

    const calmSphere = new THREE.Mesh(calmSphereGeo, dropMat);
    const auraRing1 = new THREE.Mesh(auraGeo1, auraMat1);
    auraRing1.rotation.x = Math.PI * 0.42;
    const auraRing2 = new THREE.Mesh(auraGeo2, auraMat2);
    auraRing2.rotation.set(-Math.PI * 0.32, 0.3, 0);
    optimalGroup.add(calmSphere, auraRing1, auraRing2);

    // 3D Ocean waves under CTA form
    const wavesGroup = new THREE.Group();
    wavesGroup.position.set(0, -1.75, -1.2);
    wavesGroup.scale.setScalar(0.001);
    scene.add(wavesGroup);

    const waveGeo = new THREE.PlaneGeometry(18, 10, isMobile ? 24 : 42, isMobile ? 14 : 24);
    waveGeo.rotateX(-Math.PI / 2.2);
    const waveBase = new Float32Array(waveGeo.attributes.position.array);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    disposables.push(waveGeo, waveMat);
    wavesGroup.add(new THREE.Mesh(waveGeo, waveMat));

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Current interpolated scene weights
    const currentWeights: SceneTargets = { ...targetsRef.current };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // RENDER LOOP (GPU rAF / Software WebGL afterDraw pacing)
    // =========================================================================
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = prefersReducedMotion ? 0.5 : clock.elapsedTime;
      const targets = targetsRef.current;

      // Frame-rate independent exponential damping
      const lambda = 6.5;
      currentWeights.hero = THREE.MathUtils.damp(currentWeights.hero, targets.hero, lambda, delta);
      currentWeights.data = THREE.MathUtils.damp(currentWeights.data, targets.data, lambda, delta);
      currentWeights.prediction = THREE.MathUtils.damp(
        currentWeights.prediction,
        targets.prediction,
        lambda,
        delta
      );
      currentWeights.leaks = THREE.MathUtils.damp(currentWeights.leaks, targets.leaks, lambda, delta);
      currentWeights.optimal = THREE.MathUtils.damp(
        currentWeights.optimal,
        targets.optimal,
        lambda,
        delta
      );
      currentWeights.waves = THREE.MathUtils.damp(currentWeights.waves, targets.waves, lambda, delta);
      currentWeights.camX = THREE.MathUtils.damp(currentWeights.camX, targets.camX, lambda, delta);
      currentWeights.camY = THREE.MathUtils.damp(currentWeights.camY, targets.camY, lambda, delta);
      currentWeights.camZ = THREE.MathUtils.damp(currentWeights.camZ, targets.camZ, lambda, delta);

      pointer.x = THREE.MathUtils.damp(pointer.x, pointer.tx, 5, delta);
      pointer.y = THREE.MathUtils.damp(pointer.y, pointer.ty, 5, delta);

      camera.position.set(
        currentWeights.camX + pointer.x * 0.38,
        currentWeights.camY + pointer.y * 0.25,
        currentWeights.camZ
      );
      camera.lookAt(0, 0, 0);

      // 1. Hero droplet
      const wHero = currentWeights.hero;
      heroGroup.visible = wHero > 0.01;
      if (heroGroup.visible) {
        heroGroup.scale.setScalar(Math.max(0.001, wHero));
        dropMesh.position.y = Math.sin(t * 1.4) * 0.14;
        dropMesh.rotation.y = t * 0.22 + pointer.x * 0.45;
        dropMesh.rotation.x = pointer.y * 0.22;
        coreMesh.rotation.y = -t * 0.4;
        dropRingMesh.rotation.z = t * 0.18;

        if (!isMobile && !prefersReducedMotion) {
          const dPos = dropGeo.attributes.position;
          for (let i = 0; i < dPos.count; i++) {
            const bx = dropBasePos[i * 3];
            const by = dropBasePos[i * 3 + 1];
            const bz = dropBasePos[i * 3 + 2];
            const ripple = 1 + Math.sin(by * 3.2 + t * 2.4) * 0.018;
            dPos.setXYZ(i, bx * ripple, by, bz * ripple);
          }
          dPos.needsUpdate = true;
        }

        for (let i = 0; i < dropletCount; i++) {
          const d = dropletData[i];
          const a = d.angle + t * d.speed;
          _dummy.position.set(
            Math.cos(a) * d.radius,
            d.yOffset + Math.sin(t * 1.2 + i) * 0.2,
            Math.sin(a) * d.radius
          );
          _dummy.scale.setScalar(d.scale * wHero);
          _dummy.updateMatrix();
          dropletsInstanced.setMatrixAt(i, _dummy.matrix);
        }
        dropletsInstanced.instanceMatrix.needsUpdate = true;
      }

      // 2. IoT Sensor Network
      const wData = currentWeights.data;
      networkGroup.visible = wData > 0.01;
      if (networkGroup.visible) {
        networkGroup.scale.setScalar(Math.max(0.001, wData));
        networkGroup.rotation.y = t * 0.18 + pointer.x * 0.3;
        networkGroup.rotation.x = pointer.y * 0.18;

        for (let i = 0; i < pulseCount; i++) {
          const [a, b] = edges[i];
          const p = (t * 0.65 + i * 0.13) % 1;
          _dummy.position.lerpVectors(a, b, p);
          _dummy.scale.setScalar(0.8 + Math.sin(p * Math.PI) * 0.7);
          _dummy.updateMatrix();
          pulsesMesh.setMatrixAt(i, _dummy.matrix);
        }
        pulsesMesh.instanceMatrix.needsUpdate = true;
      }

      // 3. Isometric Agricultural Terrain + Time-Series ML
      const wPred = currentWeights.prediction;
      terrainGroup.visible = wPred > 0.01;
      if (terrainGroup.visible) {
        terrainGroup.scale.setScalar(Math.max(0.001, wPred * 0.86));
        terrainGroup.rotation.y = 0.65 + Math.sin(t * 0.35) * 0.12 + pointer.x * 0.24;
      }

      // 4. Pipes & Leak Detection
      const wLeaks = currentWeights.leaks;
      pipesGroup.visible = wLeaks > 0.01;
      if (pipesGroup.visible) {
        pipesGroup.scale.setScalar(Math.max(0.001, wLeaks));
        pipesGroup.rotation.y = Math.sin(t * 0.3) * 0.2 + pointer.x * 0.24;
        pipesGroup.rotation.x = 0.12 + pointer.y * 0.14;

        leakHalo.scale.setScalar(1 + Math.sin(t * 5) * 0.22);

        for (let i = 0; i < pulseRings.length; i++) {
          const r = pulseRings[i];
          const cycle = (t * 0.85 + r.phase) % 1;
          r.mesh.scale.setScalar(0.7 + cycle * 3.4);
          r.mat.opacity = (1 - cycle) * 0.85 * wLeaks;
          r.mesh.lookAt(camera.position);
        }

        for (let i = 0; i < sprayCount; i++) {
          const s = sprayData[i];
          const cycle = (t * 1.15 + s.phase) % 1;
          _dummy.position.set(
            leakPos.x + s.vx * cycle,
            leakPos.y + cycle * 0.45 - cycle * cycle * 1.65,
            leakPos.z + s.vz * cycle
          );
          _dummy.scale.setScalar((1 - cycle) * 1.15);
          _dummy.updateMatrix();
          sprayMesh.setMatrixAt(i, _dummy.matrix);
        }
        sprayMesh.instanceMatrix.needsUpdate = true;
      }

      // 5. Balanced Water Sphere + 3D Waves
      const wOpt = currentWeights.optimal;
      optimalGroup.visible = wOpt > 0.01;
      if (optimalGroup.visible) {
        optimalGroup.scale.setScalar(Math.max(0.001, wOpt));
        calmSphere.position.y = Math.sin(t * 0.9) * 0.1;
        auraRing1.rotation.z = t * 0.24;
        auraRing2.rotation.z = -t * 0.18;
      }

      const wWaves = currentWeights.waves;
      wavesGroup.visible = wWaves > 0.01;
      if (wavesGroup.visible) {
        wavesGroup.scale.setScalar(Math.max(0.001, wWaves));
        const wPos = waveGeo.attributes.position;
        for (let i = 0; i < wPos.count; i++) {
          const bx = waveBase[i * 3];
          const by = waveBase[i * 3 + 1];
          const bz = waveBase[i * 3 + 2];
          const waveOffset =
            Math.sin(bx * 0.7 + t * 1.4) * 0.28 + Math.cos(bz * 0.8 + t * 1.1) * 0.2;
          wPos.setY(i, by + waveOffset);
        }
        wPos.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      domEl.removeEventListener('webglcontextrestored', onContextRestored);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, [enabled, targetsRef]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 w-screen h-screen pointer-events-none"
    >
      {contextLost && (
        <div
          className="w-full h-full"
          style={{
            background:
              'radial-gradient(circle at 70% 40%, rgba(34,211,238,0.16), transparent 55%), #05121F',
          }}
        />
      )}
    </div>
  );
}
