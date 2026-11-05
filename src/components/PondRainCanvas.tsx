import React, { useEffect, useRef } from 'react';

interface Raindrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  thickness: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface LeafBead {
  leafIndex: number;
  progress: number;
  speed: number;
  radius: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  lineWidth: number;
}

interface TaroLeaf {
  side: 'left' | 'right';
  baseX: number;
  baseY: number;
  stemLength: number;
  stemAngle: number;
  leafWidth: number;
  leafLength: number;
  tiltAngle: number;
  swayOffset: number;
  swaySpeed: number;
  bounceAngle: number;
  bounceVel: number;
  hueShift: number;
  tipX: number;
  tipY: number;
  centerX: number;
  centerY: number;
}

interface WaterLily {
  xRatio: number;
  yRatio: number;
  padRadius: number;
  flowerScale: number;
  petalColor: 'magenta' | 'white' | 'rose';
  bobPhase: number;
  notchAngle: number;
}

interface ColorfulFish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetAngle: number;
  angle: number;
  size: number;
  speed: number;
  tailPhase: number;
  tailFreq: number;
  primaryColor: string;
  secondaryColor: string;
  finColor: string;
  pattern: 'koi' | 'gold' | 'ruby' | 'silver' | 'turquoise';
  depthScale: number;
}

interface MonsoonCloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

