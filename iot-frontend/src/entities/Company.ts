import CompanyProfile from "./CompanyProfile";

interface Company {
  id: number;
  name: string;
  email: string;
  slug: string;
  user_limit: number | null;
  created_at: string;
  profile?: CompanyProfile;
}

export default Company;
