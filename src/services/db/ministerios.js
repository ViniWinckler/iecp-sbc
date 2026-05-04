import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS, ADMIN_EMAIL } from './index.js';

export async function getMinisterios() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MINISTERIOS));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function getMinisterio(id) {
  const docSnap = await getDoc(doc(db, COLLECTIONS.MINISTERIOS, id));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}


export async function createMinisterio(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.MINISTERIOS), {
    Nome_Ministerio: data.Nome_Ministerio,
    Descricao: data.Descricao || '',
    Lider_Responsavel_Email: data.Lider_Responsavel_Email,
    Data_Criacao: serverTimestamp()
  });
  return { id: docRef.id, ...data };
}


export async function updateMinisterio(id, data) {
  await updateDoc(doc(db, COLLECTIONS.MINISTERIOS, id), data);
}


export async function deleteMinisterio(id) {
  await deleteDoc(doc(db, COLLECTIONS.MINISTERIOS, id));
}

// =============================================
// CONVITES_MEMBROS
// =============================================


export async function getConvitesByEmail(email) {
  const q = query(
    collection(db, COLLECTIONS.CONVITES_MEMBROS),
    where('Email_Convidado', '==', email)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function getConvitesPendentes(email) {
  const q = query(
    collection(db, COLLECTIONS.CONVITES_MEMBROS),
    where('Email_Convidado', '==', email),
    where('Status', '==', 'Pendente')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function getConvitesByMinisterio(ministerioId) {
  const q = query(
    collection(db, COLLECTIONS.CONVITES_MEMBROS),
    where('ID_Ministerio', '==', ministerioId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function createConvite(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.CONVITES_MEMBROS), {
    Email_Convidado: data.Email_Convidado,
    ID_Ministerio: data.ID_Ministerio,
    Funcao_no_Ministerio: data.Funcao_no_Ministerio,
    Status: 'Pendente',
    Data_Convite: serverTimestamp()
  });
  return { id: docRef.id, ...data, Status: 'Pendente' };
}


export async function updateConviteStatus(id, status) {
  await updateDoc(doc(db, COLLECTIONS.CONVITES_MEMBROS, id), {
    Status: status,
    Data_Resposta: serverTimestamp()
  });
}

// =============================================
// ESCALAS
// =============================================

// NOTA: use getEscalasDoMinisterio() para buscas por minist�rio (tem fallback de index).
// Esta fun��o gen�rica � mantida para compatibilidade; usa o campo 'Data' (string YYYY-MM-DD)
// que � o schema atual � N�O usa mais 'Data_Hora' (campo obsoleto).

export async function getMinisteriosDoUsuario(email) {
  const convites = await getConvitesByEmail(email);
  const aceitos = convites.filter(c => c.Status === 'Aceito');
  const ministerioIds = [...new Set(aceitos.map(c => c.ID_Ministerio))];

  // Bug 7 fix: buscar todos os minist�rios em paralelo em vez de sequencialmente
  const results = await Promise.all(ministerioIds.map(id => getMinisterio(id)));
  return results.filter(Boolean);
}

// =============================================
// ESCALAS
// =============================================

/**
 * Fetch all accepted members of a Ministerio
 */

export async function getMembrosMinisterio(ministerioId) {
  const q = query(
    collection(db, COLLECTIONS.CONVITES_MEMBROS),
    where('ID_Ministerio', '==', ministerioId),
    where('Status', '==', 'Aceito')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Create a new scale
 */

export async function getMinisterioCount() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MINISTERIOS));
  return snapshot.size;
}
