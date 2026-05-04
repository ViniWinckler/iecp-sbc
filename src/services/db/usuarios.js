import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS, ADMIN_EMAIL } from './index.js';

export function isAdmin(userData) {
  return userData && userData.Email === ADMIN_EMAIL && userData.Nivel_Acesso === 'Admin';
}


// =============================================
// USUARIOS
// =============================================

/**
 * Get user by Firebase UID
 * @param {string} uid - Firebase UID
 * @returns {Promise<Object|null>}
 */

export async function getUser(uid) {
  const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<Object|null>}
 */

export async function getUserByEmail(email) {
  const q = query(
    collection(db, COLLECTIONS.USUARIOS),
    where('Email', '==', email),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() };
}

/**
 * Create new user (uses Firebase UID as document ID)
 * @param {Object} data - { Firebase_UID, Nome_Exibicao, Email, Telefone, Nivel_Acesso }
 */

export async function createUser(data) {
  const docRef = doc(db, COLLECTIONS.USUARIOS, data.Firebase_UID);
  const userData = {
    Firebase_UID: data.Firebase_UID,
    Nome_Exibicao: data.Nome_Exibicao,
    Email: data.Email,
    Telefone: data.Telefone || '',
    Nivel_Acesso: data.Nivel_Acesso || 'Membro',
    Data_Criacao: serverTimestamp()
  };
  await setDoc(docRef, userData);
  return { id: data.Firebase_UID, ...userData };
}

/**
 * Update user data
 * @param {string} uid
 * @param {Object} data - fields to update
 */

export async function updateUser(uid, data) {
  const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
  await updateDoc(docRef, data);
}

/**
 * Get all users
 */

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USUARIOS));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// =============================================
// MINISTERIOS
// =============================================


export async function updateUserRole(uid, newRole, requesterEmail) {
  // Security check: Only the super admin can change roles
  if (requesterEmail !== ADMIN_EMAIL) {
    throw new Error('Permissão negada: Apenas o Administrador Principal pode alterar níveis de acesso.');
  }

  // Bug 9 fix: if morto removido � requesterEmail === ADMIN_EMAIL j� garantido acima
  const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
  await updateDoc(docRef, { Nivel_Acesso: newRole });
}

/**
 * Delete a user account (Admin only)
 */

export async function deleteUser(uid, requesterEmail) {
  if (requesterEmail !== ADMIN_EMAIL) {
    throw new Error('Permissão negada: Apenas o Administrador Principal pode excluir contas.');
  }

  const userRef = doc(db, COLLECTIONS.USUARIOS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.Email === ADMIN_EMAIL) {
      throw new Error('Operação negada: Não é possível excluir a conta do Administrador Principal.');
    }
  }

  await deleteDoc(userRef);
}

// =============================================
// EVENTOS_PUBLICOS (extras)
// =============================================


export async function getUserCount() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USUARIOS));
  return snapshot.size;
}

