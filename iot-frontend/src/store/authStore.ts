import { create } from "zustand";
import User from "../entities/User";

type AuthUser = Partial<User> &
  Pick<User, "groups" | "id" | "username" | "type">;

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  token: string | null;
  setToken: (token: string) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user: user }),
  setToken: (token) => set({ token: token }),
}));

export default useAuthStore;
