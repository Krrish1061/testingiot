import User from "../User";

interface IAuthState {
  user: User | null;
  isUserSuperAdmin: boolean;
  isUserCompanySuperAdmin: boolean;
  isUserDealer: boolean;
  isUserAdmin: boolean;
  token: string | null;
}

interface IAuthAction {
  setUser: (user: User | null) => void;
  setIsUserSuperAdmin: (isUserSuperAdmin: boolean) => void;
  setIsUserCompanySuperAdmin: (isUserSuperAdmin: boolean) => void;
  setIsUserDealer: (isUserSuperAdmin: boolean) => void;
  setIsUserAdmin: (isUserSuperAdmin: boolean) => void;
  setToken: (token: string | null) => void;
}

type IAuthStore = IAuthState & IAuthAction;

export default IAuthStore;
