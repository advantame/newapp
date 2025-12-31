/**
 * WaveParam - 三角関数の波形パラメータビジュアライザー
 * y = A sin(Bx + C) + D の各パラメータの役割を視覚化
 * A: 振幅、B: 角周波数、C: 位相、D: 上下シフト
 */

import { GraphCanvas } from '../components/Canvas';

export class WaveParam {
  private graphCanvas: GraphCanvas;

  // パラメータ
  private A: number = 1;  // 振幅
  private B: number = 1;  // 角周波数
  private C: number = 0;  // 位相
  private D: number = 0;  // 上下シフト

  // DOM要素
  private aSlider: HTMLInputElement | null = null;
  private bSlider: HTMLInputElement | null = null;
  private cSlider: HTMLInputElement | null = null;
  private dSlider: HTMLInputElement | null = null;
  private aValueEl: HTMLElement | null = null;
  private bValueEl: HTMLElement | null = null;
  private cValueEl: HTMLElement | null = null;
  private dValueEl: HTMLElement | null = null;
  private periodEl: HTMLElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;
  private showBaseEl: HTMLInputElement | null = null;

  private showBase: boolean = true;

  constructor(canvasElement: HTMLCanvasElement) {
    this.graphCanvas = new GraphCanvas(canvasElement, {
      xMin: -2 * Math.PI,
      xMax: 4 * Math.PI,
      yMin: -4,
      yMax: 4,
      gridStep: 1,
    });
    this.bindElements();
    this.setupEventListeners();
    this.updateUI();
    this.draw();
  }

  private bindElements(): void {
    this.aSlider = document.getElementById('wave-a') as HTMLInputElement;
    this.bSlider = document.getElementById('wave-b') as HTMLInputElement;
    this.cSlider = document.getElementById('wave-c') as HTMLInputElement;
    this.dSlider = document.getElementById('wave-d') as HTMLInputElement;
    this.aValueEl = document.getElementById('wave-a-value');
    this.bValueEl = document.getElementById('wave-b-value');
    this.cValueEl = document.getElementById('wave-c-value');
    this.dValueEl = document.getElementById('wave-d-value');
    this.periodEl = document.getElementById('wave-period');
    this.resetBtn = document.getElementById('wave-reset') as HTMLButtonElement;
    this.showBaseEl = document.getElementById('wave-show-base') as HTMLInputElement;
  }

