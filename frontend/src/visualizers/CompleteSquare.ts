/**
 * CompleteSquare - 平方完成アニメーション
 * y = x² + bx + c から y = (x + p)² + q への変形を視覚化
 * 式の変形ステップとグラフの変化を同期して表示
 */

import { GraphCanvas } from '../components/Canvas';

// 変形ステップ
type Step = 'original' | 'expand' | 'half' | 'add_sub' | 'complete';

interface StepInfo {
  name: string;
  description: string;
  formula: (b: number, c: number) => string;
}

const STEPS: Record<Step, StepInfo> = {
  original: {
    name: '元の式',
    description: 'まず、一般形の二次関数から始めます',
    formula: (b, c) => `y = x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`,
  },
  expand: {
    name: 'xの係数を確認',
    description: 'xの係数は何でしょう？',
    formula: (b, c) => `y = x² ${b >= 0 ? '+' : '−'} <span class="highlight-b">${Math.abs(b)}</span>x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`,
  },
  half: {
    name: '係数を半分に',
    description: 'xの係数を2で割ります',
    formula: (b, c) => {
      const half = b / 2;
      return `y = x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}　→　${Math.abs(b)} ÷ 2 = <span class="highlight-p">${half >= 0 ? '' : '−'}${Math.abs(half)}</span>`;
    },
  },
  add_sub: {
    name: '足して引く',
    description: '(半分)²を足して引きます。式の値は変わりません',
    formula: (b, c) => {
      const half = b / 2;
      const square = half * half;
      return `y = x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x <span class="highlight-add">+ ${square}</span> <span class="highlight-sub">− ${square}</span> ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`;
    },
  },
  complete: {
    name: '完成！',
    description: '平方の形にまとめます',
    formula: (b, c) => {
      const p = b / 2;
      const q = c - p * p;
      return `y = (x ${p >= 0 ? '+' : '−'} ${Math.abs(p)})² ${q >= 0 ? '+' : '−'} ${Math.abs(q)}`;
    },
  },
};

export class CompleteSquare {
  private graphCanvas: GraphCanvas;
  private b: number = 4;
  private c: number = 3;
  private currentStep: Step = 'original';
  private isAnimating: boolean = false;
  private animationId: number | null = null;

