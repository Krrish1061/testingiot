import { create } from "zustand";
import IAuthStore from "../entities/zustandStore/AuthStore";
import { storeResetFns } from "./resetAllStore";

const initialAuthState = {
  user: null,
  token: null,
  isUserSuperAdmin: false,
  isUserCompanySuperAdmin: false,
  isUserDealer: false,
  isUserAdmin: false,
  isUserAssociatedWithCompany: false,
};

const useAuthStore = create<IAuthStore>((set) => {
  storeResetFns.add(() => set(initialAuthState));
  return {
    ...initialAuthState,
    setUser: (user) => set({ user: user }),
    setIsUserSuperAdmin: (isUserSuperAdmin) =>
      set({ isUserSuperAdmin: isUserSuperAdmin }),
    setIsUserCompanySuperAdmin: (isUserCompanySuperAdmin) =>
      set({ isUserCompanySuperAdmin: isUserCompanySuperAdmin }),
    setIsUserDealer: (isUserDealer) => set({ isUserDealer: isUserDealer }),
    setIsUserAdmin: (isUserAdmin) => set({ isUserAdmin: isUserAdmin }),
    setToken: (token) => set({ token: token }),
    setIsUserAssociatedWithCompany: (isUserAssociatedWithCompany) =>
      set({ isUserAssociatedWithCompany: isUserAssociatedWithCompany }),
  };
});

export default useAuthStore;
