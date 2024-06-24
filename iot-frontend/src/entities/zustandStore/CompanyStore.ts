import Company from "../Company";

interface ICompanyStore {
  company: Company | null;
  setCompany: (company: Company | null) => void;
}

export default ICompanyStore;
