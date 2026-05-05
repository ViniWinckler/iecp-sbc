import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout, getCurrentUser } from '../services/auth.js';
import { getUserByEmail } from '../services/db.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // appPublicSettings might be needed by some Base44 components that expected it.
  // We'll mock it so nothing breaks.
  const [appPublicSettings, setAppPublicSettings] = useState({ public_settings: {} });
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        try {
          // Fetch our custom user profile (role, status, etc.)
          const profile = await getUserByEmail(firebaseUser.email);
          setUserProfile(profile);
          
          if (profile && profile.Status === 'Pendente') {
            setAuthError({ type: 'pending_approval', message: 'Conta aguardando aprovação pastoral' });
          } else {
            setAuthError(null);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async (shouldRedirect = true) => {
    try {
      await firebaseLogout();
      if (shouldRedirect) {
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
