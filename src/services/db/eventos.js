import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from './index.js';

// =============================================
// PUBLICACOES (Unified Avisos + Eventos)
// Schema:
//   Titulo, Mensagem, Tipo, Visibilidade, Escopo,
//   ID_Ministerio_Alvo, Imagem_URL, Data_Evento,
//   Data_Publicacao, Criado_Por_Email
// Tipo: Aviso | Evento | Aniversario | Reuniao | Outros
// Visibilidade: Interno | Publico | Ambos
// Escopo: Global | Ministerio (only for Interno/Ambos)
// =============================================

export async function getPublicacoes({ visibilidade = null, escopo = null, ministerioId = null } = {}) {
  try {
    let q;
    
    // Se for requisição pública (sem login no site), devemos usar query no banco
    // para não esbarrar nas regras de segurança do Firestore.
    if (visibilidade === 'Publico') {
      q = query(
        collection(db, COLLECTIONS.AVISOS),
        where('Visibilidade', 'in', ['Publico', 'Ambos'])
      );
    } else {
      q = collection(db, COLLECTIONS.AVISOS);
    }

    const snapshot = await getDocs(q);
    let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Para requisições internas, mantemos o filtro local para compatibilidade
    if (visibilidade === 'Interno') {
      data = data.filter(d => !d.Visibilidade || d.Visibilidade === 'Interno' || d.Visibilidade === 'Ambos');
    }

    if (escopo === 'Global') {
      data = data.filter(d => d.Escopo === 'Global' || !d.Escopo);
    }
    if (escopo === 'Ministerio' && ministerioId) {
      data = data.filter(d => d.Escopo === 'Ministerio' && d.ID_Ministerio_Alvo === ministerioId);
    }

    return data.sort((a, b) => {
      const tA = a.Data_Publicacao?.seconds || 0;
      const tB = b.Data_Publicacao?.seconds || 0;
      return tB - tA;
    });
  } catch (err) {
    console.error('getPublicacoes error:', err);
    return [];
  }
}

// Backward compat
export async function getAvisos(escopo = null, ministerioId = null) {
  return getPublicacoes({ visibilidade: 'Interno', escopo, ministerioId });
}

export async function createPublicacao(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.AVISOS), {
    Titulo: data.Titulo,
    Mensagem: data.Mensagem || '',
    Tipo: data.Tipo || 'Aviso',
    Visibilidade: data.Visibilidade || 'Interno',
    Escopo: data.Escopo || 'Global',
    ID_Ministerio_Alvo: data.ID_Ministerio_Alvo || null,
    Imagem_URL: data.Imagem_URL || '',
    Data_Evento: data.Data_Evento ? Timestamp.fromDate(new Date(data.Data_Evento)) : null,
    Data_Publicacao: serverTimestamp(),
    Criado_Por_Email: data.Criado_Por_Email
  });
  return { id: docRef.id, ...data };
}

// Backward compat
export async function createAviso(data) {
  return createPublicacao({ ...data, Tipo: 'Aviso', Visibilidade: data.Visibilidade || 'Interno' });
}

export async function updatePublicacao(id, data) {
  await updateDoc(doc(db, COLLECTIONS.AVISOS, id), data);
}

export async function deleteAviso(id) {
  await deleteDoc(doc(db, COLLECTIONS.AVISOS, id));
}

// Alias
export const deletePublicacao = deleteAviso;

// =============================================
// EVENTOS_PUBLICOS (legacy - kept for backward compat)
// =============================================

export async function getEventosPublicos() {
  // Now returns publicacoes visible to public (Publico or Ambos)
  return getPublicacoes({ visibilidade: 'Publico' });
}

export async function createEventoPublico(data) {
  return createPublicacao({ ...data, Tipo: data.Tipo || 'Evento', Visibilidade: 'Publico', Escopo: 'Global' });
}

export async function deleteEventoPublico(id) {
  await deleteDoc(doc(db, COLLECTIONS.AVISOS, id));
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

export async function getAllBanners() {
  try {
    const q = query(collection(db, COLLECTIONS.BANNERS_HOME), orderBy('Ordem', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BANNERS_HOME));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

export async function deleteBanner(id) {
  await deleteDoc(doc(db, COLLECTIONS.BANNERS_HOME, id));
}
