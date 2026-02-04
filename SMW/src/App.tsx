import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Warriors from './pages/Warriors';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import TaskSubmissionsPage from './pages/TaskSubmissionsPage';

import TaskCategory from './pages/TaskCategory';
import { AppProvider } from './context/AppContext';
import UserVerification from './pages/UserVerification';
import Subscription from './pages/Subscription';
import Overview from './pages/Overview';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'superadmin' | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    setIsAuthenticated(!!accessToken);

    // Extract role from stored user info or decode token to get role if encoded there
    // For simplicity, assume userRole stored in localStorage on login (adjust depending on actual storage)
    const storedRole = localStorage.getItem('userRole'); 
    if (storedRole === 'admin' || storedRole === 'superadmin') {
      setUserRole(storedRole);
    } else {
      setUserRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (!isAuthenticated) {
    return (
      <AppProvider customFetch={function (): Promise<Response> {
        throw new Error('Function not implemented.');
      } }>
        <Router>
          <Routes>
            <Route path="/login" element={<Login onLogin={(role) => { setIsAuthenticated(true); setUserRole(role as 'admin' | 'superadmin' | null); }} />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AppProvider>
    );
  }

  // Authenticated routes
  return (
    <AppProvider customFetch={function (): Promise<Response> {
      throw new Error('Function not implemented.');
    } }>
      <Router>
        <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} userRole={userRole!}>
          <Routes>
            {userRole === 'superadmin' ? (
              <>
                <Route path="/" element={<Navigate to="/overview" />} />
                <Route path="/overview/*" element={<Overview />} />
                {/* <Route path="/overview/script-library" element={<ScriptLibrary />} /> */}
                <Route path="*" element={<Navigate to="/overview" />} />
              </>
            ) : (
              // Admin routes unchanged
              <>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard customFetch={function (): Promise<Response> {
                    throw new Error('Function not implemented.');
                  } } />} />
                  <Route path="/tasks/:categoryId" element={<Tasks />} />
<Route path="/tasks/:categoryId/submissions/:taskId" element={<TaskSubmissionsPage />} />
                <Route path="/tasks" element={<TaskCategory />} />
                <Route path="/tasks/:categoryId" element={<Tasks />} />
                <Route path="/warriors" element={<Warriors />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user-verification" element={<UserVerification />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            )}
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;