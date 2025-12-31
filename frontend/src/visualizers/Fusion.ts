/**
 * Fusion - 三角関数×二次関数の融合ビジュアライザー
 *
 * 例: f(θ) = sin²θ + a·sinθ + b の最大・最小を求める
 * 1. t = sinθ と置換（-1 ≤ t ≤ 1）
 * 2. g(t) = t² + at + b を考える
 * 3. 定義域制限付きの二次関数の最大・最小問題に帰着
 *
 * ダブルビュー:
 * - 左: 単位円と θ の動き → t = sinθ の値
 * - 右: g(t) = t² + at + b のグラフ（定義域 -1 ≤ t ≤ 1 をハイライト）
 */

import { GraphCanvas } from '../components/Canvas';

export class Fusion {
  private circleCanvas: GraphCanvas;
  private quadCanvas: GraphCanvas;

  // パラメータ: g(t) = t² + at + b
  private a: number = -2;
  private b: number = 0;

  // 現在の角度
  private theta: number = 0;
  private isAnimating: boolean = false;
  private animationId: number | null = null;

  // DOM要素
  private thetaSlider: HTMLInputElement | null = null;
  private thetaValueEl: HTMLElement | null = null;
  private aSlider: HTMLInputElement | null = null;
  private bSlider: HTMLInputElement | null = null;
  private aValueEl: HTMLElement | null = null;
  private bValueEl: HTMLElement | null = null;
  private tValueEl: HTMLElement | null = null;
  private gtValueEl: HTMLElement | null = null;
  private minValueEl: HTMLElement | null = null;
  private maxValueEl: HTMLElement | null = null;
  private animateBtn: HTMLButtonElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;

  constructor(circleCanvasEl: HTMLCanvasElement, quadCanvasEl: HTMLCanvasElement) {
    this.circleCanvas = new GraphCanvas(circleCanvasEl, {
      xMin: -1.8,
      xMax: 1.8,
      yMin: -1.8,
      yMax: 1.8,
      gridStep: 0.5,
    });

    this.quadCanvas = new GraphCanvas(quadCanvasEl, {
      xMin: -2,
      xMax: 2,
      yMin: -2,
      yMax: 4,
      gridStep: 1,
    });

    this.bindElements();
    this.setupEventListeners();
    this.updateUI();
    this.draw();
  }

  private bindElements(): void {
    this.thetaSlider = document.getElementById('fusion-theta') as HTMLInputElement;
    this.thetaValueEl = document.getElementById('fusion-theta-value');
    this.aSlider = document.getElementById('fusion-a') as HTMLInputElement;
    this.bSlider = document.getElementById('fusion-b') as HTMLInputElement;
    this.aValueEl = document.getElementById('fusion-a-value');
    this.bValueEl = document.getElementById('fusion-b-value');
    this.tValueEl = document.getElementById('fusion-t-value');
    this.gtValueEl = document.getElementById('fusion-gt-value');
    this.minValueEl = document.getElementById('fusion-min');
    this.maxValueEl = document.getElementById('fusion-max');
    this.animateBtn = document.getElementById('fusion-animate') as HTMLButtonElement;
    this.resetBtn = document.getElementById('fusion-reset') as HTMLButtonElement;
  }

