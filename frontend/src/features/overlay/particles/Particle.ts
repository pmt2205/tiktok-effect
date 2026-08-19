// Particle class for canvas-based visual effects

export type ParticleType = 'rose-petal' | 'sparkle' | 'star' | 'cosmic-dust';

export class Particle {
  x: number;
  y: number;
  type: ParticleType;
  alpha: number;
  scale: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  rotation: number;
  vRot: number;
  color: string;

  constructor(x: number, y: number, type: ParticleType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alpha = 1;
    this.scale = Math.random() * 0.6 + 0.4;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0;
    this.drag = 0.98;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.05;
    this.color = '#ff0050';

    this.initializePhysics();
  }

  private initializePhysics() {
    if (this.type === 'rose-petal') {
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = Math.random() * 2 + 1.5;
      this.gravity = 0.04;
      this.scale = Math.random() * 0.7 + 0.5;
      this.color = `hsl(${Math.random() * 20 + 340}, 100%, ${Math.random() * 20 + 40}%)`;
    } else if (this.type === 'sparkle') {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.08;
      this.scale = Math.random() * 0.4 + 0.2;
      this.color = '#ffea00';
    } else if (this.type === 'star') {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.drag = 0.95;
      this.gravity = 0;
      this.scale = Math.random() * 0.8 + 0.4;
      this.color = `hsl(${Math.random() * 40 + 180}, 100%, 75%)`;
    } else if (this.type === 'cosmic-dust') {
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.drag = 0.97;
      this.scale = Math.random() * 2.5 + 1.5;
      this.color = Math.random() > 0.5 ? '#9d4edd' : '#00f2fe';
    }
  }

  update() {
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.vRot;

    if (this.type === 'sparkle') this.alpha -= 0.02;
    else if (this.type === 'star') this.alpha -= 0.015;
    else if (this.type === 'cosmic-dust') this.alpha -= 0.01;
    else this.alpha -= 0.008;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'rose-petal') {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.moveTo(0, -10 * this.scale);
      ctx.bezierCurveTo(12 * this.scale, -15 * this.scale, 15 * this.scale, 5 * this.scale, 0, 15 * this.scale);
      ctx.bezierCurveTo(-15 * this.scale, 5 * this.scale, -12 * this.scale, -15 * this.scale, 0, -10 * this.scale);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.arc(-2 * this.scale, 0, 8 * this.scale, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    } else if (this.type === 'sparkle') {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;

      const size = 12 * this.scale;
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.fill();
    } else if (this.type === 'star') {
      ctx.beginPath();
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.fillStyle = '#ffffff';
      ctx.arc(0, 0, 8 * this.scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'cosmic-dust') {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * this.scale);
      grad.addColorStop(0, this.color);
      grad.addColorStop(0.3, this.color + '44');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 30 * this.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
