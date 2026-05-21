import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Search, Users, UserPlus, UserCheck, AlertCircle } from 'lucide-react';

interface NetworkViewProps {
  token: string;
  onNavigateToUser: (userId: number) => void;
}

export function NetworkView({ token, onNavigateToUser }: NetworkViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchUsers = async (search = '') => {
    try {
      const queryParam = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_URL}/api/users${queryParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch developer list');
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching developer network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]);

  const handleFollowToggle = async (e: React.MouseEvent, targetUser: User) => {
    e.stopPropagation(); // Avoid triggering card click navigation
    if (togglingId !== null) return;
    
    setTogglingId(targetUser.id);
    const isFollowing = !!targetUser.is_followed;
    const endpoint = isFollowing ? '/api/relationships/unfollow' : '/api/relationships/follow';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ followedId: targetUser.id })
      });

      if (!res.ok) throw new Error('Could not update relationship connection');

      setUsers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, is_followed: !isFollowing } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Relationship action failed.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* View Header */}
      <div style={{ marginBottom: '32px' }} className="animate-fade-in">
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ color: 'hsl(var(--primary))' }} size={24} />
          Developer Directory
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>
          Search for collaborators, find engineers with matching skills, and build your connection circle.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel" style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <Search size={18} style={{ color: 'hsl(var(--text-muted))' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search developers by name, username, or tech stack (e.g. React, Python)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            padding: '8px 0'
          }}
        />
      </div>

      {error && (
        <div style={{
          background: 'hsl(var(--danger) / 0.15)',
          border: '1px solid hsl(var(--danger) / 0.3)',
          borderRadius: '8px',
          color: 'hsl(var(--danger))',
          padding: '12px 16px',
          fontSize: '0.85rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Developers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Discovering developers...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', borderStyle: 'dashed' }}>
          <Users size={36} style={{ color: 'hsl(var(--text-muted))', marginBottom: '16px' }} />
          <h3>No Developers Found</h3>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
            Try adjusting your search filters or check back later!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {users.map(user => (
            <div
              key={user.id}
              className="glass-card-interactive"
              onClick={() => onNavigateToUser(user.id)}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}
            >
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))',
                    border: '1px solid hsl(var(--border-color))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: 'white',
                    overflow: 'hidden'
                  }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>{user.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>@{user.username}</p>
                  </div>
                </div>

                {/* Bio snippet */}
                <p style={{
                  fontSize: '0.82rem',
                  color: 'hsl(var(--text-secondary))',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.bio || 'No bio shared yet.'}
                </p>
              </div>

              <div>
                {/* Skills tags */}
                {user.skills && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {user.skills.split(',').slice(0, 3).map((s, idx) => (
                      <span key={idx} className="badge" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow action button */}
                <button
                  onClick={(e) => handleFollowToggle(e, user)}
                  disabled={togglingId === user.id}
                  className={`btn btn-sm ${user.is_followed ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', gap: '6px', fontSize: '0.75rem' }}
                >
                  {user.is_followed ? (
                    <>
                      <UserCheck size={12} />
                      Connected
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
