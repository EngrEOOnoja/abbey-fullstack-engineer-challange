import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import { Send, Terminal, Link as LinkIcon, Compass, Sparkles, AlertCircle } from 'lucide-react';

interface FeedViewProps {
  token: string;
  onNavigateToUser: (userId: number) => void;
}

export function FeedView({ token, onNavigateToUser }: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [showProjectFields, setShowProjectFields] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity feed');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Could not load feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [token]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          projectName: showProjectFields ? projectName : undefined,
          projectLink: showProjectFields ? projectLink : undefined,
        }),
      });

      const newPost = await response.json();

      if (!response.ok) {
        throw new Error(newPost.error || 'Failed to submit post');
      }

      setPosts([newPost, ...posts]);
      setContent('');
      setProjectName('');
      setProjectLink('');
      setShowProjectFields(false);
    } catch (err: any) {
      setError(err.message || 'Failed to share post.');
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="view-container">
      {/* Welcome Title */}
      <div style={{ marginBottom: '32px' }} className="animate-fade-in">
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ color: 'hsl(var(--accent))' }} size={24} />
          Developer Activity Feed
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>
          See what projects other engineers are building and follow their process.
        </p>
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

      {/* Post Composer Card */}
      <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px' }}>
        <form onSubmit={handleCreatePost}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'hsl(var(--bg-surface-hover))',
              border: '1px solid hsl(var(--border-color))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'hsl(var(--primary))'
            }}>
              <Terminal size={18} />
            </div>
            
            <div style={{ flex: 1 }}>
              <textarea
                className="form-input"
                rows={3}
                placeholder="What project are you shipping today? Or what bug did you squash?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px 0',
                  resize: 'none',
                  fontSize: '1rem',
                  outline: 'none',
                  boxShadow: 'none'
                }}
              />
              
              {showProjectFields && (
                <div className="responsive-grid-2" style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  animation: 'fadeIn 0.2s'
                }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Project Name (e.g. Abbey DB)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Link (e.g. github.com/abbey)"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <button
                  type="button"
                  onClick={() => setShowProjectFields(!showProjectFields)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <LinkIcon size={14} />
                  {showProjectFields ? 'Remove Link' : 'Attach Project Link'}
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={posting || !content.trim()}
                  style={{ gap: '6px' }}
                >
                  <Send size={14} />
                  {posting ? 'Posting...' : 'Share Update'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Feed Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Retrieving activity log...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', borderStyle: 'dashed' }}>
          <Compass size={40} style={{ color: 'hsl(var(--text-muted))', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Your Feed is Empty</h3>
          <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '380px', margin: '0 auto 20px' }}>
            Follow other developers in the network to see their updates here, or write your first post!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {posts.map((post) => (
            <div key={post.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                <div
                  onClick={() => onNavigateToUser(post.user_id)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))',
                    border: '1px solid hsl(var(--border-color))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'white',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  {post.avatar_url ? (
                    <img src={post.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    post.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4
                      onClick={() => onNavigateToUser(post.user_id)}
                      style={{ fontSize: '1rem', cursor: 'pointer' }}
                    >
                      {post.name}{' '}
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 400,
                        color: 'hsl(var(--text-muted))',
                        marginLeft: '4px'
                      }}>
                        @{post.username}
                      </span>
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                      {formatTime(post.created_at)}
                    </span>
                  </div>
                  
                  {post.skills && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {post.skills.split(',').slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', padding: '2px 6px' }} className="badge">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                {post.content}
              </div>

              {/* Optional Project Attached */}
              {post.project_name && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Terminal size={16} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{post.project_name}</h5>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Project build showcase</p>
                    </div>
                  </div>

                  {post.project_link && (
                    <a
                      href={post.project_link.startsWith('http') ? post.project_link : `https://${post.project_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', fontSize: '0.75rem', padding: '5px 10px' }}
                    >
                      <LinkIcon size={12} />
                      Inspect Link
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
