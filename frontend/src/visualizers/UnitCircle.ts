/**
 * UnitCircle - 単位円と三角関数ビジュアライザー
 * 単位円上の点の回転と、それに同期した正弦波を描画
 */

import { GraphCanvas } from '../components/Canvas';

export class UnitCircle {
  private circleCanvas: GraphCanvas;
  private waveCanvas: GraphCanvas;

  // 状態
  private angle: number = 0; // ラジアン
  private isAnimating: boolean = false;
  private animationId: number | null = null;
  private waveHistory: { angle: number; sin: number }[] = [];

  // DOM要素
  private angleSlider: HTMLInputElement | null = null;
  private angleValueEl: HTMLElement | null = null;
  private cosValueEl: HTMLElement | null = null;
  private sinValueEl: HTMLElement | null = null;
  private animateBtn: HTMLButtonElement | null = null;
  private resetBtn: HTMLButtonElement | null = null;
  private angleBtns: NodeListOf<HTMLButtonElement> | null = null;

  constructor(circleCanvasEl: HTMLCanvasElement, waveCanvasEl: HTMLCanvasElement) {
    // 単位円用キャンバス
    this.circleCanvas = new GraphCanvas(circleCanvasEl, {
      xMin: -1.8,
      xMax: 1.8,
      yMin: -1.8,
      yMax: 1.8,
      gridStep: 0.5,
    });

    // 波形用キャンバス
    this.waveCanvas = new GraphCanvas(waveCanvasEl, {
      xMin: 0,
      xMax: 4 * Math.PI,
      yMin: -1.5,
      yMax: 1.5,
      gridStep: 1,
    });

    this.bindElements();
    this.setupEventListeners();
    this.draw();
  }

