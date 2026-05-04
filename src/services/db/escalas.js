import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS, ADMIN_EMAIL } from './index.js';

export async function getEscalas(ministerioId = null) {
  let q;
  if (ministerioId) {
    q = query(
      collection(db, COLLECTIONS.ESCALAS),
      where('ID_Ministerio', '==', ministerioId),
      orderBy('Data', 'desc')
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.ESCALAS),
      orderBy('Data', 'desc')
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function updateEscala(id, data) {
  await updateDoc(doc(db, COLLECTIONS.ESCALAS, id), data);
}


export async function deleteEscala(id) {
  await deleteDoc(doc(db, COLLECTIONS.ESCALAS, id));
}

// =============================================
// ESCALAS_FUNCOES
// =============================================


export async function getFuncoesByEscala(escalaId) {
  const q = query(
    collection(db, COLLECTIONS.ESCALAS_FUNCOES),
    where('ID_Escala', '==', escalaId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function createFuncaoEscala(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.ESCALAS_FUNCOES), {
    ID_Escala: data.ID_Escala,
    Nome_Funcao: data.Nome_Funcao,
    Firebase_UID_Membro: data.Firebase_UID_Membro,
    Confirmou_Presenca: 'Não',
    Data_Confirmacao: null
  });
  return { id: docRef.id, ...data };
}


export async function confirmarPresenca(funcaoId) {
  await updateDoc(doc(db, COLLECTIONS.ESCALAS_FUNCOES, funcaoId), {
    Confirmou_Presenca: 'Sim',
    Data_Confirmacao: serverTimestamp()
  });
}

// =============================================
// AVISOS
// =============================================


export async function createEscala(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.ESCALAS), {
    ...data,
    Data_Criacao: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Get scales for a specific ministry
 */

export async function getEscalasDoMinisterio(ministerioId) {
  const q = query(
    collection(db, COLLECTIONS.ESCALAS),
    where('ID_Ministerio', '==', ministerioId),
    orderBy('Data', 'desc')
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    // If index is missing, firestore throws an error. Fallback to unordered if index is not ready
    console.warn("Index missing for Escalas orderBy Date, falling back to unordered", err);
    if (err.message.includes("index")) {
      const qFallback = query(
        collection(db, COLLECTIONS.ESCALAS),
        where('ID_Ministerio', '==', ministerioId)
      );
      const snap = await getDocs(qFallback);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.Data) - new Date(a.Data));
    }
    throw err;
  }
}

/**
 * Update member status in an Escala Array Array of members: { email, nome, funcao, status }
 */

export async function responderEscala(escalaId, email, resposta) {
  const docRef = doc(db, COLLECTIONS.ESCALAS, escalaId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  
  const escala = snap.data();
  if (escala.Membros_Escalados) {
    const updatedMembros = escala.Membros_Escalados.map(m => {
      if (m.email === email) {
        return { ...m, status: resposta };
      }
      return m;
    });
    
    await updateDoc(docRef, {
      Membros_Escalados: updatedMembros
    });
  }
}

/**
 * Get all scales that a member is part of 
 */

export async function getEscalasDoMembro(email) {
  const ministerios = await getMinisteriosDoUsuario(email);
  const minIds = ministerios.map(m => m.id);
  
  if (minIds.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < minIds.length; i += 10) {
    chunks.push(minIds.slice(i, i + 10));
  }
  
  let allEscalas = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, COLLECTIONS.ESCALAS),
      where('ID_Ministerio', 'in', chunk)
    );
    const snap = await getDocs(q);
    allEscalas = allEscalas.concat(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  // Filter only where the user is part of `Membros_Escalados`
  return allEscalas.filter(escala => 
    escala.Membros_Escalados && 
    escala.Membros_Escalados.some(m => m.email === email)
  ).sort((a, b) => new Date(b.Data) - new Date(a.Data));
}

// =============================================
// PROJETOS E TAREFAS (Chamados)
// =============================================

