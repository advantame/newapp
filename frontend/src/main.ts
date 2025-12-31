/**
 * 関数の本質 - メインエントリポイント
 * 高校数学の関数を本質から理解するためのインタラクティブ学習サイト
 */

import { LaserGraph } from './visualizers/LaserGraph';
import { QuadraticParam } from './visualizers/QuadraticParam';
import { UnitCircle } from './visualizers/UnitCircle';

// ビジュアライザーインスタンス
let laserGraph: LaserGraph | null = null;
let quadraticParam: QuadraticParam | null = null;
let unitCircle: UnitCircle | null = null;

// 現在のビュー
let currentView: string = 'home';

/**
 * ビューを切り替え
 */
function switchView(viewName: string): void {
  // 前のビジュアライザーを破棄
  destroyCurrentVisualizer();

  // ナビゲーションボタンの状態更新
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    }
  });

  // ビューの表示切り替え
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  currentView = viewName;

  // ビジュアライザーを初期化
  initializeVisualizer(viewName);
}

/**
 * ビジュアライザーを初期化
 */
function initializeVisualizer(viewName: string): void {
  // 少し遅延させてDOMが確実に表示されてから初期化
  requestAnimationFrame(() => {
    switch (viewName) {
      case 'laser': {
        const canvas = document.getElementById('laser-canvas') as HTMLCanvasElement;
        if (canvas) {
          setupCanvas(canvas);
          laserGraph = new LaserGraph(canvas);
        }
        break;
      }
      case 'quadratic': {
        const canvas = document.getElementById('quadratic-canvas') as HTMLCanvasElement;
        if (canvas) {
          setupCanvas(canvas);
          quadraticParam = new QuadraticParam(canvas);
        }
        break;
      }
      case 'unit-circle': {
        const circleCanvas = document.getElementById('circle-canvas') as HTMLCanvasElement;
        const waveCanvas = document.getElementById('wave-canvas') as HTMLCanvasElement;
        if (circleCanvas && waveCanvas) {
          setupCanvas(circleCanvas);
          setupCanvas(waveCanvas);
          unitCircle = new UnitCircle(circleCanvas, waveCanvas);
        }
        break;
      }
    }
  });
}

/**
 * Canvasのサイズを設定
 */
function setupCanvas(canvas: HTMLCanvasElement): void {
  const wrapper = canvas.parentElement;
  if (!wrapper) return;

  const rect = wrapper.getBoundingClientRect();
  const size = Math.min(rect.width - 32, rect.height - 32, 500);

  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
}

/**
 * 現在のビジュアライザーを破棄
 */
function destroyCurrentVisualizer(): void {
  if (laserGraph) {
    laserGraph.destroy();
    laserGraph = null;
  }
  if (quadraticParam) {
    quadraticParam.destroy();
    quadraticParam = null;
  }
  if (unitCircle) {
    unitCircle.destroy();
    unitCircle = null;
  }
}

/**
 * ナビゲーションの設定
 */
function setupNavigation(): void {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const viewName = (e.target as HTMLElement).getAttribute('data-view');
      if (viewName) {
        switchView(viewName);
      }
    });
  });

  // レベルカードのクリック
  document.querySelectorAll('.level-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const level = (e.currentTarget as HTMLElement).getAttribute('data-level');
      if ((e.currentTarget as HTMLElement).classList.contains('locked')) {
        return;
      }

      // レベルに応じてビューを切り替え
      switch (level) {
        case '0':
          switchView('laser');
          break;
        case '2':
          switchView('quadratic');
          break;
        case '3':
          switchView('unit-circle');
          break;
        default:
          // 他のレベルは未実装
          break;
      }
    });
  });
}

/**
 * リサイズハンドラ
 */
function handleResize(): void {
  // 現在のビューを再初期化
  if (currentView !== 'home') {
    destroyCurrentVisualizer();
    initializeVisualizer(currentView);
  }
}

/**
 * 初期化
 */
function init(): void {
  setupNavigation();

  // リサイズ対応（デバウンス付き）
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(handleResize, 250);
  });

  console.log('関数の本質 - 初期化完了');
}

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', init);
