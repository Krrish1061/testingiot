interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
  facebook_profile: string | null;
  linkedin_profile: string | null;
  phone_number: number | null;
  data_of_birth: Date | null;
  is_username_modified: boolean;
}

export default UserProfile;
