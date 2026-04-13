// Supabase-auth compatible shim.
import { api, getToken, setToken, onAuthChange, ApiError } from "./client.js";

type AuthChangeCallback = (event: string, session: Session | null) => void;

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

interface LoginResponse {
  token: string;
  user: { id: string; email: string; roles: string[] };
}

interface MeResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

let cachedUser: User | null = null;

function toUser(me: MeResponse): User {
  return {
    id: me.id,
    email: me.email,
    user_metadata: { firstName: me.firstName, lastName: me.lastName },
    app_metadata: { roles: me.roles },
    aud: "authenticated",
  };
}

function toSession(token: string, user: User): Session {
  return {
    access_token: token,
    refresh_token: token,
    expires_in: 7 * 24 * 3600,
    token_type: "bearer",
    user,
  };
}

async function fetchMe(): Promise<User | null> {
  try {
    const me = await api.get<MeResponse>("/api/auth/me");
    const user = toUser(me);
    cachedUser = user;
    return user;
  } catch {
    return null;
  }
}

export const auth = {
  async signInWithPassword(credentials: { email: string; password: string }): Promise<{
    data: { user: User | null; session: Session | null };
    error: ApiError | null;
  }> {
    try {
      const res = await api.post<LoginResponse>("/api/auth/login", credentials);
      setToken(res.token);
      const user: User = {
        id: res.user.id,
        email: res.user.email,
        app_metadata: { roles: res.user.roles },
        user_metadata: {},
        aud: "authenticated",
      };
      cachedUser = user;
      return {
        data: { user, session: toSession(res.token, user) },
        error: null,
      };
    } catch (err) {
      return {
        data: { user: null, session: null },
        error: err instanceof ApiError ? err : new ApiError(500, String(err)),
      };
    }
  },

  async signOut(): Promise<{ error: ApiError | null }> {
    try {
      await api.post("/api/auth/logout").catch(() => {});
    } finally {
      setToken(null);
      cachedUser = null;
    }
    return { error: null };
  },

  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    const token = getToken();
    if (!token) return { data: { session: null }, error: null };
    const user = cachedUser ?? (await fetchMe());
    if (!user) return { data: { session: null }, error: null };
    return { data: { session: toSession(token, user) }, error: null };
  },

  async getUser(): Promise<{ data: { user: User | null }; error: null }> {
    const token = getToken();
    if (!token) return { data: { user: null }, error: null };
    const user = cachedUser ?? (await fetchMe());
    return { data: { user }, error: null };
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    // Fire once with current state
    void (async () => {
      const { data } = await auth.getSession();
      callback(data.session ? "SIGNED_IN" : "SIGNED_OUT", data.session);
    })();

    const unsub = onAuthChange(async (token) => {
      if (!token) {
        cachedUser = null;
        callback("SIGNED_OUT", null);
        return;
      }
      const user = await fetchMe();
      callback("SIGNED_IN", user ? toSession(token, user) : null);
    });

    return {
      data: {
        subscription: {
          unsubscribe: unsub,
        },
      },
    };
  },
};