  private setupEventListeners(): void {
    this.thetaSlider?.addEventListener('input', (e) => {
      this.theta = parseFloat((e.target as HTMLInputElement).value) * (Math.PI / 180);
      this.updateUI();
      this.draw();
    });

    this.aSlider?.addEventListener('input', (e) => {
      this.a = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.bSlider?.addEventListener('input', (e) => {
      this.b = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.animateBtn?.addEventListener('click', () => {
      if (this.isAnimating) {
        this.stopAnimation();
      } else {
        this.startAnimation();
      }
    });

    this.resetBtn?.addEventListener('click', () => this.reset());
  }

  // g(t) = t² + at + b
  private g(t: number): number {
    return t * t + this.a * t + this.b;
  }

  // 頂点のt座標
  private getVertexT(): number {
    return -this.a / 2;
  }

  // 定義域 -1 ≤ t ≤ 1 での最大・最小を計算
  private getMinMax(): { min: number; max: number; minT: number; maxT: number } {
    const vertexT = this.getVertexT();
    const vertexY = this.g(vertexT);

    const y_minus1 = this.g(-1);
    const y_plus1 = this.g(1);

    let min: number, max: number, minT: number, maxT: number;

    // 頂点が定義域内かどうか
    if (vertexT >= -1 && vertexT <= 1) {
      // 上に凸（a > 0 は下に凸なので a = 1 のとき頂点が最小）
      // g(t) = t² + at + b は常に下に凸（t²の係数が正）
      min = vertexY;
      minT = vertexT;
      max = Math.max(y_minus1, y_plus1);
      maxT = y_minus1 > y_plus1 ? -1 : 1;
    } else if (vertexT < -1) {
      // 頂点が左側にある → 端点で判定
      min = y_minus1;
      minT = -1;
      max = y_plus1;
      maxT = 1;
    } else {
      // 頂点が右側にある
      min = y_plus1;
      minT = 1;
      max = y_minus1;
      maxT = -1;
    }

    return { min, max, minT, maxT };
  }

  private startAnimation(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    if (this.animateBtn) this.animateBtn.textContent = '停止';

    const animate = () => {
      if (!this.isAnimating) return;

      this.theta += 0.03;
      if (this.theta > 2 * Math.PI) {
        this.theta = 0;
      }

      if (this.thetaSlider) {
        this.thetaSlider.value = ((this.theta * 180) / Math.PI).toString();
      }

      this.updateUI();
      this.draw();
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    this.isAnimating = false;
    if (this.animateBtn) this.animateBtn.textContent = '自動回転';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private reset(): void {
    this.stopAnimation();
    this.theta = 0;
    this.a = -2;
    this.b = 0;
    if (this.thetaSlider) this.thetaSlider.value = '0';
    if (this.aSlider) this.aSlider.value = '-2';
    if (this.bSlider) this.bSlider.value = '0';
    this.updateUI();
    this.draw();
  }

  private updateUI(): void {
    const degrees = (this.theta * 180) / Math.PI;
    const t = Math.sin(this.theta);
    const gt = this.g(t);
    const { min, max } = this.getMinMax();

    if (this.thetaValueEl) this.thetaValueEl.textContent = Math.round(degrees).toString();
    if (this.aValueEl) this.aValueEl.textContent = this.a.toFixed(1);
    if (this.bValueEl) this.bValueEl.textContent = this.b.toFixed(1);
    if (this.tValueEl) this.tValueEl.textContent = t.toFixed(3);
    if (this.gtValueEl) this.gtValueEl.textContent = gt.toFixed(3);
    if (this.minValueEl) this.minValueEl.textContent = min.toFixed(2);
    if (this.maxValueEl) this.maxValueEl.textContent = max.toFixed(2);
  }

  private draw(): void {
    this.drawCircle();
    this.drawQuadratic();
  }

  private drawCircle(): void {
    this.circleCanvas.drawBackground();

    const cos = Math.cos(this.theta);
    const sin = Math.sin(this.theta);

    // 単位円
    this.circleCanvas.drawCircle(0, 0, 1, '#4a4a5e', 2);

    // 半径
    this.circleCanvas.drawLine(0, 0, cos, sin, '#e0e0e0', 2);

    // sinθ (y座標) を強調
    this.circleCanvas.drawLine(0, 0, 0, sin, '#ff6b9d', 3);
    this.circleCanvas.drawLine(0, sin, cos, sin, '#ff6b9d60', 1);

    // 点P
    this.circleCanvas.drawGlowPoint(cos, sin, '#ffffff', 8);

    // t = sinθ のラベル
    this.circleCanvas.drawText(
      `t = ${sin.toFixed(2)}`,
      0.15,
      sin / 2,
      '#ff6b9d',
      12,
      'left'
    );

    // y = 1 と y = -1 の線（定義域の境界）
    this.drawDashedLine(this.circleCanvas, -1.5, 1, 1.5, 1, '#4ade8040');
    this.drawDashedLine(this.circleCanvas, -1.5, -1, 1.5, -1, '#4ade8040');
  }

  private drawQuadratic(): void {
    this.quadCanvas.drawBackground();

    const t = Math.sin(this.theta);
    const gt = this.g(t);
    const { min, max, minT, maxT } = this.getMinMax();
    const vertexT = this.getVertexT();

    // 定義域外を薄く表示
    this.quadCanvas.drawFunction((x) => this.g(x), '#4a9eff30', 2);

    // 定義域内を強調
    this.drawFunctionInRange(-1, 1, '#4a9eff', 3);

    // 定義域の境界線
    this.drawDashedLine(this.quadCanvas, -1, -5, -1, 10, '#4ade8060');
    this.drawDashedLine(this.quadCanvas, 1, -5, 1, 10, '#4ade8060');

    // 定義域ラベル
    const ctx = this.quadCanvas.getContext();
    ctx.fillStyle = '#4ade80';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('-1', this.quadCanvas.toCanvasX(-1), this.quadCanvas.toCanvasY(0) + 15);
    ctx.fillText('1', this.quadCanvas.toCanvasX(1), this.quadCanvas.toCanvasY(0) + 15);

    // 頂点（定義域内なら強調）
    if (vertexT >= -1 && vertexT <= 1) {
      const vertexY = this.g(vertexT);
      this.quadCanvas.drawPoint(vertexT, vertexY, '#fbbf24', 6);
    }

    // 最小・最大点
    this.quadCanvas.drawPoint(minT, min, '#4ade80', 8);
    this.quadCanvas.drawPoint(maxT, max, '#ff6b9d', 8);

    // 現在の点
    if (t >= -1 && t <= 1) {
      this.quadCanvas.drawGlowPoint(t, gt, '#ffffff', 8);
      // 垂直線
      this.drawDashedLine(this.quadCanvas, t, 0, t, gt, '#ffffff60');
    }

    // t軸上に現在位置
    this.quadCanvas.drawPoint(t, 0, '#ff6b9d', 5);
  }

  private drawFunctionInRange(xMin: number, xMax: number, color: string, width: number): void {
    const ctx = this.quadCanvas.getContext();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    let started = false;
    for (let x = xMin; x <= xMax; x += 0.02) {
      const y = this.g(x);
      const cx = this.quadCanvas.toCanvasX(x);
      const cy = this.quadCanvas.toCanvasY(y);

      if (!started) {
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();
  }

  private drawDashedLine(canvas: GraphCanvas, x1: number, y1: number, x2: number, y2: number, color: string): void {
    const ctx = canvas.getContext();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.toCanvasX(x1), canvas.toCanvasY(y1));
    ctx.lineTo(canvas.toCanvasX(x2), canvas.toCanvasY(y2));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  destroy(): void {
    this.stopAnimation();
  }
}