  /**
   * DOM要素をバインド
   */
  private bindElements(): void {
    this.angleSlider = document.getElementById('angle-slider') as HTMLInputElement;
    this.angleValueEl = document.getElementById('angle-value');
    this.cosValueEl = document.getElementById('cos-value');
    this.sinValueEl = document.getElementById('sin-value');
    this.animateBtn = document.getElementById('circle-animate') as HTMLButtonElement;
    this.resetBtn = document.getElementById('circle-reset') as HTMLButtonElement;
    this.angleBtns = document.querySelectorAll('.angle-btn');
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // 角度スライダー
    this.angleSlider?.addEventListener('input', (e) => {
      const degrees = parseFloat((e.target as HTMLInputElement).value);
      this.setAngle(degrees * (Math.PI / 180));
    });

    // アニメーションボタン
    this.animateBtn?.addEventListener('click', () => {
      if (this.isAnimating) {
        this.stopAnimation();
      } else {
        this.startAnimation();
      }
    });

    // リセットボタン
    this.resetBtn?.addEventListener('click', () => {
      this.reset();
    });

    // 特殊角ボタン
    this.angleBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        const degrees = parseInt(btn.dataset.angle || '0');
        this.setAngle(degrees * (Math.PI / 180));
        if (this.angleSlider) this.angleSlider.value = degrees.toString();
      });
    });
  }

  /**
   * 角度を設定
   */
  setAngle(radians: number): void {
    this.angle = radians;

    // 波形履歴に追加
    const sin = Math.sin(radians);
    const exists = this.waveHistory.some((h) => Math.abs(h.angle - radians) < 0.02);
    if (!exists && radians >= 0) {
      this.waveHistory.push({ angle: radians, sin });
      this.waveHistory.sort((a, b) => a.angle - b.angle);
      // 最大4π分保持
      this.waveHistory = this.waveHistory.filter((h) => h.angle <= 4 * Math.PI);
    }

    this.updateUI();
    this.draw();
  }

  /**
   * UI更新
   */
  private updateUI(): void {
    const degrees = (this.angle * 180) / Math.PI;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    if (this.angleValueEl) {
      this.angleValueEl.textContent = Math.round(degrees).toString();
    }
    if (this.cosValueEl) {
      this.cosValueEl.textContent = cos.toFixed(3);
    }
    if (this.sinValueEl) {
      this.sinValueEl.textContent = sin.toFixed(3);
    }
    if (this.angleSlider) {
      this.angleSlider.value = (degrees % 360).toString();
    }
  }

  /**
   * アニメーション開始
   */
  startAnimation(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    if (this.animateBtn) this.animateBtn.textContent = '停止';

    const animate = () => {
      if (!this.isAnimating) return;

      this.angle += 0.02;
      if (this.angle > 4 * Math.PI) {
        this.angle = 0;
        this.waveHistory = [];
      }

      // 波形履歴に追加
      const sin = Math.sin(this.angle);
      this.waveHistory.push({ angle: this.angle, sin });

      this.updateUI();
      this.draw();
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * アニメーション停止
   */
  stopAnimation(): void {
    this.isAnimating = false;
    if (this.animateBtn) this.animateBtn.textContent = '回転開始';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * リセット
   */
  reset(): void {
    this.stopAnimation();
    this.angle = 0;
    this.waveHistory = [];
    if (this.angleSlider) this.angleSlider.value = '0';
    this.updateUI();
    this.draw();
  }

  /**
   * 描画（両方のキャンバス）
   */
  draw(): void {
    this.drawCircle();
    this.drawWave();
  }

  /**
   * 単位円を描画
   */
  private drawCircle(): void {
    this.circleCanvas.drawBackground();

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    // 単位円
    this.circleCanvas.drawCircle(0, 0, 1, '#4a4a5e', 2);

    // 角度の弧
    this.drawArc(0, 0, 0.3, 0, this.angle, '#fbbf24');

    // 半径（回転する線）
    this.circleCanvas.drawLine(0, 0, cos, sin, '#e0e0e0', 2);

    // cos（x座標）の表示線
    this.circleCanvas.drawLine(cos, 0, cos, sin, '#4a9eff', 2);
    this.circleCanvas.drawLine(0, 0, cos, 0, '#4a9eff', 3);

    // sin（y座標）の表示線
    this.circleCanvas.drawLine(0, sin, cos, sin, '#ff6b9d', 2);
    this.circleCanvas.drawLine(0, 0, 0, sin, '#ff6b9d', 3);

    // 点P
    this.circleCanvas.drawGlowPoint(cos, sin, '#ffffff', 8);

    // ラベル
    this.circleCanvas.drawText('cos', cos / 2, -0.15, '#4a9eff', 12, 'center');
    this.circleCanvas.drawText('sin', -0.15, sin / 2, '#ff6b9d', 12, 'center');
    this.circleCanvas.drawText('P', cos + 0.12, sin + 0.12, '#ffffff', 14, 'left');

    // 角度表示
    const angleText = `θ = ${Math.round((this.angle * 180) / Math.PI)}°`;
    this.circleCanvas.drawText(angleText, 0.4, 0.15, '#fbbf24', 11, 'left');
  }

  /**
   * 弧を描画
   */
  private drawArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
    color: string
  ): void {
    const ctx = this.circleCanvas.getContext();
    const canvasCx = this.circleCanvas.toCanvasX(cx);
    const canvasCy = this.circleCanvas.toCanvasY(cy);
    // 半径をCanvas座標に変換
    const config = this.circleCanvas.getConfig();
    const canvasR = (r / (config.xMax - config.xMin)) * this.circleCanvas['width'];

    ctx.beginPath();
    // Canvasの角度は時計回り、Y軸反転のため調整
    ctx.arc(canvasCx, canvasCy, canvasR, -startAngle, -endAngle, true);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * 波形を描画
   */
  private drawWave(): void {
    this.waveCanvas.drawBackground();

    // sin波の完全な形（薄く表示）
    this.waveCanvas.drawFunction((x) => Math.sin(x), '#4a9eff30', 1);

    // 履歴に基づく波形（描画済み部分）
    if (this.waveHistory.length > 1) {
      const ctx = this.waveCanvas.getContext();
      ctx.beginPath();
      ctx.strokeStyle = '#ff6b9d';
      ctx.lineWidth = 3;

      for (let i = 0; i < this.waveHistory.length; i++) {
        const h = this.waveHistory[i];
        const cx = this.waveCanvas.toCanvasX(h.angle);
        const cy = this.waveCanvas.toCanvasY(h.sin);

        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
    }

    // 現在の点
    const currentX = this.angle;
    const currentY = Math.sin(this.angle);
    if (currentX >= 0 && currentX <= 4 * Math.PI) {
      this.waveCanvas.drawGlowPoint(currentX, currentY, '#ff6b9d', 6);

      // 垂直線（現在位置）
      this.waveCanvas.drawLine(currentX, -2, currentX, 2, '#ff6b9d40', 1);
    }

    // 軸ラベル
    this.drawWaveAxisLabels();
  }

  /**
   * 波形の軸ラベルを描画
   */
  private drawWaveAxisLabels(): void {
    const ctx = this.waveCanvas.getContext();
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // πの目盛り
    const piPositions = [
      { x: Math.PI, label: 'π' },
      { x: 2 * Math.PI, label: '2π' },
      { x: 3 * Math.PI, label: '3π' },
      { x: 4 * Math.PI, label: '4π' },
    ];

    const y0 = this.waveCanvas.toCanvasY(0);
    for (const pos of piPositions) {
      const cx = this.waveCanvas.toCanvasX(pos.x);
      ctx.fillText(pos.label, cx, y0 + 5);
    }
  }

  /**
   * リソース解放
   */
  destroy(): void {
    this.stopAnimation();
  }
}
