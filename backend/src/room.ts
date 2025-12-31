import { DurableObject } from "cloudflare:workers";

interface Env {
  ROOMS: DurableObjectNamespace;
}

export class Room extends DurableObject<Env> {
  private connections: Map<WebSocket, string> = new Map();
  private nextId = 1;

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const clientId = `user-${this.nextId++}`;
    this.connections.set(server, clientId);

    server.accept();

    // Send welcome message
    server.send(JSON.stringify({ type: "hello", id: clientId }));

    // Broadcast join
    this.broadcast({ type: "join", id: clientId }, server);

    server.addEventListener("message", (event) => {
      const data = JSON.parse(event.data as string);
      // Echo to all other clients
      this.broadcast({ ...data, from: clientId }, server);
    });

    server.addEventListener("close", () => {
      this.connections.delete(server);
      this.broadcast({ type: "leave", id: clientId });
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private broadcast(message: unknown, exclude?: WebSocket) {
    const json = JSON.stringify(message);
    for (const [ws] of this.connections) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(json);
      }
    }
  }
}
