import React, { useState, useEffect } from 'react';
import type { User, Post } from '../types';
import { Edit3, Calendar, Terminal, Link as LinkIcon, Users, Check, Plus, ArrowLeft } from 'lucide-react';

// Custom GitHub Icon SVG
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface ProfileViewProps {
  userId: number;
  currentUserId: number;
  token: string;
  onBackToFeed: () => void;
  onProfileUpdate?: (updatedUser: any) => void;
}

export function ProfileView({
  userId,
  currentUserId,
  token,
  onBackToFeed,
  onProfileUpdate
}: ProfileViewProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editSkills, setEditSkills] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';
  const isOwnProfile = userId === currentUserId;

  const fetchProfileAndPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile info
      const profileRes = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) throw new Error('Failed to fetch profile details');
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Populate edit fields if own profile
      if (isOwnProfile) {
        setEditName(profileData.name || '');
        setEditBio(profileData.bio || '');
        setEditGithubUrl(profileData.github_url || '');
        setEditAvatarUrl(profileData.avatar_url || '');
        setEditSkills(profileData.skills || '');
      }

      // 2. Fetch User posts
      const postsRes = await fetch(`${API_URL}/api/posts/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!postsRes.ok) throw new Error('Failed to fetch developer posts');
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (err: any) {
      setError(err.message || 'Error occurred retrieving profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, [userId, token]);

  const handleFollowToggle = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    
    const isFollowing = !!profile.is_followed;
    const endpoint = isFollowing ? '/api/relationships/unfollow' : '/api/relationships/follow';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ followedId: userId })
      });

      if (!res.ok) throw new Error('Failed to adjust follow status');

      // Update local profile state
      setProfile(prev => {
        if (!prev) return null;
        const offset = isFollowing ? -1 : 1;
        return {
          ...prev,
          is_followed: !isFollowing,
          followersCount: (prev.followersCount || 0) + offset
        };
      });
    } catch (err: any) {
      alert(err.message || 'Follow error.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          github_url: editGithubUrl,
          avatar_url: editAvatarUrl,
          skills: editSkills
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setProfile(prev => prev ? { ...prev, ...data.user } : null);
      setIsEditing(false);
      
      if (onProfileUpdate) {
        onProfileUpdate(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
        Loading Developer Profile...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'hsl(var(--danger))' }}>{error}</p>
        <button onClick={onBackToFeed} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Feed
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="view-container">
      {/* Back Button */}
      <button onClick={onBackToFeed} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px', gap: '6px' }}>
        <ArrowLeft size={14} /> Back to Feed
      </button>

      {/* Main Profile Info Card */}
      <div className="glass-panel animate-fade-in profile-card">
        
        {/* Profile Action Buttons */}
        <div className="profile-action-buttons-container">
          {isOwnProfile ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Edit3 size={14} />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`btn btn-sm ${profile.is_followed ? 'btn-secondary' : 'btn-primary'}`}
              style={{ gap: '6px' }}
            >
              {profile.is_followed ? (
                <>
                  <Check size={14} />
                  Following
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Connect
                </>
              )}
            </button>
          )}
        </div>

        {/* Profile Info Summary */}
        {!isEditing ? (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '2rem',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* User Bio and Meta */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>{profile.name}</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '12px' }}>@{profile.username}</p>
              
              {profile.bio ? (
                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                  {profile.bio}
                </p>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic', marginBottom: '20px' }}>
                  No bio provided yet.
                </p>
              )}

              {/* Skills/Tech Stack */}
              {profile.skills && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {profile.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="badge" style={{ padding: '4px 12px' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Links and Stats */}
              <div style={{
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.85rem',
                color: 'hsl(var(--text-secondary))'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} style={{ color: 'hsl(var(--text-muted))' }} />
                  <strong>{profile.followersCount || 0}</strong> followers
                  <span style={{ color: 'hsl(var(--text-muted))' }}>•</span>
                  <strong>{profile.followingCount || 0}</strong> following
                </div>

                {profile.github_url && (
                  <a
                    href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <GithubIcon />
                    GitHub Portfolio
                  </a>
                )}

                {profile.created_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-muted))' }}>
                    <Calendar size={14} />
                    Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Profile Edit Form */
          <form onSubmit={handleSaveProfile} className="animate-fade-in">
            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Update Portfolio Profile</h3>
            
            {error && (
              <div style={{
                background: 'hsl(var(--danger) / 0.15)',
                border: '1px solid hsl(var(--danger) / 0.3)',
                borderRadius: '8px',
                color: 'hsl(var(--danger))',
                padding: '12px 16px',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Developer Bio</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Tell the network about what you build, your developer stack, etc."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills (comma separated, e.g. React, Node, TS)</label>
              <input
                type="text"
                className="form-input"
                placeholder="React, TypeScript, SQLite, Docker"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="github.com/yourusername"
                value={editGithubUrl}
                onChange={(e) => setEditGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Avatar Image URL (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/... or your custom avatar"
                value={editAvatarUrl}
                onChange={(e) => setEditAvatarUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary btn-sm"
              >
                Discard
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Developer posts feed section */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
          Build & Activity Logs ({posts.length})
        </h3>
        
        {posts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))', borderStyle: 'dashed' }}>
            This developer has not logged any build activities yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <div key={post.id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    Logged on {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

                {post.project_name && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Terminal size={14} style={{ color: 'hsl(var(--primary))' }} />
                      {post.project_name}
                    </span>
                    {post.project_link && (
                      <a
                        href={post.project_link.startsWith('http') ? post.project_link : `https://${post.project_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.7rem', gap: '4px' }}
                      >
                        <LinkIcon size={10} />
                        Link
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