export const PondRainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const getWaterlineY = (h: number) => Math.max(h * 0.48, 340);

    // 1. Daytime Monsoon Clouds
    const clouds: MonsoonCloud[] = [
      { x: width * 0.12, y: 65, scale: 1.15, speed: 0.22, opacity: 0.65 },
      { x: width * 0.42, y: 48, scale: 1.35, speed: 0.18, opacity: 0.55 },
      { x: width * 0.78, y: 72, scale: 1.2, speed: 0.25, opacity: 0.62 },
      { x: width * 0.95, y: 55, scale: 1.0, speed: 0.2, opacity: 0.5 },
    ];

    // 2. Lush Daylight Kochu Pata (Taro Leaves) on Both River/Pond Banks
    const createTaroLeaves = (w: number, h: number): TaroLeaf[] => {
      const pondY = getWaterlineY(h);
      const scale = Math.min(1.15, Math.max(0.65, w / 1360));
      return [
        // Left Bank Cluster
        {
          side: 'left',
          baseX: -15,
          baseY: pondY + 55,
          stemLength: 235 * scale,
          stemAngle: -1.12,
          leafWidth: 98 * scale,
          leafLength: 148 * scale,
          tiltAngle: 0.42,
          swayOffset: 0.2,
          swaySpeed: 1.8,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: -4,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
        {
          side: 'left',
          baseX: 12,
          baseY: pondY + 70,
          stemLength: 290 * scale,
          stemAngle: -0.92,
          leafWidth: 120 * scale,
          leafLength: 178 * scale,
          tiltAngle: 0.35,
          swayOffset: 1.5,
          swaySpeed: 1.5,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: 4,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
        {
          side: 'left',
          baseX: 28,
          baseY: pondY + 88,
          stemLength: 200 * scale,
          stemAngle: -0.68,
          leafWidth: 105 * scale,
          leafLength: 158 * scale,
          tiltAngle: 0.52,
          swayOffset: 2.9,
          swaySpeed: 1.75,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: 0,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
        {
          side: 'left',
          baseX: -5,
          baseY: pondY + 115,
          stemLength: 165 * scale,
          stemAngle: -0.45,
          leafWidth: 88 * scale,
          leafLength: 134 * scale,
          tiltAngle: 0.6,
          swayOffset: 4.1,
          swaySpeed: 2.0,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: 8,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },

        // Right Bank Cluster
        {
          side: 'right',
          baseX: w + 15,
          baseY: pondY + 55,
          stemLength: 235 * scale,
          stemAngle: -Math.PI + 1.12,
          leafWidth: 98 * scale,
          leafLength: 148 * scale,
          tiltAngle: Math.PI - 0.42,
          swayOffset: 0.8,
          swaySpeed: 1.7,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: -4,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
        {
          side: 'right',
          baseX: w - 12,
          baseY: pondY + 70,
          stemLength: 285 * scale,
          stemAngle: -Math.PI + 0.92,
          leafWidth: 118 * scale,
          leafLength: 175 * scale,
          tiltAngle: Math.PI - 0.36,
          swayOffset: 2.1,
          swaySpeed: 1.55,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: 5,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
        {
          side: 'right',
          baseX: w - 28,
          baseY: pondY + 88,
          stemLength: 198 * scale,
          stemAngle: -Math.PI + 0.68,
          leafWidth: 104 * scale,
          leafLength: 156 * scale,
          tiltAngle: Math.PI - 0.52,
          swayOffset: 3.4,
          swaySpeed: 1.8,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: 2,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
        {
          side: 'right',
          baseX: w + 5,
          baseY: pondY + 115,
          stemLength: 165 * scale,
          stemAngle: -Math.PI + 0.45,
          leafWidth: 88 * scale,
          leafLength: 134 * scale,
          tiltAngle: Math.PI - 0.6,
          swayOffset: 4.9,
          swaySpeed: 1.95,
          bounceAngle: 0,
          bounceVel: 0,
          hueShift: 8,
          tipX: 0,
          tipY: 0,
          centerX: 0,
          centerY: 0,
        },
      ];
    };

    let taroLeaves = createTaroLeaves(width, height);

    // 3. Shapla Phool (Water Lilies) near the banks & river edges
    const waterLilies: WaterLily[] = [
      { xRatio: 0.13, yRatio: 0.59, padRadius: 36, flowerScale: 0.95, petalColor: 'magenta', bobPhase: 0.3, notchAngle: 0.6 },
      { xRatio: 0.24, yRatio: 0.56, padRadius: 31, flowerScale: 0.85, petalColor: 'white', bobPhase: 1.4, notchAngle: 1.8 },
      { xRatio: 0.35, yRatio: 0.63, padRadius: 39, flowerScale: 1.05, petalColor: 'magenta', bobPhase: 2.5, notchAngle: -0.5 },
      { xRatio: 0.48, yRatio: 0.58, padRadius: 33, flowerScale: 0.9, petalColor: 'rose', bobPhase: 3.7, notchAngle: 2.4 },
      { xRatio: 0.58, yRatio: 0.64, padRadius: 37, flowerScale: 1.0, petalColor: 'white', bobPhase: 0.9, notchAngle: 0.9 },
      { xRatio: 0.69, yRatio: 0.58, padRadius: 35, flowerScale: 0.94, petalColor: 'magenta', bobPhase: 2.1, notchAngle: -1.2 },
      { xRatio: 0.79, yRatio: 0.63, padRadius: 39, flowerScale: 1.05, petalColor: 'rose', bobPhase: 4.2, notchAngle: 0.3 },
      { xRatio: 0.88, yRatio: 0.57, padRadius: 31, flowerScale: 0.85, petalColor: 'white', bobPhase: 5.1, notchAngle: 1.5 },
      { xRatio: 0.19, yRatio: 0.74, padRadius: 42, flowerScale: 1.12, petalColor: 'rose', bobPhase: 1.9, notchAngle: -0.8 },
      { xRatio: 0.82, yRatio: 0.75, padRadius: 41, flowerScale: 1.1, petalColor: 'magenta', bobPhase: 3.1, notchAngle: 2.1 },
    ];

    // 4. Vibrant Colorful Fish swimming in the bright daytime Bangladesh river/pond
    const fishPalette: Array<{
      primary: string;
      secondary: string;
      fin: string;
      pattern: ColorfulFish['pattern'];
    }> = [
      { primary: '#ff5722', secondary: '#ffffff', fin: '#ff9800', pattern: 'koi' },
      { primary: '#fbbf24', secondary: '#fef08a', fin: '#fffbeb', pattern: 'gold' },
      { primary: '#e11d48', secondary: '#ffe4e6', fin: '#fda4af', pattern: 'ruby' },
      { primary: '#f8fafc', secondary: '#bae6fd', fin: '#e0f2fe', pattern: 'silver' }, // Silvery Hilsa/Puthi vibe
      { primary: '#06b6d4', secondary: '#fde047', fin: '#a5f3fc', pattern: 'turquoise' },
      { primary: '#ea580c', secondary: '#ffedd5', fin: '#fdba74', pattern: 'koi' },
    ];

    const createFish = (w: number, h: number): ColorfulFish[] => {
      const pondY = getWaterlineY(h);
      const list: ColorfulFish[] = [];
      const count = 18;
      for (let i = 0; i < count; i++) {
        const pal = fishPalette[i % fishPalette.length];
        const depthScale = 0.72 + (i % 4) * 0.14;
        const angle =
          i % 2 === 0
            ? (Math.random() - 0.5) * 0.4
            : Math.PI + (Math.random() - 0.5) * 0.4;
        const speed = (0.9 + Math.random() * 0.95) * depthScale;
        list.push({
          x: w * (0.08 + Math.random() * 0.84),
          y: pondY + 45 + Math.random() * Math.max(120, h - pondY - 80),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          targetAngle: angle,
          angle,
          size: (19 + (i % 5) * 3.8) * depthScale,
          speed,
          tailPhase: Math.random() * Math.PI * 2,
          tailFreq: 0.16 + Math.random() * 0.05,
          primaryColor: pal.primary,
          secondaryColor: pal.secondary,
          finColor: pal.fin,
          pattern: pal.pattern,
          depthScale,
        });
      }
      return list;
    };

    let fishes = createFish(width, height);

    // 5. Heavy Torrential Rain ("mushol dhare brishti" — 280 fast slanted raindrops!)
    const raindrops: Raindrop[] = [];
    const maxRaindrops = 285;
    for (let i = 0; i < maxRaindrops; i++) {
      const isForeground = i % 3 === 0;
      raindrops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        vx: -2.4 - Math.random() * 1.2, // Slanted monsoon wind angle
        vy: isForeground ? 16 + Math.random() * 6 : 12 + Math.random() * 5,
        length: isForeground ? 26 + Math.random() * 16 : 16 + Math.random() * 12,
        alpha: isForeground ? 0.58 + Math.random() * 0.28 : 0.32 + Math.random() * 0.25,
        thickness: isForeground ? 1.7 : 1.15,
      });
    }

    const ripples: Ripple[] = [];
    const splashes: SplashParticle[] = [];
    const leafBeads: LeafBead[] = [];

    const addRipple = (x: number, y: number, maxRadius = 46, alpha = 0.62) => {
      if (ripples.length < 110) {
        ripples.push({
          x,
          y,
          radius: 2,
          maxRadius,
          alpha,
          lineWidth: maxRadius > 50 ? 1.9 : 1.25,
        });
      }
    };

    const addSplash = (
      x: number,
      y: number,
      count = 4,
      color = 'rgba(255, 255, 255, 0.9)'
    ) => {
      if (splashes.length > 160) return;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI * (0.15 + Math.random() * 0.7);
        const speed = 1.8 + Math.random() * 3.1;
        splashes.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.4 + Math.random() * 1.6,
          alpha: 0.9,
          color,
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      taroLeaves = createTaroLeaves(width, height);
    };

    const handlePointerMove = (e: MouseEvent) => {
      const pondY = getWaterlineY(height);
      if (e.clientY >= pondY - 10 && Math.random() < 0.35) {
        addRipple(e.clientX, Math.max(pondY + 8, e.clientY), 55, 0.55);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const pondY = getWaterlineY(height);
      if (e.clientY >= pondY - 20) {
        addRipple(e.clientX, Math.max(pondY + 8, e.clientY), 85, 0.8);
        addSplash(e.clientX, Math.max(pondY + 8, e.clientY), 8);
        fishes.forEach((f) => {
          const dx = e.clientX - f.x;
          const dy = e.clientY - f.y;
          if (Math.hypot(dx, dy) < 380) {
            f.targetAngle = Math.atan2(dy, dx);
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);

    // Draw Soft Daytime Monsoon Cloud
    const drawCloud = (c: MonsoonCloud) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.fillStyle = `rgba(241, 245, 249, ${c.opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.arc(34, -8, 44, 0, Math.PI * 2);
      ctx.arc(74, -2, 36, 0, Math.PI * 2);
      ctx.arc(104, 8, 28, 0, Math.PI * 2);
      ctx.arc(-32, 10, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Draw Distant Bangladesh River Country Boat (Nouka)
    const drawRiverBoat = (time: number, pondY: number) => {
      const bx = ((width * 0.72 + time * 12) % (width + 180)) - 90;
      const by = pondY + 12 + Math.sin(time * 2.1) * 2;
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(0.85, 0.85);

      // Boat reflection in water
      ctx.fillStyle = 'rgba(30, 41, 59, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 38, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Traditional curved wooden hull
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-45, -2);
      ctx.quadraticCurveTo(0, 10, 45, -4);
      ctx.lineTo(34, 4);
      ctx.quadraticCurveTo(0, 12, -34, 4);
      ctx.closePath();
      ctx.fill();

      // Bamboo canopy (Chhoi)
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(2, -1, 16, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    };

    // Draw Bright Daylight Kochu Pata (Taro Leaf)
    const drawTaroLeaf = (leaf: TaroLeaf, time: number) => {
      const springK = 0.09;
      const damping = 0.87;
      leaf.bounceVel += -springK * leaf.bounceAngle;
      leaf.bounceVel *= damping;
      leaf.bounceAngle += leaf.bounceVel;

      const naturalSway = Math.sin(time * leaf.swaySpeed + leaf.swayOffset) * 0.055;
      const currentStemAngle =
        leaf.stemAngle +
        naturalSway +
        (leaf.side === 'left' ? leaf.bounceAngle : -leaf.bounceAngle);

      const centerX = leaf.baseX + Math.cos(currentStemAngle) * leaf.stemLength;
      const centerY = leaf.baseY + Math.sin(currentStemAngle) * leaf.stemLength;
      leaf.centerX = centerX;
      leaf.centerY = centerY;

      const leafDirAngle =
        leaf.tiltAngle +
        naturalSway * 1.35 +
        (leaf.side === 'left' ? leaf.bounceAngle * 1.45 : -leaf.bounceAngle * 1.45);

      leaf.tipX = centerX + Math.cos(leafDirAngle) * (leaf.leafLength * 0.76);
      leaf.tipY = centerY + Math.sin(leafDirAngle) * (leaf.leafLength * 0.76);

      ctx.save();

      // Stem
      ctx.beginPath();
      ctx.moveTo(leaf.baseX, leaf.baseY);
      const ctrlX = (leaf.baseX + centerX) * 0.5;
      const ctrlY = (leaf.baseY + centerY) * 0.5 - 28;
      ctx.quadraticCurveTo(ctrlX, ctrlY, centerX, centerY);
      const stemGrad = ctx.createLinearGradient(leaf.baseX, leaf.baseY, centerX, centerY);
      stemGrad.addColorStop(0, '#14532d');
      stemGrad.addColorStop(1, '#22c55e');
      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = Math.max(5.5, leaf.leafWidth * 0.09);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Blade
      ctx.translate(centerX, centerY);
      ctx.rotate(leafDirAngle);

      const L = leaf.leafLength;
      const W = leaf.leafWidth;

      ctx.beginPath();
      ctx.moveTo(-L * 0.18, 0);
      ctx.bezierCurveTo(-L * 0.36, -W * 0.38, -L * 0.15, -W * 0.68, L * 0.15, -W * 0.52);
      ctx.bezierCurveTo(L * 0.45, -W * 0.36, L * 0.62, -W * 0.12, L * 0.76, 0);
      ctx.bezierCurveTo(L * 0.62, W * 0.12, L * 0.45, W * 0.36, L * 0.15, W * 0.52);
      ctx.bezierCurveTo(-L * 0.15, W * 0.68, -L * 0.36, W * 0.38, -L * 0.18, 0);
      ctx.closePath();

      // Fresh daylight green taro leaf gradient
      const leafGrad = ctx.createLinearGradient(-L * 0.3, -W * 0.5, L * 0.76, W * 0.4);
      leafGrad.addColorStop(0, `hsl(${136 + leaf.hueShift}, 68%, 28%)`);
      leafGrad.addColorStop(0.55, `hsl(${132 + leaf.hueShift}, 72%, 38%)`);
      leafGrad.addColorStop(1, `hsl(${126 + leaf.hueShift}, 76%, 46%)`);
      ctx.fillStyle = leafGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(220, 252, 231, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Veins
      ctx.strokeStyle = 'rgba(240, 253, 244, 0.5)';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(L * 0.72, 0);
      ctx.stroke();

      const veins = [
        { x: L * 0.12, y: -W * 0.44 },
        { x: L * 0.34, y: -W * 0.34 },
        { x: L * 0.52, y: -W * 0.18 },
        { x: L * 0.12, y: W * 0.44 },
        { x: L * 0.34, y: W * 0.34 },
        { x: L * 0.52, y: W * 0.18 },
        { x: -L * 0.22, y: -W * 0.34 },
        { x: -L * 0.22, y: W * 0.34 },
      ];
      ctx.lineWidth = 1.1;
      veins.forEach((v) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(v.x * 0.5, v.y * 0.3, v.x, v.y);
        ctx.stroke();
      });

      ctx.fillStyle = 'rgba(240, 253, 244, 0.75)';
      ctx.beginPath();
      ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Shapla Phool (Water Lily)
    const drawWaterLily = (lily: WaterLily, time: number) => {
      const pondY = getWaterlineY(height);
      const pondHeight = height - pondY;
      const cx = lily.xRatio * width;
      const cy = pondY + (lily.yRatio - 0.5) * pondHeight * 1.65;
      const bobY = Math.sin(time * 2.1 + lily.bobPhase) * 2.8;
      const y = Math.max(pondY + 22, cy + bobY);

      ctx.save();
      ctx.translate(cx, y);

      // Floating Green Lily Pad
      const rx = lily.padRadius;
      ctx.save();
      ctx.scale(1, 0.44);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, rx, lily.notchAngle + 0.28, lily.notchAngle + Math.PI * 2 - 0.28);
      ctx.closePath();

      const padGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, rx);
      padGrad.addColorStop(0, '#22c55e');
      padGrad.addColorStop(0.75, '#16a34a');
      padGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = padGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(220, 252, 231, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Shapla Petals
      const s = lily.flowerScale;
      const petalColors =
        lily.petalColor === 'magenta'
          ? { outer: '#db2777', mid: '#f472b6', inner: '#fce7f3' }
          : lily.petalColor === 'rose'
          ? { outer: '#e11d48', mid: '#fb7185', inner: '#ffe4e6' }
          : { outer: '#e2e8f0', mid: '#ffffff', inner: '#ffffff' };

      const angles = [-1.25, -0.85, -0.45, 0, 0.45, 0.85, 1.25];
      angles.forEach((ang, idx) => {
        ctx.save();
        ctx.translate(0, -2 * s);
        ctx.rotate(ang * 0.68);
        const pH = (16 + (idx === 3 ? 4 : 0) - Math.abs(idx - 3) * 1.4) * s;
        const pW = 5.3 * s;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-pW, -pH * 0.45, 0, -pH);
        ctx.quadraticCurveTo(pW, -pH * 0.45, 0, 0);
        ctx.closePath();

        const pGrad = ctx.createLinearGradient(0, 0, 0, -pH);
        pGrad.addColorStop(0, petalColors.outer);
        pGrad.addColorStop(0.55, petalColors.mid);
        pGrad.addColorStop(1, petalColors.inner);
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, -4.5 * s, 4.5 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Colorful Fish
    const drawFish = (fish: ColorfulFish) => {
      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.rotate(fish.angle);

      const wag = Math.sin(fish.tailPhase) * 0.4;
      const s = fish.size;

      // Soft daytime shadow in clear water
      ctx.save();
      ctx.translate(2, 6);
      ctx.fillStyle = 'rgba(3, 55, 82, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.85, s * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pectoral Fins
      ctx.fillStyle = fish.finColor;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(s * 0.1, -s * 0.32, s * 0.32, s * 0.15, -0.55 + wag * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.1, s * 0.32, s * 0.32, s * 0.15, 0.55 - wag * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Forked Tail Fin
      ctx.save();
      ctx.translate(-s * 0.78, 0);
      ctx.rotate(wag);
      ctx.fillStyle = fish.finColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-s * 0.45, -s * 0.42, -s * 0.74, -s * 0.38);
      ctx.quadraticCurveTo(-s * 0.38, 0, -s * 0.74, s * 0.38);
      ctx.quadraticCurveTo(-s * 0.45, s * 0.42, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Body
      ctx.globalAlpha = 0.96;
      const bodyGrad = ctx.createLinearGradient(s * 0.9, 0, -s * 0.85, 0);
      bodyGrad.addColorStop(0, fish.primaryColor);
      bodyGrad.addColorStop(0.55, fish.secondaryColor);
      bodyGrad.addColorStop(1, fish.primaryColor);

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(s * 0.92, 0);
      ctx.bezierCurveTo(s * 0.55, -s * 0.44, -s * 0.35, -s * 0.36, -s * 0.82, 0);
      ctx.bezierCurveTo(-s * 0.35, s * 0.36, s * 0.55, s * 0.44, s * 0.92, 0);
      ctx.closePath();
      ctx.fill();

      if (fish.pattern === 'koi' || fish.pattern === 'ruby') {
        ctx.fillStyle = fish.primaryColor;
        ctx.beginPath();
        ctx.ellipse(s * 0.15, -s * 0.06, s * 0.25, s * 0.16, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dorsal ridge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s * 0.25, 0);
      ctx.quadraticCurveTo(-s * 0.1, wag * s * 0.18, -s * 0.48, 0);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(s * 0.58, -s * 0.15, Math.max(1.6, s * 0.08), 0, Math.PI * 2);
      ctx.arc(s * 0.58, s * 0.15, Math.max(1.6, s * 0.08), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) * 0.001;
      const pondY = getWaterlineY(height);

      // 1. Bright Daytime Sky ("diner bela") with refreshing monsoon sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, pondY);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.45, '#38bdf8');
      skyGrad.addColorStop(0.82, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, pondY + 2);

      // Soft Daytime Sun Glow breaking through monsoon clouds
      const sunGrad = ctx.createRadialGradient(
        width * 0.22,
        75,
        10,
        width * 0.22,
        75,
        240
      );
      sunGrad.addColorStop(0, 'rgba(254, 249, 195, 0.65)');
      sunGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.22)');
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, pondY);

      // Drifting Daytime Monsoon Clouds
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > width + 160) c.x = -160;
        drawCloud(c);
      });

      // Distant Lush Green Bangladesh Riverbank & Village Treeline along Horizon
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, pondY);
      for (let x = 0; x <= width; x += 45) {
        const treeLine =
          Math.sin(x * 0.012) * 14 + Math.cos(x * 0.035) * 9 + Math.sin(x * 0.08) * 4;
        ctx.lineTo(x, pondY - 18 - Math.abs(treeLine));
      }
      ctx.lineTo(width, pondY);
      ctx.closePath();
      ctx.fill();

      // Lighter green grassy riverbank edge
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, pondY - 5, width, 6);

      // 2. Bright Daytime Bangladesh River / Pond Water Below
      const waterGrad = ctx.createLinearGradient(0, pondY, 0, height);
      waterGrad.addColorStop(0, '#0ea5e9');
      waterGrad.addColorStop(0.25, '#0284c7');
      waterGrad.addColorStop(0.65, '#0369a1');
      waterGrad.addColorStop(1, '#0f766e');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, pondY, width, height - pondY);

      // Daytime Flowing River Waves & Shimmering Sunlight Reflections
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.28)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        const wy = pondY + 14 + i * ((height - pondY) / 10);
        ctx.beginPath();
        for (let x = 0; x <= width; x += 36) {
          const offset = Math.sin(x * 0.018 - time * 2.4 + i) * 3.8;
          if (x === 0) ctx.moveTo(x, wy + offset);
          else ctx.lineTo(x, wy + offset);
        }
        ctx.stroke();
      }

      // Distant Country Boat (Nouka) on the river horizon
      drawRiverBoat(time, pondY);

      // 3. Update & Draw Colorful Fish Swimming in the Daytime Water
      const minFishY = pondY + 34;
      const maxFishY = height - 32;
      fishes.forEach((fish) => {
        fish.tailPhase += fish.tailFreq * (1 + Math.hypot(fish.vx, fish.vy) * 0.35);

        let angleDiff = fish.targetAngle - fish.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        fish.angle += angleDiff * 0.045;

        fish.vx = Math.cos(fish.angle) * fish.speed;
        fish.vy = Math.sin(fish.angle) * fish.speed;

        fish.x += fish.vx;
        fish.y += fish.vy;

        const marginX = 65;
        if (fish.x < marginX) {
          fish.targetAngle = (Math.random() - 0.5) * 0.5;
        } else if (fish.x > width - marginX) {
          fish.targetAngle = Math.PI + (Math.random() - 0.5) * 0.5;
        }

        if (fish.y < minFishY) {
          fish.y = minFishY;
          fish.targetAngle = Math.abs(fish.targetAngle) * 0.5 + 0.25;
        } else if (fish.y > maxFishY) {
          fish.y = maxFishY;
          fish.targetAngle = -Math.abs(fish.targetAngle) * 0.5 - 0.25;
        }

        if (Math.random() < 0.009) {
          fish.targetAngle += (Math.random() - 0.5) * 0.65;
        }

        drawFish(fish);
      });

      // 4. Expanding Rain Ripples across the River/Pond
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.05;
        r.alpha *= 0.974;

        if (r.alpha <= 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(240, 249, 255, ${r.alpha})`;
        ctx.lineWidth = r.lineWidth;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.36, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Draw Shapla Flowers on the River/Pond
      waterLilies.forEach((lily) => drawWaterLily(lily, time));

      // 6. Draw Kochu Pata (Taro Leaves) on Both Left & Right Banks
      taroLeaves.forEach((leaf) => drawTaroLeaf(leaf, time));

      // 7. Torrential Heavy Rain ("mushol dhare rain") hitting Kochu Pata & River Water
      ctx.lineCap = 'round';
      raindrops.forEach((drop) => {
        drop.x += drop.vx;
        drop.y += drop.vy;

        // Check collision with Kochu Pata leaves
        let hitLeafIndex = -1;
        for (let i = 0; i < taroLeaves.length; i++) {
          const leaf = taroLeaves[i];
          const midX = (leaf.centerX + leaf.tipX) * 0.5;
          const midY = (leaf.centerY + leaf.tipY) * 0.5;
          const rx = leaf.leafLength * 0.48;
          const ry = leaf.leafWidth * 0.42;
          const dx = drop.x - midX;
          const dy = drop.y - midY;
          if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 0.85) {
            hitLeafIndex = i;
            break;
          }
        }

        if (hitLeafIndex !== -1) {
          const leaf = taroLeaves[hitLeafIndex];
          leaf.bounceVel += 0.0055;
          addSplash(drop.x, drop.y, 3, 'rgba(240, 253, 244, 0.95)');

          if (leafBeads.length < 40 && Math.random() < 0.5) {
            leafBeads.push({
              leafIndex: hitLeafIndex,
              progress: Math.random() * 0.35,
              speed: 0.015 + Math.random() * 0.012,
              radius: 3.0 + Math.random() * 2.2,
            });
          }

          drop.y = -20 - Math.random() * 60;
          drop.x = Math.random() * (width + 200) - 50;
          return;
        }

        // Check if raindrop hits the river/pond water surface
        const waterImpactY = pondY + Math.pow(Math.random(), 1.4) * (height - pondY - 12);
        if (drop.y >= waterImpactY && drop.y >= pondY) {
          addRipple(drop.x, drop.y, 24 + Math.random() * 28, 0.52);
          if (Math.random() < 0.35) {
            addSplash(drop.x, drop.y, 2, 'rgba(240, 249, 255, 0.9)');
          }
          drop.y = -20 - Math.random() * 70;
          drop.x = Math.random() * (width + 200) - 50;
          return;
        }

        // Draw heavy slanted raindrop streak
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${drop.alpha})`;
        ctx.lineWidth = drop.thickness;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.vx * 1.6, drop.y - drop.length);
        ctx.stroke();
      });

      // 8. Pearly Water Beads rolling down Kochu Pata & dripping into the water
      for (let i = leafBeads.length - 1; i >= 0; i--) {
        const bead = leafBeads[i];
        const leaf = taroLeaves[bead.leafIndex];
        if (!leaf) {
          leafBeads.splice(i, 1);
          continue;
        }

        bead.progress += bead.speed;
        const bx = leaf.centerX + (leaf.tipX - leaf.centerX) * bead.progress;
        const by = leaf.centerY + (leaf.tipY - leaf.centerY) * bead.progress;

        ctx.save();
        const beadGrad = ctx.createRadialGradient(bx - 1, by - 1, 0.5, bx, by, bead.radius);
        beadGrad.addColorStop(0, '#ffffff');
        beadGrad.addColorStop(0.65, '#e0f2fe');
        beadGrad.addColorStop(1, 'rgba(56, 189, 248, 0.6)');
        ctx.fillStyle = beadGrad;
        ctx.beginPath();
        ctx.arc(bx, by, bead.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (bead.progress >= 1) {
          const splashY = Math.max(pondY + 12, Math.min(height - 20, leaf.tipY + 70));
          addRipple(leaf.tipX, splashY, 58, 0.78);
          addSplash(leaf.tipX, splashY, 5, 'rgba(255, 255, 255, 0.95)');
          leafBeads.splice(i, 1);
        }
      }

      // 9. Splash Droplets
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.2;
        sp.alpha -= 0.038;

        if (sp.alpha <= 0) {
          splashes.splice(i, 1);
          continue;
        }

        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-0"
      aria-label="Daytime Bangladesh river and pond with heavy monsoon rain on taro leaves, water lilies, and colorful swimming fish"
    />
  );
};
