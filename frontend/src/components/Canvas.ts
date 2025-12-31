/**
 * GraphCanvas - 数学グラフ描画の基盤クラス
 * 座標変換、グリッド描画、軸描画などの共通機能を提供
 */

export interface CanvasConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  gridStep: number;
  showGrid: boolean;
  showAxis: boolean;
}

export const DEFAULT_CONFIG: CanvasConfig = {
  xMin: -6,
  xMax: 6,
  yMin: -6,
  yMax: 6,
  gridStep: 1,
  showGrid: true,
  showAxis: true,
};

export class GraphCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CanvasConfig;
  private dpr: number; // デバイスピクセル比

  // カラー設定
  private colors = {
    background: '#0a0a0f',
    grid: '#2a2a3e',
    axis: '#4a4a5e',
    axisLabel: '#888',
  };

  constructor(canvas: HTMLCanvasElement, config: Partial<CanvasConfig> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
  }

  /**
   * Canvasのサイズを設定（高DPI対応）
   */
  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 500;
    const height = rect.height || 500;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // CSSサイズを維持
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  /**
   * Canvas幅（CSS px）
   */
  get width(): number {
    return this.canvas.width / this.dpr;
  }

  /**
   * Canvas高さ（CSS px）
   */
  get height(): number {
    return this.canvas.height / this.dpr;
  }

  /**
   * 数学座標 → Canvas座標 (X)
   */
  toCanvasX(x: number): number {
    const { xMin, xMax } = this.config;
    return ((x - xMin) / (xMax - xMin)) * this.width;
  }

  /**
   * 数学座標 → Canvas座標 (Y)
   * ※Y軸は上下反転
   */
  toCanvasY(y: number): number {
    const { yMin, yMax } = this.config;
    return this.height - ((y - yMin) / (yMax - yMin)) * this.height;
  }

  /**
   * Canvas座標 → 数学座標 (X)
   */
  toMathX(canvasX: number): number {
    const { xMin, xMax } = this.config;
    return xMin + (canvasX / this.width) * (xMax - xMin);
  }

  /**
   * Canvas座標 → 数学座標 (Y)
   */
  toMathY(canvasY: number): number {
    const { yMin, yMax } = this.config;
    return yMax - (canvasY / this.height) * (yMax - yMin);
  }

  /**
   * Canvasをクリア
   */
  clear(): void {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * グリッドを描画
   */
  drawGrid(): void {
    if (!this.config.showGrid) return;

    const { xMin, xMax, yMin, yMax, gridStep } = this.config;
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 1;

    // 縦線
    for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.toCanvasX(x), 0);
      this.ctx.lineTo(this.toCanvasX(x), this.height);
      this.ctx.stroke();
    }

    // 横線
    for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.toCanvasY(y));
      this.ctx.lineTo(this.width, this.toCanvasY(y));
      this.ctx.stroke();
    }
  }

  /**
   * 軸を描画
   */
  drawAxis(): void {
    if (!this.config.showAxis) return;

    const { xMin, xMax, yMin, yMax, gridStep } = this.config;

    // 軸線
    this.ctx.strokeStyle = this.colors.axis;
    this.ctx.lineWidth = 2;

    // X軸
    if (yMin <= 0 && yMax >= 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.toCanvasY(0));
      this.ctx.lineTo(this.width, this.toCanvasY(0));
      this.ctx.stroke();
    }

    // Y軸
    if (xMin <= 0 && xMax >= 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.toCanvasX(0), 0);
      this.ctx.lineTo(this.toCanvasX(0), this.height);
      this.ctx.stroke();
    }

    // 目盛りラベル
    this.ctx.fillStyle = this.colors.axisLabel;
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    // X軸ラベル
    for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
      if (x === 0) continue;
      const cx = this.toCanvasX(x);
      const cy = this.toCanvasY(0);
      if (cy > 0 && cy < this.height - 20) {
        this.ctx.fillText(x.toString(), cx, cy + 5);
      }
    }

    // Y軸ラベル
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
      if (y === 0) continue;
      const cx = this.toCanvasX(0);
      const cy = this.toCanvasY(y);
      if (cx > 20 && cx < this.width) {
        this.ctx.fillText(y.toString(), cx - 5, cy);
      }
    }

    // 原点
    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText('O', this.toCanvasX(0) - 5, this.toCanvasY(0) + 5);
    }
  }

  /**
   * 背景（グリッド + 軸）を描画
   */
  drawBackground(): void {
    this.clear();
    this.drawGrid();
    this.drawAxis();
  }

  /**
   * 点を描画
   */
  drawPoint(x: number, y: number, color: string = '#ff6b9d', radius: number = 4): void {
    const cx = this.toCanvasX(x);
    const cy = this.toCanvasY(y);

    // 範囲外チェック
    if (cy < -50 || cy > this.height + 50) return;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * グロー効果付きの点を描画
   */
  drawGlowPoint(x: number, y: number, color: string = '#ff6b9d', radius: number = 5): void {
    const cx = this.toCanvasX(x);
    const cy = this.toCanvasY(y);

    // 範囲外チェック
    if (cy < -50 || cy > this.height + 50) return;

    // グロー
    const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color + '80');
    gradient.addColorStop(1, 'transparent');

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // 中心点
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * 線を描画
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string = '#4a9eff', width: number = 2): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.toCanvasX(x1), this.toCanvasY(y1));
    this.ctx.lineTo(this.toCanvasX(x2), this.toCanvasY(y2));
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  /**
   * 関数のグラフを描画
   */
  drawFunction(
    f: (x: number) => number,
    color: string = '#4a9eff',
    width: number = 2,
    step: number = 0.05
  ): void {
    const { xMin, xMax, yMin, yMax } = this.config;

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    let started = false;
    for (let x = xMin; x <= xMax; x += step) {
      const y = f(x);

      // 範囲外や無効値をスキップ
      if (!isFinite(y) || y < yMin - 10 || y > yMax + 10) {
        started = false;
        continue;
      }

      const cx = this.toCanvasX(x);
      const cy = this.toCanvasY(y);

      if (!started) {
        this.ctx.moveTo(cx, cy);
        started = true;
      } else {
        this.ctx.lineTo(cx, cy);
      }
    }
    this.ctx.stroke();
  }

  /**
   * 円を描画
   */
  drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    color: string = '#4a9eff',
    width: number = 2,
    fill: boolean = false
  ): void {
    const cx = this.toCanvasX(centerX);
    const cy = this.toCanvasY(centerY);
    // 数学座標でのradiusをCanvas座標に変換
    const r = (radius / (this.config.xMax - this.config.xMin)) * this.width;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);

    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.stroke();
    }
  }

  /**
   * テキストを描画
   */
  drawText(
    text: string,
    x: number,
    y: number,
    color: string = '#e0e0e0',
    fontSize: number = 14,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.toCanvasX(x), this.toCanvasY(y));
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): CanvasConfig {
    return { ...this.config };
  }

  /**
   * コンテキストを取得（直接描画用）
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * リサイズハンドラ
   */
  resize(): void {
    this.setupCanvas();
  }
}
