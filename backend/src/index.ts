import { Room } from "./room";

export { Room };

export interface Env {
  ROOMS: DurableObjectNamespace;
  PROGRESS?: KVNamespace; // Optional: create with `wrangler kv namespace create PROGRESS`
}

// CORS ヘッダー
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ユーザーID生成（簡易版）
function generateUserId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// 進捗データの型
interface UserProgress {
  id: string;
  createdAt: string;
  completedSections: string[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === "/") {
      return new Response("newapp-backend is running", {
        headers: corsHeaders,
      });
    }

    // WebSocket connection endpoint
    if (url.pathname === "/connect") {
      const room = url.searchParams.get("room") || "default";
      const id = env.ROOMS.idFromName(room);
      const stub = env.ROOMS.get(id);
      return stub.fetch(request);
    }

    // === Progress API ===

    // POST /api/user - 新規ユーザー作成
    if (url.pathname === "/api/user" && request.method === "POST") {
      const userId = generateUserId();
      const progress: UserProgress = {
        id: userId,
        createdAt: new Date().toISOString(),
        completedSections: [],
      };

      // KVが設定されている場合は保存
      if (env.PROGRESS) {
        try {
          await env.PROGRESS.put(`user:${userId}`, JSON.stringify(progress));
        } catch {
          // KV保存失敗は無視
        }
      }

      return new Response(JSON.stringify({ id: userId, url: `/?u=${userId}`, local: !env.PROGRESS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /api/user/:id/progress - 進捗取得
    const getProgressMatch = url.pathname.match(/^\/api\/user\/([a-z0-9]+)\/progress$/);
    if (getProgressMatch && request.method === "GET") {
      const userId = getProgressMatch[1];

      if (!env.PROGRESS) {
        return new Response(JSON.stringify({ error: "Storage not configured", local: true }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const data = await env.PROGRESS.get(`user:${userId}`);
        if (!data) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(data, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Storage unavailable" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // POST /api/user/:id/progress - 進捗保存
    const postProgressMatch = url.pathname.match(/^\/api\/user\/([a-z0-9]+)\/progress$/);
    if (postProgressMatch && request.method === "POST") {
      const userId = postProgressMatch[1];

      if (!env.PROGRESS) {
        // KVがない場合は成功として返す（ローカル保存を促す）
        return new Response(JSON.stringify({ id: userId, completedSections: [], local: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const body = await request.json() as { section: string };
        const section = body.section;

        if (!section) {
          return new Response(JSON.stringify({ error: "section required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 既存データ取得
        let progress: UserProgress;
        const existing = await env.PROGRESS.get(`user:${userId}`);

        if (existing) {
          progress = JSON.parse(existing);
        } else {
          progress = {
            id: userId,
            createdAt: new Date().toISOString(),
            completedSections: [],
          };
        }

        // セクション追加（重複なし）
        if (!progress.completedSections.includes(section)) {
          progress.completedSections.push(section);
        }

        await env.PROGRESS.put(`user:${userId}`, JSON.stringify(progress));

        return new Response(JSON.stringify(progress), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Failed to save" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
