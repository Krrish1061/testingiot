import { create } from "zustand";
import Company from "../entities/Company";

interface CompanyStore {
  company: Company;
  setCompany: (company: Company) => void;
}

const useCompanyStore = create<CompanyStore>((set) => ({
  company: {} as Company,
  setCompany: (company) => set({ company: company }),
}));

export default useCompanyStore;
