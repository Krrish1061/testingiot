interface Company {
  id: number;
  name: string;
  email: string;
  slug: string;
  phone_number?: string;
  address?: string;
  user_limit: number;
  created_at: string;
}

export default Company;
