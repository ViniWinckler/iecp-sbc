import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS, ADMIN_EMAIL } from './index.js';

export async function getAvisos(escopo = null, ministerioId = null) {
  try {
    let q = query(collection(db, COLLECTIONS.AVISOS));
    
    if (escopo === 'Global') {
      q = query(q, where('Escopo', '==', 'Global'));
    } else if (escopo === 'Ministerio' && ministerioId) {
      q = query(q, where('Escopo', '==', 'Ministerio'), where('ID_Ministerio_Alvo', '==', ministerioId));
    }

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sort client-side by Data_Publicacao (descending)
    return data.sort((a, b) => {
      const timeA = a.Data_Publicacao?.seconds || 0;
      const timeB = b.Data_Publicacao?.seconds || 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('getAvisos error:', err);
    return [];
  }
}


export async function createAviso(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.AVISOS), {
    Titulo: data.Titulo,
    Mensagem: data.Mensagem,
    Escopo: data.Escopo,
    ID_Ministerio_Alvo: data.ID_Ministerio_Alvo || null,
    Data_Publicacao: serverTimestamp(),
    Criado_Por_Email: data.Criado_Por_Email
  });
  return { id: docRef.id, ...data };
}


export async function deleteAviso(id) {
  await deleteDoc(doc(db, COLLECTIONS.AVISOS, id));
}

// =============================================
// MINISTÉRIOS
// =============================================

// =============================================
// EVENTOS_PUBLICOS
// =============================================


export async function getEventosPublicos() {
  const q = query(
    collection(db, COLLECTIONS.EVENTOS_PUBLICOS),
    orderBy('Data_Hora', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function createEventoPublico(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTOS_PUBLICOS), {
    Titulo: data.Titulo,
    Descricao: data.Descricao || '',
    Data_Hora: Timestamp.fromDate(new Date(data.Data_Hora)),
    Imagem_URL: data.Imagem_URL || '',
    Destaque: data.Destaque || 'Não'
  });
  return { id: docRef.id, ...data };
}

// =============================================
// BANNERS_HOME
// =============================================


export async function getBannersAtivos() {
  const q = query(
    collection(db, COLLECTIONS.BANNERS_HOME),
    where('Ativo', '==', 'Sim'),
    orderBy('Ordem', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function createBanner(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.BANNERS_HOME), {
    Titulo: data.Titulo,
    Subtitulo: data.Subtitulo || '',
    Imagem_URL: data.Imagem_URL || '',
    Ordem: data.Ordem || 1,
    Ativo: data.Ativo || 'Sim'
  });
  return { id: docRef.id, ...data };
}

// =============================================
// Utility: Get user's ministerios (via accepted invites)
// =============================================


export async function deleteEventoPublico(id) {
  await deleteDoc(doc(db, COLLECTIONS.EVENTOS_PUBLICOS, id));
}

// =============================================
// BANNERS_HOME (extras)
// =============================================


export async function getAllBanners() {
  const q = query(
    collection(db, COLLECTIONS.BANNERS_HOME),
    orderBy('Ordem', 'asc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BANNERS_HOME));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}


export async function deleteBanner(id) {
  await deleteDoc(doc(db, COLLECTIONS.BANNERS_HOME, id));
}

