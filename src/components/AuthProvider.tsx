"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  favorites: string[];
  isAdmin: boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  favorites: [],
  isAdmin: false,
  toggleFavorite: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const isSigningOut = useRef(false);
  const supabase = createClient();

  const loadProfile = useCallback(async (userId: string) => {
    if (isSigningOut.current) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!isSigningOut.current) setProfile(data);
  }, [supabase]);

  const loadFavorites = useCallback(async (userId: string) => {
    if (isSigningOut.current) return;
    const { data } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", userId);
    if (!isSigningOut.current) {
      setFavorites(data?.map((f: { product_id: string }) => f.product_id) ?? []);
    }
  }, [supabase]);

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user: User } | null } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser.id);
        loadFavorites(currentUser.id);
      }
      setLoading(false);
    });

    // Listen for auth changes (sign-in, token refresh, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      if (isSigningOut.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        loadProfile(currentUser.id);
        loadFavorites(currentUser.id);
      } else {
        setProfile(null);
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile, loadFavorites]);

  async function toggleFavorite(productId: string) {
    if (!user) return;
    const isFav = favorites.includes(productId);

    if (isFav) {
      setFavorites((prev) => prev.filter((id) => id !== productId));
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } else {
      setFavorites((prev) => [...prev, productId]);
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: productId });
    }
  }

  async function signOut() {
    isSigningOut.current = true;
    setUser(null);
    setProfile(null);
    setFavorites([]);

    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore errors — we're clearing state regardless
    }

    // Hard reload clears everything — new AuthProvider mount resets isSigningOut
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        favorites,
        isAdmin: profile?.role === "admin",
        toggleFavorite,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
