// =============================================
// Auth Module â€” Firebase Google Sign-In
// =============================================

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { getUser, createUser } from './db.js';

const googleProvider = new GoogleAuthProvider();

// Current user state
let currentUser = null;
let currentUserData = null;
const authListeners = [];

/**
 * Subscribe to auth state changes
 * @param {Function} callback - (user, userData) => void
 * @returns {Function} unsubscribe function
 */
export function onAuthChange(callback) {
  authListeners.push(callback);
  // Immediately call with current state
  if (currentUser !== undefined) {
    callback(currentUser, currentUserData);
  }
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
}

function notifyListeners() {
  authListeners.forEach(cb => cb(currentUser, currentUserData));
}

/**
 * Sign in with Google popup
 * @returns {Promise<{user, userData, isNew}>}
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    let userData = await getUser(user.uid);
    let isNew = false;

    if (!userData) {
      // First time login â€” will need display name
      isNew = true;
    }

    return { user, userData, isNew };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      return null; // User cancelled
    }
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Complete registration for new users (after display name input)
 * @param {string} displayName
 * @param {string} role
 */
export async function completeRegistration(displayName, role, minName) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Check if this is the first user in the system or if it's the specified Super Admin
  const { getAllUsers, createMinisterio } = await import('./db.js');
  const allUsers = await getAllUsers();
  
  let finalRole = role;
  if (user.email === 'vini.wincklerferreira@gmail.com') {
    finalRole = 'Admin';
  } else if (!finalRole) {
    finalRole = allUsers.length === 0 ? 'Admin' : 'Membro';
  } else if (finalRole === 'Pastor') {
    // Pastor precisa de aprovação do Admin antes de ter acesso completo
    finalRole = 'Pastor_Pendente';
  }

  const userData = await createUser({
    Firebase_UID: user.uid,
    Nome_Exibicao: displayName,
    Email: user.email,
    Telefone: '',
    Nivel_Acesso: finalRole
  });

  // If leader created a ministry during onboarding
  if (finalRole === 'Lider' && minName) {
    await createMinisterio({
      Nome_Ministerio: minName,
      Descricao: 'MinistÃ©rio criado durante o cadastro.',
      Lider_Responsavel_Email: user.email
    });
  }

  currentUserData = userData;
  notifyListeners();
  return userData;
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email, password, displayName, role, minName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Security check: Only the designated email can be Admin
    let finalRole = role || 'Membro';
    if (email === 'vini.wincklerferreira@gmail.com') {
      finalRole = 'Admin';
    } else if (finalRole === 'Admin') {
      finalRole = 'Membro';
    } else if (finalRole === 'Pastor') {
      // Pastor precisa de aprovação do Admin antes de ter acesso completo
      finalRole = 'Pastor_Pendente';
    }

    const userData = await createUser({
      Firebase_UID: user.uid,
      Nome_Exibicao: displayName,
      Email: user.email,
      Telefone: '',
      Nivel_Acesso: finalRole
    });

    // If leader created a ministry
    if (finalRole === 'Lider' && minName) {
      const { createMinisterio } = await import('./db.js');
      await createMinisterio({
        Nome_Ministerio: minName,
        Descricao: 'MinistÃ©rio criado durante o cadastro.',
        Lider_Responsavel_Email: user.email
      });
    }

    currentUserData = userData;
    notifyListeners();
    return { user, userData };
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let userData = await getUser(user.uid);
    if (!userData) {
      throw new Error('UsuÃ¡rio sem dados de perfil.');
    }
    
    return { user, userData };
  } catch (error) {
    console.error('Email Login error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function logout() {
  await signOut(auth);
  currentUser = null;
  currentUserData = null;
  notifyListeners();
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  return currentUser;
}

export function getCurrentUserData() {
  return currentUserData;
}

/**
 * Initialize auth listener
 */
export function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      try {
        currentUserData = await getUser(user.uid);
        
        // Automatic cleanup for the Super Admin
        if (user.email === 'vini.wincklerferreira@gmail.com') {
          const { getAllUsers, updateUser, COLLECTIONS } = await import('./db.js');
          const { deleteDoc, doc, db } = await import('firebase/firestore'); // Using dynamic import for safety
          const users = await getAllUsers();
          const duplicates = users.filter(u => u.Email === user.email && u.Firebase_UID !== user.uid);
          
          for (const d of duplicates) {
            console.log('Cleaning up duplicate admin account:', d.id);
            // In a real environment, we'd delete the doc. 
            // For now, we'll just ensure the current one is Admin.
          }

          if (currentUserData && currentUserData.Nivel_Acesso !== 'Admin') {
            await updateUser(user.uid, { Nivel_Acesso: 'Admin' });
            currentUserData.Nivel_Acesso = 'Admin';
          }
        }
      } catch (e) {
        console.error('Error fetching user data:', e);
        currentUserData = null;
      }
    } else {
      currentUser = null;
      currentUserData = null;
    }
    notifyListeners();
  });
}
