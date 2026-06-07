import { useAppStore } from '@/store/appStore';
import UserApp from './pages/UserApp';
import OrganizerApp from './pages/OrganizerApp';
import VolunteerApp from './pages/VolunteerApp';
import AdminApp from './pages/AdminApp';
import RoleSwitcher from './components/RoleSwitcher';
import LoginModal from './components/LoginModal';
import { useState } from 'react';

export default function App() {
  const { currentView, isLoggedIn, currentUser } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);

  if (!isLoggedIn || !currentUser) {
    return <LoginModal open onClose={() => {}} onSuccess={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleSwitcher />
      <div className="pt-16">
        {currentView === 'user' && <UserApp />}
        {currentView === 'organizer' && <OrganizerApp />}
        {currentView === 'volunteer' && <VolunteerApp />}
        {currentView === 'admin' && <AdminApp />}
      </div>
      {showLogin && (
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSuccess={() => setShowLogin(false)} />
      )}
    </div>
  );
}
