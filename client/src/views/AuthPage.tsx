import React, { useState } from 'react';
import { User, Mail, Lock, Code, Terminal } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin
      ? { emailOrUsername: email, password }
      : { email, username, password, name };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.12), transparent), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.1), transparent)',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            color: 'white',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
          }}>
            <Terminal size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome to <span style={{
              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>DevSphere</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
            {isLogin ? 'Connect with peers & showcase your build journey' : 'Create your account to join the developer community'}
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '28px'
        }}>
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              background: isLogin ? 'hsl(var(--bg-surface-hover))' : 'transparent',
              color: isLogin ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
              border: 'none',
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              background: !isLogin ? 'hsl(var(--bg-surface-hover))' : 'transparent',
              color: !isLogin ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
              border: 'none',
              padding: '10px 0',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Toast */}
        {error && (
          <div style={{
            background: 'hsl(var(--danger) / 0.15)',
            border: '1px solid hsl(var(--danger) / 0.3)',
            borderRadius: '8px',
            color: 'hsl(var(--danger))',
            padding: '12px 16px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 'bold' }}>error_code_01:</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(var(--text-muted))'
                  }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <Code size={16} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(var(--text-muted))'
                  }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">{isLogin ? 'Email or Username' : 'Email Address'}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--text-muted))'
              }} />
              <input
                type={isLogin ? 'text' : 'email'}
                required
                className="form-input"
                placeholder={isLogin ? 'email@example.com or username' : 'email@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--text-muted))'
              }} />
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Access DevSphere' : 'Join Community'}
          </button>
        </form>
      </div>
    </div>
  );
}