  private setupEventListeners(): void {
    this.aSlider?.addEventListener('input', (e) => {
      this.A = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.bSlider?.addEventListener('input', (e) => {
      this.B = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.cSlider?.addEventListener('input', (e) => {
      this.C = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.dSlider?.addEventListener('input', (e) => {
      this.D = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.resetBtn?.addEventListener('click', () => this.reset());

    this.showBaseEl?.addEventListener('change', (e) => {
      this.showBase = (e.target as HTMLInputElement).checked;
      this.draw();
    });
  }

  private reset(): void {
    this.A = 1;
    this.B = 1;
    this.C = 0;
    this.D = 0;
    if (this.aSlider) this.aSlider.value = '1';
    if (this.bSlider) this.bSlider.value = '1';
    if (this.cSlider) this.cSlider.value = '0';
    if (this.dSlider) this.dSlider.value = '0';
    this.updateUI();
    this.draw();
  }

  private updateUI(): void {
    // スライダー値
    if (this.aValueEl) this.aValueEl.textContent = this.A.toFixed(1);
    if (this.bValueEl) this.bValueEl.textContent = this.B.toFixed(1);
    if (this.cValueEl) {
      // Cをπ単位で表示
      const cPi = this.C / Math.PI;
      if (Math.abs(cPi) < 0.01) {
        this.cValueEl.textContent = '0';
      } else if (Math.abs(cPi - 1) < 0.01) {
        this.cValueEl.textContent = 'π';
      } else if (Math.abs(cPi + 1) < 0.01) {
        this.cValueEl.textContent = '-π';
      } else if (Math.abs(cPi - 0.5) < 0.01) {
        this.cValueEl.textContent = 'π/2';
      } else if (Math.abs(cPi + 0.5) < 0.01) {
        this.cValueEl.textContent = '-π/2';
      } else {
        this.cValueEl.textContent = `${cPi.toFixed(1)}π`;
      }
    }
    if (this.dValueEl) this.dValueEl.textContent = this.D.toFixed(1);

    // 周期
    if (this.periodEl) {
      if (this.B === 0) {
        this.periodEl.textContent = '∞';
      } else {
        const period = (2 * Math.PI) / Math.abs(this.B);
        const periodPi = period / Math.PI;
        if (Math.abs(periodPi - 2) < 0.01) {
          this.periodEl.textContent = '2π';
        } else if (Math.abs(periodPi - 1) < 0.01) {
          this.periodEl.textContent = 'π';
        } else {
          this.periodEl.textContent = `${periodPi.toFixed(1)}π`;
        }
      }
    }
  }

  private f(x: number): number {
    return this.A * Math.sin(this.B * x + this.C) + this.D;
  }

  private draw(): void {
    this.graphCanvas.drawBackground();
    this.drawPiLabels();

    // 基準の sin(x) を薄く表示
    if (this.showBase) {
      this.graphCanvas.drawFunction((x) => Math.sin(x), '#4a9eff30', 2);
    }

    // y = D の中心線
    if (this.D !== 0) {
      this.drawDashedLine(-10, this.D, 20, this.D, '#fbbf2440');
    }

    // 振幅の範囲を示す線
    if (Math.abs(this.A) !== 1 || this.D !== 0) {
      this.drawDashedLine(-10, this.D + this.A, 20, this.D + this.A, '#ff6b9d30');
      this.drawDashedLine(-10, this.D - this.A, 20, this.D - this.A, '#ff6b9d30');
    }

    // メインの波形
    this.graphCanvas.drawFunction((x) => this.f(x), '#ff6b9d', 3);

    // 位相シフトを視覚化（開始点）
    if (this.C !== 0) {
      const startX = -this.C / this.B;
      this.graphCanvas.drawPoint(startX, this.D, '#4ade80', 6);
    }

    // 周期を示す
    if (this.B !== 0) {
      const period = (2 * Math.PI) / Math.abs(this.B);
      // 1周期分の長さを示す
      const y = this.D - Math.abs(this.A) - 0.5;
      this.drawBracket(0, y, period, y, '#4ade80');
    }
  }

  private drawPiLabels(): void {
    const ctx = this.graphCanvas.getContext();
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const piPositions = [
      { x: -Math.PI, label: '-π' },
      { x: Math.PI, label: 'π' },
      { x: 2 * Math.PI, label: '2π' },
      { x: 3 * Math.PI, label: '3π' },
    ];

    const y0 = this.graphCanvas.toCanvasY(0);
    for (const pos of piPositions) {
      const cx = this.graphCanvas.toCanvasX(pos.x);
      ctx.fillText(pos.label, cx, y0 + 5);
    }
  }

  private drawDashedLine(x1: number, y1: number, x2: number, y2: number, color: string): void {
    const ctx = this.graphCanvas.getContext();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.graphCanvas.toCanvasX(x1), this.graphCanvas.toCanvasY(y1));
    ctx.lineTo(this.graphCanvas.toCanvasX(x2), this.graphCanvas.toCanvasY(y2));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawBracket(x1: number, y1: number, x2: number, y2: number, color: string): void {
    const ctx = this.graphCanvas.getContext();
    const cx1 = this.graphCanvas.toCanvasX(x1);
    const cy1 = this.graphCanvas.toCanvasY(y1);
    const cx2 = this.graphCanvas.toCanvasX(x2);
    const cy2 = this.graphCanvas.toCanvasY(y2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    // 左端
    ctx.moveTo(cx1, cy1 - 5);
    ctx.lineTo(cx1, cy1 + 5);
    // 横線
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    // 右端
    ctx.moveTo(cx2, cy2 - 5);
    ctx.lineTo(cx2, cy2 + 5);
    ctx.stroke();

    // ラベル
    ctx.fillStyle = color;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('1周期', (cx1 + cx2) / 2, cy1 + 8);
  }

  destroy(): void {
    // 特になし
  }
}
