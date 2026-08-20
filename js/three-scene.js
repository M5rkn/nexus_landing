(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const PARTICLE_COUNT = 120;
  const SPREAD = 70;
  const CONNECTION_DISTANCE = 12;
  const MOUSE_RADIUS = 18;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const orangeColor = new THREE.Color(0xff6b2c);
  const grayColor = new THREE.Color(0x4a4a5a);
  const lightGray = new THREE.Color(0x6b7280);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD * 0.5;

    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

    const isAccent = Math.random() < 0.15;
    const color = isAccent ? orangeColor : (Math.random() < 0.5 ? grayColor : lightGray);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const MAX_LINES = PARTICLE_COUNT * 6;
  const linePositions = new Float32Array(MAX_LINES * 6);
  const lineColors = new Float32Array(MAX_LINES * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const mouse = { x: 0, y: 0, active: false };

  function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.active = true;
  }
  function onMouseLeave() {
    mouse.active = false;
  }

  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mouseleave', onMouseLeave, { passive: true });

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    const pos = particleGeo.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      const half = SPREAD / 2;
      if (Math.abs(pos[i3]) > half) velocities[i3] *= -1;
      if (Math.abs(pos[i3 + 1]) > half) velocities[i3 + 1] *= -1;
      if (Math.abs(pos[i3 + 2]) > half * 0.5) velocities[i3 + 2] *= -1;
    }

    if (mouse.active) {
      const mx = mouse.x * SPREAD * 0.4;
      const my = mouse.y * SPREAD * 0.4;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const dx = pos[i3] - mx;
        const dy = pos[i3 + 1] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0.1) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.03;
          pos[i3] += (dx / dist) * force;
          pos[i3 + 1] += (dy / dist) * force;
        }
      }
    }

    particleGeo.attributes.position.needsUpdate = true;

    let lineIdx = 0;
    const lPos = lineGeo.attributes.position.array;
    const lCol = lineGeo.attributes.color.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (lineIdx >= MAX_LINES) break;
      const i3 = i * 3;
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        if (lineIdx >= MAX_LINES) break;
        const j3 = j * 3;
        const dx = pos[i3] - pos[j3];
        const dy = pos[i3 + 1] - pos[j3 + 1];
        const dz = pos[i3 + 2] - pos[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECTION_DISTANCE) {
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          const idx = lineIdx * 6;
          lPos[idx] = pos[i3];
          lPos[idx + 1] = pos[i3 + 1];
          lPos[idx + 2] = pos[i3 + 2];
          lPos[idx + 3] = pos[j3];
          lPos[idx + 4] = pos[j3 + 1];
          lPos[idx + 5] = pos[j3 + 2];

          const isOrange = (colors[i3] > 0.8 || colors[j3] > 0.8);
          const r = isOrange ? 1.0 * alpha : 0.35 * alpha;
          const g = isOrange ? 0.42 * alpha : 0.35 * alpha;
          const b = isOrange ? 0.17 * alpha : 0.4 * alpha;
          lCol[idx] = r; lCol[idx + 1] = g; lCol[idx + 2] = b;
          lCol[idx + 3] = r; lCol[idx + 4] = g; lCol[idx + 5] = b;

          lineIdx++;
        }
      }
    }

    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    particles.rotation.y = t * 0.03;
    particles.rotation.x = Math.sin(t * 0.02) * 0.05;
    lines.rotation.y = t * 0.03;
    lines.rotation.x = Math.sin(t * 0.02) * 0.05;

    renderer.render(scene, camera);
  }

  animate();
})();
