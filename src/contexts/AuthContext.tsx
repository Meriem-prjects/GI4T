import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@/api/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isObservatoireAdmin: boolean;
  isAccesDroitsAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isObservatoireAdmin, setIsObservatoireAdmin] = useState(false);
  const [isAccesDroitsAdmin, setIsAccesDroitsAdmin] = useState(false);
  const navigate = useNavigate();

  const applyRolesFromSession = (session: Session | null) => {
    const roles =
      ((session?.user?.app_metadata as { roles?: string[] } | undefined)?.roles) ?? [];
    setIsAdmin(roles.includes("admin"));
    setIsObservatoireAdmin(
      roles.includes("admin") || roles.includes("admin_observatoire"),
    );
    setIsAccesDroitsAdmin(
      roles.includes("admin") || roles.includes("admin_acces_droits"),
    );
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        applyRolesFromSession(session);
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      applyRolesFromSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data?.session) {
      setSession(data.session);
      setUser(data.user);
      applyRolesFromSession(data.session);
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setIsObservatoireAdmin(false);
    setIsAccesDroitsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, isAdmin, isObservatoireAdmin, isAccesDroitsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
