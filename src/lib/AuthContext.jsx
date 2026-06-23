import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import { logout as firebaseLogout } from '../services/auth.js';
import { getUserByEmail, createUser, getUser, updateUser } from '../services/db.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [userProfile, setUserProfile]     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError]         = useState(null);

  // Mock esperado por alguns componentes legados
  const isLoadingPublicSettings = false;
  const appPublicSettings = { public_settings: {} };

  useEffect(() => {
    // Escuta diretamente o Firebase Auth — garante que Google e Email funcionam
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        try {
          // Busca primeiro por UID (mais confiável), depois por email
          let profile = await getUser(firebaseUser.uid);
          if (!profile) profile = await getUserByEmail(firebaseUser.email);

          // Força Admin para o email pessoal e sincroniza o UID real no doc
          if (firebaseUser.email === 'vini.wincklerferreira@gmail.com') {
            if (!profile) {
              profile = await createUser({
                Firebase_UID: firebaseUser.uid,
                Nome_Exibicao: firebaseUser.displayName || 'Vinicius Winckler Ferreira',
                Email: firebaseUser.email,
                Telefone: '',
                Nivel_Acesso: 'Admin',
                Status: 'Ativo'
              });
            } else {
              // Garante que o doc tem o UID correto e permissão Admin
              const updates = {};
              if (profile.Firebase_UID !== firebaseUser.uid) updates.Firebase_UID = firebaseUser.uid;
              if (profile.Nivel_Acesso !== 'Admin') updates.Nivel_Acesso = 'Admin';
              if (profile.Status !== 'Ativo') updates.Status = 'Ativo';
              if (Object.keys(updates).length > 0) {
                await updateUser(profile.id, updates);
                profile = { ...profile, ...updates };
              }
            }
          }

          // Se não tem perfil, deixamos userProfile como null para o MemberLogin exibir o form de completar cadastro
          setUserProfile(profile);
          setAuthError(profile?.Status === 'Pendente'
            ? { type: 'pending_approval' }
            : null
          );
        } catch (e) {
          console.error('Erro ao buscar/criar perfil:', e);
          setAuthError({ type: 'error', message: e.message });
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setAuthError(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToLogin = () => { window.location.href = '/login'; };

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
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
