import { create } from "zustand";
import ICompanyStore from "../entities/zustandStore/CompanyStore";
import { storeResetFns } from "./resetAllStore";

const useCompanyStore = create<ICompanyStore>((set) => {
  storeResetFns.add(() => set({ company: null }));
  return {
    company: null,
    setCompany: (company) => set({ company: company }),
  };
});

export default useCompanyStore;
