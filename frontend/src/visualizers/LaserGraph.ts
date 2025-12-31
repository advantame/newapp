/**
 * LaserGraph - レーザー刻印グラフ
 * xを変化させると点が打たれ、グラフが生成されていく様子を視覚化
 */

import { GraphCanvas } from '../components/Canvas';

// 関数の定義
type MathFunction = (x: number) => number;

interface FunctionDef {
  name: string;
  fn: MathFunction;
  displayFormula: (x: number) => string;
}

// 組み込み関数
const FUNCTIONS: Record<string, FunctionDef> = {
  linear: {
    name: '一次関数',
    fn: (x) => 2 * x + 1,
    displayFormula: (x) => `f(${x.toFixed(1)}) = 2 × ${x.toFixed(1)} + 1`,
  },
  quadratic: {
    name: '二次関数',
    fn: (x) => x * x,
    displayFormula: (x) => `f(${x.toFixed(1)}) = (${x.toFixed(1)})² = ${(x * x).toFixed(2)}`,
  },
  cubic: {
    name: '三次関数',
    fn: (x) => x * x * x,
    displayFormula: (x) => `f(${x.toFixed(1)}) = (${x.toFixed(1)})³ = ${(x * x * x).toFixed(2)}`,
  },
  sin: {
    name: '正弦関数',
    fn: (x) => Math.sin(x),
    displayFormula: (x) => `f(${x.toFixed(1)}) = sin(${x.toFixed(1)}) = ${Math.sin(x).toFixed(3)}`,
  },
};

export class LaserGraph {
  private graphCanvas: GraphCanvas;
  private currentFunction: FunctionDef;
  private points: { x: number; y: number }[] = [];
  private currentX: number = -5;
  private isPlaying: boolean = false;
  private animationId: number | null = null;
  private speed: number = 5;

  // DOM要素
  private xSlider: HTMLInputElement | null = null;
  private xValueEl: HTMLElement | null = null;
  private calcXEl: HTMLElement | null = null;
  private calcFxEl: HTMLElement | null = null;
  private calcPointXEl: HTMLElement | null = null;
  private calcPointYEl: HTMLElement | null = null;
  private playBtn: HTMLButtonElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;
  private functionSelect: HTMLSelectElement | null = null;
  private speedSlider: HTMLInputElement | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.graphCanvas = new GraphCanvas(canvasElement, {
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
    });
    this.currentFunction = FUNCTIONS.quadratic;
    this.bindElements();
    this.setupEventListeners();
    this.draw();
  }

  /**
   * DOM要素をバインド
   */
  private bindElements(): void {
    this.xSlider = document.getElementById('laser-x') as HTMLInputElement;
    this.xValueEl = document.getElementById('laser-x-value');
    this.calcXEl = document.getElementById('calc-x');
    this.calcFxEl = document.getElementById('calc-fx');
    this.calcPointXEl = document.getElementById('calc-point-x');
    this.calcPointYEl = document.getElementById('calc-point-y');
    this.playBtn = document.getElementById('laser-play') as HTMLButtonElement;
    this.resetBtn = document.getElementById('laser-reset') as HTMLButtonElement;
    this.functionSelect = document.getElementById('laser-function') as HTMLSelectElement;
    this.speedSlider = document.getElementById('laser-speed') as HTMLInputElement;
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // Xスライダー
    this.xSlider?.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.setX(value);
    });

    // 再生ボタン
    this.playBtn?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
    });

    // リセットボタン
    this.resetBtn?.addEventListener('click', () => {
      this.reset();
    });

    // 関数選択
    this.functionSelect?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      this.setFunction(value);
    });

    // 速度スライダー
    this.speedSlider?.addEventListener('input', (e) => {
      this.speed = parseInt((e.target as HTMLInputElement).value);
    });
  }

  /**
   * X値を設定し、点を追加
   */
  setX(x: number): void {
    this.currentX = x;
    const y = this.currentFunction.fn(x);

    // 点を追加（重複チェック）
    const exists = this.points.some((p) => Math.abs(p.x - x) < 0.05);
    if (!exists) {
      this.points.push({ x, y });
      // X順でソート
      this.points.sort((a, b) => a.x - b.x);
    }

    this.updateUI(x, y);
    this.draw();
  }

  /**
   * UI更新
   */
  private updateUI(x: number, y: number): void {
    if (this.xValueEl) this.xValueEl.textContent = x.toFixed(1);
    if (this.xSlider) this.xSlider.value = x.toString();
    if (this.calcXEl) this.calcXEl.textContent = x.toFixed(1);
    if (this.calcFxEl) this.calcFxEl.textContent = y.toFixed(2);
    if (this.calcPointXEl) this.calcPointXEl.textContent = x.toFixed(1);
    if (this.calcPointYEl) this.calcPointYEl.textContent = y.toFixed(2);
  }

  /**
   * 関数を変更
   */
  setFunction(key: string): void {
    if (FUNCTIONS[key]) {
      this.currentFunction = FUNCTIONS[key];
      this.reset();
    }
  }

  /**
   * 自動再生開始
   */
  play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.playBtn) this.playBtn.textContent = '停止';

    // 現在位置からスタート
    let x = this.currentX;
    const xMax = 5;
    const step = 0.1;

    const animate = () => {
      if (!this.isPlaying) return;

      x += step * (this.speed / 5);
      if (x > xMax) {
        this.stop();
        return;
      }

      this.setX(x);
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 自動再生停止
   */
  stop(): void {
    this.isPlaying = false;
    if (this.playBtn) this.playBtn.textContent = '自動再生';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * リセット
   */
  reset(): void {
    this.stop();
    this.points = [];
    this.currentX = -5;
    this.setX(-5);
    this.draw();
  }

  /**
   * 描画
   */
  draw(): void {
    this.graphCanvas.drawBackground();

    // 軌跡（線）を描画
    if (this.points.length > 1) {
      const ctx = this.graphCanvas.getContext();
      ctx.beginPath();
      ctx.strokeStyle = '#4a9eff';
      ctx.lineWidth = 2;

      for (let i = 0; i < this.points.length; i++) {
        const p = this.points[i];
        const cx = this.graphCanvas.toCanvasX(p.x);
        const cy = this.graphCanvas.toCanvasY(p.y);

        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
    }

    // すべての点を描画（小さめ）
    for (const p of this.points) {
      this.graphCanvas.drawPoint(p.x, p.y, '#4a9eff', 3);
    }

    // 現在の点を強調表示（グロー効果）
    const currentY = this.currentFunction.fn(this.currentX);
    this.graphCanvas.drawGlowPoint(this.currentX, currentY, '#ff6b9d', 6);

    // 垂直線（現在のX位置）
    this.graphCanvas.drawLine(this.currentX, -10, this.currentX, 10, '#ff6b9d40', 1);
  }

  /**
   * リソース解放
   */
  destroy(): void {
    this.stop();
  }
}
