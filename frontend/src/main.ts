/**
 * 関数の本質 - メインエントリポイント
 * 高校数学の関数を本質から理解するためのインタラクティブ学習サイト
 */

import { LaserGraph } from './visualizers/LaserGraph';
import { QuadraticParam } from './visualizers/QuadraticParam';
import { UnitCircle } from './visualizers/UnitCircle';
import { CompleteSquare } from './visualizers/CompleteSquare';
import { Discriminant } from './visualizers/Discriminant';
import { WaveParam } from './visualizers/WaveParam';
import { Fusion } from './visualizers/Fusion';
import { progressManager, SECTIONS, SectionKey } from './utils/progress';

// ビジュアライザーインスタンス
let laserGraph: LaserGraph | null = null;
let quadraticParam: QuadraticParam | null = null;
let unitCircle: UnitCircle | null = null;
let completeSquare: CompleteSquare | null = null;
let discriminant: Discriminant | null = null;
let waveParam: WaveParam | null = null;
let fusion: Fusion | null = null;

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
      case 'complete-square': {
        const canvas = document.getElementById('cs-canvas') as HTMLCanvasElement;
        if (canvas) {
          setupCanvas(canvas);
          completeSquare = new CompleteSquare(canvas);
        }
        break;
      }
      case 'discriminant': {
        const canvas = document.getElementById('disc-canvas') as HTMLCanvasElement;
        if (canvas) {
          setupCanvas(canvas);
          discriminant = new Discriminant(canvas);
        }
        break;
      }
      case 'wave-param': {
        const canvas = document.getElementById('wave-canvas-param') as HTMLCanvasElement;
        if (canvas) {
          setupCanvas(canvas);
          waveParam = new WaveParam(canvas);
        }
        break;
      }
      case 'fusion': {
        const circleCanvas = document.getElementById('fusion-circle') as HTMLCanvasElement;
        const quadCanvas = document.getElementById('fusion-quad') as HTMLCanvasElement;
        if (circleCanvas && quadCanvas) {
          setupCanvas(circleCanvas);
          setupCanvas(quadCanvas);
          fusion = new Fusion(circleCanvas, quadCanvas);
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
  if (completeSquare) {
    completeSquare.destroy();
    completeSquare = null;
  }
  if (discriminant) {
    discriminant.destroy();
    discriminant = null;
  }
  if (waveParam) {
    waveParam.destroy();
    waveParam = null;
  }
  if (fusion) {
    fusion.destroy();
    fusion = null;
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
        case '1':
          // 一次関数（未実装）→ 二次関数へ
          switchView('quadratic');
          break;
        case '2':
          switchView('quadratic');
          break;
        case '3':
          switchView('unit-circle');
          break;
        case '4':
          switchView('fusion');
          break;
        default:
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
 * 進捗表示を更新
 */
function updateProgressDisplay(): void {
  // レベルカードに完了マークを付ける
  document.querySelectorAll('.level-card').forEach((card) => {
    const level = card.getAttribute('data-level');
    let completed = false;

    // 各レベルに対応するセクションの完了状態をチェック
    switch (level) {
      case '0':
        completed = progressManager.isCompleted('laser');
        break;
      case '2':
        completed = progressManager.isCompleted('quadratic') &&
                    progressManager.isCompleted('complete-square') &&
                    progressManager.isCompleted('discriminant');
        break;
      case '3':
        completed = progressManager.isCompleted('unit-circle') &&
                    progressManager.isCompleted('wave-param');
        break;
      case '4':
        completed = progressManager.isCompleted('fusion');
        break;
    }

    if (completed) {
      card.classList.add('completed');
    } else {
      card.classList.remove('completed');
    }
  });

  // 進捗サマリーを更新
  const progressEl = document.getElementById('progress-summary');
  if (progressEl) {
    const completed = progressManager.getCompletedCount();
    const total = progressManager.getTotalCount();
    progressEl.textContent = `${completed}/${total} 完了`;

    // プログレスバー更新
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${(completed / total) * 100}%`;
    }
  }

  // ユーザーID表示
  const userIdEl = document.getElementById('user-id');
  if (userIdEl) {
    const userId = progressManager.getUserId();
    if (userId) {
      userIdEl.textContent = userId;
      userIdEl.parentElement?.classList.remove('hidden');
    }
  }
}

/**
 * セクション完了を記録
 */
async function markSectionComplete(section: SectionKey): Promise<void> {
  await progressManager.completeSection(section);
  updateProgressDisplay();
}

/**
 * 現在のビューに対応するセクションを完了としてマーク
 */
function markCurrentViewComplete(): void {
  if (currentView !== 'home' && currentView in SECTIONS) {
    markSectionComplete(currentView as SectionKey);
  }
}

/**
 * 初期化
 */
async function init(): Promise<void> {
  // 進捗管理を初期化
  await progressManager.init();

  // 進捗変更リスナーを設定
  progressManager.onChange(() => {
    updateProgressDisplay();
  });

  setupNavigation();

  // URLコピーボタン
  const copyBtn = document.getElementById('copy-url');
  copyBtn?.addEventListener('click', async () => {
    const url = progressManager.getShareUrl();
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'コピー完了!';
        setTimeout(() => {
          copyBtn.textContent = 'URLをコピー';
        }, 2000);
      } catch {
        // フォールバック
        prompt('このURLを共有:', url);
      }
    }
  });

  // 初期進捗表示
  updateProgressDisplay();

  // リサイズ対応（デバウンス付き）
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(handleResize, 250);
  });

  // 各ビジュアライザーで一定時間操作したら完了とみなす
  let interactionTimer: number | null = null;
  document.addEventListener('input', () => {
    if (currentView !== 'home') {
      if (interactionTimer) clearTimeout(interactionTimer);
      interactionTimer = window.setTimeout(() => {
        markCurrentViewComplete();
      }, 5000); // 5秒操作したら完了
    }
  });

  console.log('関数の本質 - 初期化完了');
}

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', init);
