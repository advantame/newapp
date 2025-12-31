const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE || "http://localhost:8787";

const statusEl = document.getElementById("status")!;
const messagesEl = document.getElementById("messages")!;
const inputEl = document.getElementById("input") as HTMLInputElement;
const sendBtn = document.getElementById("send")!;

let ws: WebSocket | null = null;
let myId = "";

function connect() {
  const wsUrl = BACKEND_BASE.replace(/^http/, "ws") + "/connect?room=default";
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    statusEl.textContent = "Connected";
    statusEl.style.background = "#1b4332";
  };

  ws.onclose = () => {
    statusEl.textContent = "Disconnected - Reconnecting...";
    statusEl.style.background = "#7f1d1d";
    setTimeout(connect, 2000);
  };

  ws.onerror = () => {
    ws?.close();
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleMessage(data);
  };
}

function handleMessage(data: { type: string; id?: string; from?: string; text?: string }) {
  const div = document.createElement("div");
  div.className = "msg";

  switch (data.type) {
    case "hello":
      myId = data.id!;
      div.textContent = `Welcome! Your ID: ${myId}`;
      break;
    case "join":
      div.textContent = `${data.id} joined`;
      break;
    case "leave":
      div.textContent = `${data.id} left`;
      break;
    case "chat":
      div.textContent = `${data.from}: ${data.text}`;
      break;
    default:
      div.textContent = JSON.stringify(data);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function send() {
  const text = inputEl.value.trim();
  if (text && ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "chat", text }));
    // Show own message
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = `${myId} (me): ${text}`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    inputEl.value = "";
  }
}

sendBtn.addEventListener("click", send);
inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") send();
});

connect();
