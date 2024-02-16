import UserProfile from "./UserProfile";

interface User {
  id: number;
  username: string;
  type: "ADMIN" | "MODERATOR" | "VIEWER" | "SUPERADMIN";
  groups: string[];
  email?: string;
  company?: string | null;
  is_associated_with_company?: boolean;
  is_active?: boolean;
  date_joined?: string;
  created_by?: string;
  user_limit?: number;
  profile?: UserProfile;
}

export default User;
