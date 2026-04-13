// Supabase realtime-compatible shim using socket.io-client.
import { io, Socket } from "socket.io-client";
import { API_BASE_URL, getToken } from "./client.js";

type ChangeHandler = (payload: { new: unknown; old: unknown; eventType: string }) => void;

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${API_BASE_URL}/progress`, {
      auth: { token: getToken() },
      autoConnect: true,
      reconnection: true,
    });
  }
  return socket;
}

interface ChannelFilter {
  event: string;
  schema?: string;
  table?: string;
  filter?: string;
}

class Channel {
  private handlers: Array<{ type: string; filter: ChannelFilter; cb: ChangeHandler }> = [];
  private subscribed = false;
  private jobId?: string;

  constructor(public readonly name: string) {}

  on(type: "postgres_changes", filter: ChannelFilter, cb: ChangeHandler): this;
  on(type: string, filter: ChannelFilter, cb: ChangeHandler): this;
  on(type: string, filter: ChannelFilter, cb: ChangeHandler): this {
    this.handlers.push({ type, filter, cb });
    // Extract job id from filter if present: "id=eq.<uuid>"
    const match = filter.filter?.match(/id=eq\.([0-9a-f-]+)/i);
    if (match) this.jobId = match[1];
    return this;
  }

  subscribe(_cb?: (status: string) => void): this {
    if (this.subscribed) return this;
    this.subscribed = true;
    const s = getSocket();

    s.on("connect", () => {
      if (this.jobId) s.emit("subscribe:job", this.jobId);
      _cb?.("SUBSCRIBED");
    });

    const onUpdate = (payload: Record<string, unknown>) => {
      for (const h of this.handlers) {
        h.cb({
          new: payload,
          old: null,
          eventType: "UPDATE",
        });
      }
    };
    s.on("update", onUpdate);
    s.on("broadcast", onUpdate);
    return this;
  }

  async unsubscribe(): Promise<void> {
    const s = getSocket();
    if (this.jobId) s.emit("unsubscribe:job", this.jobId);
    s.off("update");
    s.off("broadcast");
    this.subscribed = false;
  }
}

export const realtime = {
  channel(name: string): Channel {
    return new Channel(name);
  },
  removeChannel(channel: Channel): Promise<void> {
    return channel.unsubscribe();
  },
};
