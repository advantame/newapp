/**
 * QuadraticParam - 二次関数パラメータビジュアライザー
 * y = a(x - p)² + q の各パラメータをスライダーで変更し、
 * グラフの変化をリアルタイムで観察
 */

import { GraphCanvas } from '../components/Canvas';

export class QuadraticParam {
  private graphCanvas: GraphCanvas;

  // パラメータ
  private a: number = 1;
  private p: number = 0;
  private q: number = 0;

  // DOM要素
  private aSlider: HTMLInputElement | null = null;
  private pSlider: HTMLInputElement | null = null;
  private qSlider: HTMLInputElement | null = null;
  private aValueEl: HTMLElement | null = null;
  private pValueEl: HTMLElement | null = null;
  private qValueEl: HTMLElement | null = null;
  private paramAEl: HTMLElement | null = null;
  private paramPEl: HTMLElement | null = null;
  private paramQEl: HTMLElement | null = null;
  private vertexXEl: HTMLElement | null = null;
  private vertexYEl: HTMLElement | null = null;
  private axisXEl: HTMLElement | null = null;
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
    this.draw();
  }

  /**
   * DOM要素をバインド
   */
  private bindElements(): void {
    this.aSlider = document.getElementById('quad-a') as HTMLInputElement;
    this.pSlider = document.getElementById('quad-p') as HTMLInputElement;
    this.qSlider = document.getElementById('quad-q') as HTMLInputElement;
    this.aValueEl = document.getElementById('quad-a-value');
    this.pValueEl = document.getElementById('quad-p-value');
    this.qValueEl = document.getElementById('quad-q-value');
    this.paramAEl = document.querySelector('.param-a');
    this.paramPEl = document.querySelector('.param-p');
    this.paramQEl = document.querySelector('.param-q');
    this.vertexXEl = document.getElementById('vertex-x');
    this.vertexYEl = document.getElementById('vertex-y');
    this.axisXEl = document.getElementById('axis-x');
    this.resetBtn = document.getElementById('quad-reset') as HTMLButtonElement;
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // Aスライダー
    this.aSlider?.addEventListener('input', (e) => {
      this.a = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    // Pスライダー
    this.pSlider?.addEventListener('input', (e) => {
      this.p = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    // Qスライダー
    this.qSlider?.addEventListener('input', (e) => {
      this.q = parseFloat((e.target as HTMLInputElement).value);
      this.updateUI();
      this.draw();
    });

    // リセットボタン
    this.resetBtn?.addEventListener('click', () => {
      this.reset();
    });
  }

  /**
   * UI更新
   */
  private updateUI(): void {
    // スライダー値
    if (this.aValueEl) this.aValueEl.textContent = this.a.toFixed(1);
    if (this.pValueEl) this.pValueEl.textContent = this.p.toFixed(1);
    if (this.qValueEl) this.qValueEl.textContent = this.q.toFixed(1);

    // 数式表示
    if (this.paramAEl) this.paramAEl.textContent = this.a.toFixed(1);
    if (this.paramPEl) this.paramPEl.textContent = this.p.toFixed(1);
    if (this.paramQEl) this.paramQEl.textContent = this.q.toFixed(1);

    // 頂点と軸
    if (this.vertexXEl) this.vertexXEl.textContent = this.p.toFixed(1);
    if (this.vertexYEl) this.vertexYEl.textContent = this.q.toFixed(1);
    if (this.axisXEl) this.axisXEl.textContent = this.p.toFixed(1);
  }

  /**
   * 二次関数 y = a(x - p)² + q
   */
  private f(x: number): number {
    return this.a * Math.pow(x - this.p, 2) + this.q;
  }

  /**
   * リセット
   */
  reset(): void {
    this.a = 1;
    this.p = 0;
    this.q = 0;

    if (this.aSlider) this.aSlider.value = '1';
    if (this.pSlider) this.pSlider.value = '0';
    if (this.qSlider) this.qSlider.value = '0';

    this.updateUI();
    this.draw();
  }

  /**
   * 描画
   */
  draw(): void {
    this.graphCanvas.drawBackground();

    // a = 0 の場合は直線
    if (Math.abs(this.a) < 0.01) {
      // y = q (定数関数)
      this.graphCanvas.drawLine(-10, this.q, 10, this.q, '#4a9eff', 3);
    } else {
      // 放物線を描画
      this.graphCanvas.drawFunction((x) => this.f(x), '#4a9eff', 3);
    }

    // 頂点を強調表示
    this.graphCanvas.drawGlowPoint(this.p, this.q, '#ff6b9d', 8);

    // 対称軸（点線風）
    this.drawDashedLine(this.p, -10, this.p, 10, '#ff6b9d60');

    // 頂点座標のラベル
    const labelY = this.q + (this.a >= 0 ? 0.8 : -0.8);
    this.graphCanvas.drawText(
      `(${this.p.toFixed(1)}, ${this.q.toFixed(1)})`,
      this.p + 0.3,
      labelY,
      '#ff6b9d',
      12,
      'left'
    );
  }

  /**
   * 点線を描画
   */
  private drawDashedLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
  ): void {
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

  /**
   * リソース解放
   */
  destroy(): void {
    // 特に解放するリソースなし
  }
}
