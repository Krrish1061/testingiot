import UserProfile from "./UserProfile";

interface ExtraField {
  created_by: string;
  user_limit: number;
  user_count: number;
}

interface User {
  id: number;
  username: string;
  type: string;
  groups: string[];
  email?: string;
  company?: string | null;
  is_associated_with_company?: boolean;
  is_active?: boolean;
  date_joined?: string;
  extra_fields?: ExtraField | null;
  profile?: UserProfile;
}

export default User;
