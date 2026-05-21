export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  github_url: string | null;
  avatar_url: string | null;
  skills: string | null;
  created_at?: string;
  is_followed?: number | boolean;
  followersCount?: number;
  followingCount?: number;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  project_name: string | null;
  project_link: string | null;
  created_at: string;
  username: string;
  name: string;
  avatar_url: string | null;
  skills?: string | null;
}
