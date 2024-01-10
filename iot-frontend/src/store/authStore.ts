import { create } from "zustand";
import User from "../entities/User";

// type AuthUser = Partial<User> &
//   Pick<User, "groups" | "id" | "username" | "type">;

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isUserSuperAdmin: boolean;
  setIsUserSuperAdmin: (isUserSuperAdmin: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isUserSuperAdmin: false,
  setUser: (user) => set({ user: user }),
  setIsUserSuperAdmin: (isUserSuperAdmin) =>
    set({ isUserSuperAdmin: isUserSuperAdmin }),
  setToken: (token) => set({ token: token }),
}));

export default useAuthStore;
