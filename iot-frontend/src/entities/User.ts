interface User {
  id: number;
  email: string;
  username: string;
  company: string | null;
  is_associated_with_company: boolean;
  type: string;
  groups: string[];
  is_active: boolean;
  date_joined: string;
}

export default User;
