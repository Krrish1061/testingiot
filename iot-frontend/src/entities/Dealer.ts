import IDealerProfile from "./DealerProfile";

interface IDealer {
  id: number;
  name: string;
  email: string;
  slug: string;
  user_company_limit: number | null;
  created_at: string;
  profile?: IDealerProfile;
}

export default IDealer;