  // DOM要素
  private bSlider: HTMLInputElement | null = null;
  private cSlider: HTMLInputElement | null = null;
  private bValueEl: HTMLElement | null = null;
  private cValueEl: HTMLElement | null = null;
  private formulaEl: HTMLElement | null = null;
  private stepNameEl: HTMLElement | null = null;
  private stepDescEl: HTMLElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private autoBtn: HTMLButtonElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;
  private stepIndicators: NodeListOf<HTMLElement> | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.graphCanvas = new GraphCanvas(canvasElement, {
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8,
    });
    this.bindElements();
    this.setupEventListeners();
    this.updateUI();
    this.draw();
  }

  private bindElements(): void {
    this.bSlider = document.getElementById('cs-b') as HTMLInputElement;
    this.cSlider = document.getElementById('cs-c') as HTMLInputElement;
    this.bValueEl = document.getElementById('cs-b-value');
    this.cValueEl = document.getElementById('cs-c-value');
    this.formulaEl = document.getElementById('cs-formula');
    this.stepNameEl = document.getElementById('cs-step-name');
    this.stepDescEl = document.getElementById('cs-step-desc');
    this.prevBtn = document.getElementById('cs-prev') as HTMLButtonElement;
    this.nextBtn = document.getElementById('cs-next') as HTMLButtonElement;
    this.autoBtn = document.getElementById('cs-auto') as HTMLButtonElement;
    this.resetBtn = document.getElementById('cs-reset') as HTMLButtonElement;
    this.stepIndicators = document.querySelectorAll('.step-dot');
  }

  private setupEventListeners(): void {
    this.bSlider?.addEventListener('input', (e) => {
      this.b = parseFloat((e.target as HTMLInputElement).value);
      this.reset();
    });

    this.cSlider?.addEventListener('input', (e) => {
      this.c = parseFloat((e.target as HTMLInputElement).value);
      this.reset();
    });

    this.prevBtn?.addEventListener('click', () => this.prevStep());
    this.nextBtn?.addEventListener('click', () => this.nextStep());
    this.autoBtn?.addEventListener('click', () => this.toggleAuto());
    this.resetBtn?.addEventListener('click', () => this.reset());
  }

  private getStepIndex(): number {
    const steps: Step[] = ['original', 'expand', 'half', 'add_sub', 'complete'];
    return steps.indexOf(this.currentStep);
  }

  private setStepByIndex(index: number): void {
    const steps: Step[] = ['original', 'expand', 'half', 'add_sub', 'complete'];
    if (index >= 0 && index < steps.length) {
      this.currentStep = steps[index];
      this.updateUI();
      this.draw();
    }
  }

  private prevStep(): void {
    const index = this.getStepIndex();
    if (index > 0) {
      this.setStepByIndex(index - 1);
    }
  }

  private nextStep(): void {
    const index = this.getStepIndex();
    if (index < 4) {
      this.setStepByIndex(index + 1);
    }
  }

  private toggleAuto(): void {
    if (this.isAnimating) {
      this.stopAuto();
    } else {
      this.startAuto();
    }
  }

  private startAuto(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    if (this.autoBtn) this.autoBtn.textContent = '停止';

    // 最初から
    this.setStepByIndex(0);

    let stepDelay = 0;
    const autoAdvance = () => {
      if (!this.isAnimating) return;

      stepDelay++;
      if (stepDelay >= 60) { // 約1秒ごと
        stepDelay = 0;
        const index = this.getStepIndex();
        if (index < 4) {
          this.setStepByIndex(index + 1);
        } else {
          this.stopAuto();
          return;
        }
      }

      this.animationId = requestAnimationFrame(autoAdvance);
    };

    this.animationId = requestAnimationFrame(autoAdvance);
  }

  private stopAuto(): void {
    this.isAnimating = false;
    if (this.autoBtn) this.autoBtn.textContent = '自動再生';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private reset(): void {
    this.stopAuto();
    this.currentStep = 'original';
    this.updateUI();
    this.draw();
  }

  private updateUI(): void {
    // スライダー値
    if (this.bValueEl) this.bValueEl.textContent = this.b.toString();
    if (this.cValueEl) this.cValueEl.textContent = this.c.toString();

    // 現在のステップ情報
    const stepInfo = STEPS[this.currentStep];
    if (this.formulaEl) this.formulaEl.innerHTML = stepInfo.formula(this.b, this.c);
    if (this.stepNameEl) this.stepNameEl.textContent = stepInfo.name;
    if (this.stepDescEl) this.stepDescEl.textContent = stepInfo.description;

    // ステップインジケーター
    const currentIndex = this.getStepIndex();
    this.stepIndicators?.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.classList.toggle('done', i < currentIndex);
    });

    // ボタン状態
    if (this.prevBtn) this.prevBtn.disabled = currentIndex === 0;
    if (this.nextBtn) this.nextBtn.disabled = currentIndex === 4;
  }

  // 元の関数 y = x² + bx + c
  private fOriginal(x: number): number {
    return x * x + this.b * x + this.c;
  }

  // 完成形 y = (x + p)² + q
  private fComplete(x: number): number {
    const p = this.b / 2;
    const q = this.c - p * p;
    return Math.pow(x + p, 2) + q;
  }

  private draw(): void {
    this.graphCanvas.drawBackground();

    const p = this.b / 2;
    const q = this.c - p * p;

    // ステップに応じた描画
    switch (this.currentStep) {
      case 'original':
      case 'expand':
      case 'half':
        // 元のグラフのみ
        this.graphCanvas.drawFunction((x) => this.fOriginal(x), '#4a9eff', 3);
        break;

      case 'add_sub':
        // 元のグラフ + 頂点への誘導線
        this.graphCanvas.drawFunction((x) => this.fOriginal(x), '#4a9eff', 3);
        // 頂点を点線で示す
        this.drawDashedLine(-p, -10, -p, 10, '#ff6b9d40');
        this.drawDashedLine(-10, q, 10, q, '#ff6b9d40');
        break;

      case 'complete':
        // 完成形のグラフ（同じだが色を変える）
        this.graphCanvas.drawFunction((x) => this.fComplete(x), '#4ade80', 3);
        // 頂点を強調
        this.graphCanvas.drawGlowPoint(-p, q, '#ff6b9d', 8);
        // 対称軸
        this.drawDashedLine(-p, -10, -p, 10, '#ff6b9d80');
        // 頂点座標ラベル
        this.graphCanvas.drawText(
          `(${(-p).toFixed(1)}, ${q.toFixed(1)})`,
          -p + 0.3,
          q + 0.8,
          '#ff6b9d',
          12,
          'left'
        );
        break;
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
    this.stopAuto();
  }
}
