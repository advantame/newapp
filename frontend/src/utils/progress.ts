/**
 * Progress - 進捗管理ユーティリティ
 * ユーザーごとにURL発行し、進捗をサーバーとlocalStorageに保存
 */

const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE || "https://newapp-backend.wstomo53.workers.dev";
const STORAGE_KEY = "math-progress";

export interface UserProgress {
  id: string;
  createdAt: string;
  completedSections: string[];
}

// セクションの定義
export const SECTIONS = {
  laser: { name: "グラフ生成", level: 0 },
  quadratic: { name: "二次関数", level: 2 },
  "complete-square": { name: "平方完成", level: 2 },
  discriminant: { name: "判別式", level: 2 },
  "unit-circle": { name: "単位円", level: 3 },
  "wave-param": { name: "波形", level: 3 },
  fusion: { name: "融合問題", level: 4 },
} as const;

export type SectionKey = keyof typeof SECTIONS;

class ProgressManager {
  private userId: string | null = null;
  private progress: UserProgress | null = null;
  private listeners: Array<(progress: UserProgress) => void> = [];

  /**
   * 初期化：URLからユーザーIDを取得、またはlocalStorageから復元
   */
  async init(): Promise<void> {
    // URLからユーザーIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get("u");

    if (urlUserId) {
      this.userId = urlUserId;
      await this.loadProgress();
    } else {
      // localStorageから復元
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          this.progress = JSON.parse(stored);
          this.userId = this.progress?.id || null;
        } catch {
          // 無効なデータ
        }
      }
    }
  }

  /**
   * 新規ユーザー作成
   */
  async createUser(): Promise<string> {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/user`, { method: "POST" });
      const data = await res.json();
      this.userId = data.id;
      this.progress = {
        id: data.id,
        createdAt: new Date().toISOString(),
        completedSections: [],
      };
      this.saveLocal();
      this.notifyListeners();

      // URLを更新（履歴に追加しない）
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("u", data.id);
      window.history.replaceState({}, "", newUrl.toString());

      return data.id;
    } catch {
      // サーバーが使えない場合はローカルIDを生成
      const localId = this.generateLocalId();
      this.userId = localId;
      this.progress = {
        id: localId,
        createdAt: new Date().toISOString(),
        completedSections: [],
      };
      this.saveLocal();
      this.notifyListeners();
      return localId;
    }
  }

  /**
   * サーバーから進捗を読み込み
   */
  private async loadProgress(): Promise<void> {
    if (!this.userId) return;

    try {
      const res = await fetch(`${BACKEND_BASE}/api/user/${this.userId}/progress`);
      if (res.ok) {
        this.progress = await res.json();
        this.saveLocal();
        this.notifyListeners();
      } else {
        // サーバーにない場合はlocalStorageを確認
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const local = JSON.parse(stored);
          if (local.id === this.userId) {
            this.progress = local;
          }
        }
      }
    } catch {
      // サーバーエラー時はlocalStorageから
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          this.progress = JSON.parse(stored);
        } catch {
          // 無効なデータ
        }
      }
    }
  }

  /**
   * セクション完了を記録
   */
  async completeSection(section: SectionKey): Promise<void> {
    if (!this.progress) {
      await this.createUser();
    }

    if (!this.progress) return;

    // 既に完了している場合はスキップ
    if (this.progress.completedSections.includes(section)) {
      return;
    }

    this.progress.completedSections.push(section);
    this.saveLocal();
    this.notifyListeners();

    // サーバーに保存（非同期）
    if (this.userId) {
      try {
        await fetch(`${BACKEND_BASE}/api/user/${this.userId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        });
      } catch {
        // サーバーエラーは無視（ローカルには保存済み）
      }
    }
  }

  /**
   * セクションが完了しているか確認
   */
  isCompleted(section: SectionKey): boolean {
    return this.progress?.completedSections.includes(section) || false;
  }

  /**
   * 完了セクション数を取得
   */
  getCompletedCount(): number {
    return this.progress?.completedSections.length || 0;
  }

  /**
   * 全セクション数を取得
   */
  getTotalCount(): number {
    return Object.keys(SECTIONS).length;
  }

  /**
   * ユーザーIDを取得
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * 共有URLを取得
   */
  getShareUrl(): string | null {
    if (!this.userId) return null;
    const url = new URL(window.location.origin);
    url.searchParams.set("u", this.userId);
    return url.toString();
  }

  /**
   * 進捗データを取得
   */
  getProgress(): UserProgress | null {
    return this.progress;
  }

  /**
   * 変更リスナーを追加
   */
  onChange(listener: (progress: UserProgress) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * ローカルに保存
   */
  private saveLocal(): void {
    if (this.progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    }
  }

  /**
   * リスナーに通知
   */
  private notifyListeners(): void {
    if (this.progress) {
      this.listeners.forEach((l) => l(this.progress!));
    }
  }

  /**
   * ローカルID生成
   */
  private generateLocalId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "local_";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }
}

// シングルトンインスタンス
export const progressManager = new ProgressManager();
