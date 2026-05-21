import { useState } from 'react';
import { AuthPage } from './views/AuthPage';
import { FeedView } from './views/FeedView';
import { ProfileView } from './views/ProfileView';
import { NetworkView } from './views/NetworkView';
import { User, Sparkles, Users, LogOut, Terminal } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('devsphere_token'));
  const [currentUser, setCurrentUser] = useState<any | null>(
    localStorage.getItem('devsphere_user') ? JSON.parse(localStorage.getItem('devsphere_user')!) : null
  );
  
  // Navigation states
  const [currentView, setCurrentView] = useState<'feed' | 'network' | 'profile'>('feed');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Synchronize localStorage
  const handleAuthSuccess = (newToken: string, user: any) => {
    localStorage.setItem('devsphere_token', newToken);
    localStorage.setItem('devsphere_user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    setCurrentView('feed');
    setSelectedUserId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('devsphere_token');
    localStorage.removeItem('devsphere_user');
    setToken(null);
    setCurrentUser(null);
    setSelectedUserId(null);
  };

  // Profile update propagation to App header / sidebar
  const handleProfileUpdate = (updatedUser: any) => {
    const freshUser = { ...currentUser, ...updatedUser };
    localStorage.setItem('devsphere_user', JSON.stringify(freshUser));
    setCurrentUser(freshUser);
  };

  // Global navigation handler to view users
  const handleNavigateToUser = (userId: number) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  const renderActiveView = () => {
    if (!token || !currentUser) return null;

    switch (currentView) {
      case 'feed':
        return <FeedView token={token} onNavigateToUser={handleNavigateToUser} />;
      case 'network':
        return <NetworkView token={token} onNavigateToUser={handleNavigateToUser} />;
      case 'profile':
        return (
          <ProfileView
            userId={selectedUserId || currentUser.id}
            currentUserId={currentUser.id}
            token={token}
            onBackToFeed={() => {
              setCurrentView('feed');
              setSelectedUserId(null);
            }}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return <FeedView token={token} onNavigateToUser={handleNavigateToUser} />;
    }
  };

  // If not authenticated, render the high-fidelity auth page
  if (!token || !currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sleek Sidebar Navigation */}
      <aside style={{
        background: 'rgba(10, 15, 30, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid hsl(var(--border-color))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 24px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Terminal size={18} />
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              DevSphere
            </h1>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => { setCurrentView('feed'); setSelectedUserId(null); }}
              className={`btn ${currentView === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: currentView === 'feed' ? undefined : 'transparent',
                borderColor: currentView === 'feed' ? undefined : 'transparent',
                padding: '12px 16px'
              }}
            >
              <Sparkles size={18} />
              Feed Hub
            </button>

            <button
              onClick={() => { setCurrentView('network'); setSelectedUserId(null); }}
              className={`btn ${currentView === 'network' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: currentView === 'network' ? undefined : 'transparent',
                borderColor: currentView === 'network' ? undefined : 'transparent',
                padding: '12px 16px'
              }}
            >
              <Users size={18} />
              Directory
            </button>

            <button
              onClick={() => { setCurrentView('profile'); setSelectedUserId(currentUser.id); }}
              className={`btn ${(currentView === 'profile' && selectedUserId === currentUser.id) ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: (currentView === 'profile' && selectedUserId === currentUser.id) ? undefined : 'transparent',
                borderColor: (currentView === 'profile' && selectedUserId === currentUser.id) ? undefined : 'transparent',
                padding: '12px 16px'
              }}
            >
              <User size={18} />
              My Profile
            </button>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              overflow: 'hidden'
            }}>
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>@{currentUser.username}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem', gap: '8px' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.03), transparent), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.02), transparent)',
        minHeight: '100vh',
        overflowY: 'auto'
      }}>
        {renderActiveView()}
      </main>
    </div>
  );
}
