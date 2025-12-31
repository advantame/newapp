/**
 * Discriminant - 判別式ビジュアライザー
 * D = b² - 4ac と放物線・x軸の関係を視覚化
 * D > 0: 2つの解、D = 0: 重解、D < 0: 解なし
 */

import { GraphCanvas } from '../components/Canvas';

export class Discriminant {
  private graphCanvas: GraphCanvas;

  // y = ax² + bx + c のパラメータ
  private a: number = 1;
  private b: number = 0;
  private c: number = -4;

  // DOM要素
  private aSlider: HTMLInputElement | null = null;
  private bSlider: HTMLInputElement | null = null;
  private cSlider: HTMLInputElement | null = null;
  private aValueEl: HTMLElement | null = null;
  private bValueEl: HTMLElement | null = null;
  private cValueEl: HTMLElement | null = null;
  private dValueEl: HTMLElement | null = null;
  private dStatusEl: HTMLElement | null = null;
  private solutionEl: HTMLElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.graphCanvas = new GraphCanvas(canvasElement, {
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
    });
    this.bindElements();
    this.setupEventListeners();
    this.updateUI();
    this.draw();
  }

  private bindElements(): void {
    this.aSlider = document.getElementById('disc-a') as HTMLInputElement;
    this.bSlider = document.getElementById('disc-b') as HTMLInputElement;
    this.cSlider = document.getElementById('disc-c') as HTMLInputElement;
    this.aValueEl = document.getElementById('disc-a-value');
    this.bValueEl = document.getElementById('disc-b-value');
    this.cValueEl = document.getElementById('disc-c-value');
    this.dValueEl = document.getElementById('disc-d-value');
    this.dStatusEl = document.getElementById('disc-d-status');
    this.solutionEl = document.getElementById('disc-solution');
    this.resetBtn = document.getElementById('disc-reset') as HTMLButtonElement;
  }

  private setupEventListeners(): void {
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

    this.cSlider?.addEventListener('input', (e) => {
      this.c = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    this.resetBtn?.addEventListener('click', () => this.reset());
  }

  private getDiscriminant(): number {
    return this.b * this.b - 4 * this.a * this.c;
  }

  private getSolutions(): number[] {
    const D = this.getDiscriminant();
    if (this.a === 0) return []; // 二次関数でない

    if (D > 0) {
      const sqrtD = Math.sqrt(D);
      return [(-this.b + sqrtD) / (2 * this.a), (-this.b - sqrtD) / (2 * this.a)];
    } else if (D === 0) {
      return [-this.b / (2 * this.a)];
    }
    return [];
  }

  private reset(): void {
    this.a = 1;
    this.b = 0;
    this.c = -4;
    if (this.aSlider) this.aSlider.value = '1';
    if (this.bSlider) this.bSlider.value = '0';
    if (this.cSlider) this.cSlider.value = '-4';
    this.updateUI();
    this.draw();
  }

  private updateUI(): void {
    const D = this.getDiscriminant();
    const solutions = this.getSolutions();

    // スライダー値
    if (this.aValueEl) this.aValueEl.textContent = this.a.toFixed(1);
    if (this.bValueEl) this.bValueEl.textContent = this.b.toFixed(1);
    if (this.cValueEl) this.cValueEl.textContent = this.c.toFixed(1);

    // 判別式の値
    if (this.dValueEl) {
      this.dValueEl.textContent = D.toFixed(1);
      // 色分け
      if (D > 0) {
        this.dValueEl.style.color = '#4ade80';
      } else if (D === 0) {
        this.dValueEl.style.color = '#fbbf24';
      } else {
        this.dValueEl.style.color = '#ff6b9d';
      }
    }

    // 判別式のステータス
    if (this.dStatusEl) {
      if (D > 0) {
        this.dStatusEl.textContent = 'D > 0：異なる2つの実数解';
        this.dStatusEl.className = 'disc-status positive';
      } else if (D === 0) {
        this.dStatusEl.textContent = 'D = 0：重解（接する）';
        this.dStatusEl.className = 'disc-status zero';
      } else {
        this.dStatusEl.textContent = 'D < 0：実数解なし';
        this.dStatusEl.className = 'disc-status negative';
      }
    }

    // 解の表示
    if (this.solutionEl) {
      if (this.a === 0) {
        this.solutionEl.textContent = '（aが0のため二次関数ではありません）';
      } else if (solutions.length === 2) {
        this.solutionEl.textContent = `x = ${solutions[0].toFixed(2)}, ${solutions[1].toFixed(2)}`;
      } else if (solutions.length === 1) {
        this.solutionEl.textContent = `x = ${solutions[0].toFixed(2)}（重解）`;
      } else {
        this.solutionEl.textContent = '実数解なし';
      }
    }
  }

  private f(x: number): number {
    return this.a * x * x + this.b * x + this.c;
  }

  private draw(): void {
    this.graphCanvas.drawBackground();

    const D = this.getDiscriminant();
    const solutions = this.getSolutions();

    // x軸を強調
    this.graphCanvas.drawLine(-10, 0, 10, 0, '#666', 3);

    // 放物線を描画
    if (this.a !== 0) {
      // Dに応じて色を変える
      let color = '#4a9eff';
      if (D > 0) color = '#4ade80';
      else if (D === 0) color = '#fbbf24';
      else color = '#ff6b9d';

      this.graphCanvas.drawFunction((x) => this.f(x), color, 3);
    }

    // 交点を描画
    for (const x of solutions) {
      this.graphCanvas.drawGlowPoint(x, 0, '#ffffff', 8);
      // ラベル
      this.graphCanvas.drawText(
        x.toFixed(1),
        x,
        -0.8,
        '#ffffff',
        11,
        'center'
      );
    }

    // 頂点
    if (this.a !== 0) {
      const vx = -this.b / (2 * this.a);
      const vy = this.f(vx);
      this.graphCanvas.drawPoint(vx, vy, '#4a9eff80', 6);
    }

    // D < 0 の場合、「交わらない」を視覚的に表示
    if (D < 0 && this.a !== 0) {
      const vx = -this.b / (2 * this.a);
      const vy = this.f(vx);
      // 頂点からx軸への距離を示す
      this.drawDashedLine(vx, vy, vx, 0, '#ff6b9d60');
    }
  }

  private drawDashedLine(x1: number, y1: number, x2: number, y2: number, color: string): void {
    const ctx = this.graphCanvas.getContext();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.graphCanvas.toCanvasX(x1), this.graphCanvas.toCanvasY(y1));
    ctx.lineTo(this.graphCanvas.toCanvasX(x2), this.graphCanvas.toCanvasY(y2));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  destroy(): void {
    // 特になし
  }
}
