// =============================================
// Firestore Database Module â€” Igreja App
// =============================================
// CRUD operations for all 10 collections matching scope Module 5
// Collection names use the exact same names from the scope document

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

const ADMIN_EMAIL = 'vini.wincklerferreira@gmail.com';

export function isAdmin(userData) {
  return userData && userData.Email === ADMIN_EMAIL && userData.Nivel_Acesso === 'Admin';
}

// =============================================
// Collection Names (matching MÃ³dulo 5 exactly)
// =============================================
export const COLLECTIONS = {
  USUARIOS: 'Usuarios',
  MINISTERIOS: 'Ministerios',
  CONVITES_MEMBROS: 'Convites_Membros',
  ESCALAS: 'Escalas',
  ESCALAS_FUNCOES: 'Escalas_Funcoes',
  AVISOS: 'Avisos',
  PROJETOS: 'Projetos',
  TAREFAS_CHAMADOS: 'Tarefas_Chamados',
  EVENTOS_PUBLICOS: 'Eventos_Publicos',
  BANNERS_HOME: 'Banners_Home'
};

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

// NOTA: use getEscalasDoMinisterio() para buscas por ministério (tem fallback de index).
// Esta função genérica é mantida para compatibilidade; usa o campo 'Data' (string YYYY-MM-DD)
// que é o schema atual — NÃO usa mais 'Data_Hora' (campo obsoleto).
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
    Confirmou_Presenca: 'NÃ£o',
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
// MINISTÃ‰RIOS
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
    Destaque: data.Destaque || 'NÃ£o'
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

export async function getMinisteriosDoUsuario(email) {
  const convites = await getConvitesByEmail(email);
  const aceitos = convites.filter(c => c.Status === 'Aceito');
  const ministerioIds = [...new Set(aceitos.map(c => c.ID_Ministerio))];

  // Bug 7 fix: buscar todos os ministérios em paralelo em vez de sequencialmente
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

export async function createProjeto(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.PROJETOS), {
    ...data,
    Progresso: 0,
    Status: 'Pendente',
    Data_Criacao: serverTimestamp()
  });
  return docRef.id;
}

export async function getProjetosDoLider(email) {
  const q = query(
    collection(db, COLLECTIONS.PROJETOS),
    where('Criado_Por', '==', email),
    orderBy('Data_Criacao', 'desc')
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    // Fallback missing index
    const fallQ = query(
      collection(db, COLLECTIONS.PROJETOS),
      where('Criado_Por', '==', email)
    );
     const snap = await getDocs(fallQ);
     return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export async function getProjeto(id) {
  const docRef = doc(db, COLLECTIONS.PROJETOS, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllProjetos() {
  const q = query(
    collection(db, COLLECTIONS.PROJETOS),
    orderBy('Data_Criacao', 'desc')
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    const fallQ = query(collection(db, COLLECTIONS.PROJETOS));
    const snap = await getDocs(fallQ);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export async function createTarefa(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.TAREFAS_CHAMADOS), {
    ...data,
    Status: 'A Fazer', // A Fazer, Em Progresso, Concluido
    Data_Criacao: serverTimestamp()
  });
  return docRef.id;
}

export async function getTarefasPorProjeto(projetoId) {
  const q = query(
    collection(db, COLLECTIONS.TAREFAS_CHAMADOS),
    where('ID_Projeto', '==', projetoId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateTarefaStatus(tarefaId, status) {
  const docRef = doc(db, COLLECTIONS.TAREFAS_CHAMADOS, tarefaId);
  await updateDoc(docRef, { Status: status });
}

export async function deleteTarefa(id) {
  await deleteDoc(doc(db, COLLECTIONS.TAREFAS_CHAMADOS, id));
}

export async function deleteProjeto(id) {
  // We should also delete all tasks associated with this project for cleanup
  const tarefas = await getTarefasPorProjeto(id);
  for (const t of tarefas) {
    await deleteTarefa(t.id);
  }
  await deleteDoc(doc(db, COLLECTIONS.PROJETOS, id));
}

// Global func to calculate progress and update the Project Document based on its Tasks
// Exported to be called by dashboard UI after moving a task between columns
export async function autoUpdateProjectProgress(projetoId) {
  const tarefasObj = await getTarefasPorProjeto(projetoId);
  // Bug 5 fix: quando todas as tarefas são deletadas, resetar progresso para 0
  if (tarefasObj.length === 0) {
    const docRef = doc(db, COLLECTIONS.PROJETOS, projetoId);
    await updateDoc(docRef, { Progresso: 0, Status: 'Pendente' });
    return;
  }
  
  const concluidas = tarefasObj.filter(t => t.Status === 'Concluido').length;
  const porcentagem = Math.round((concluidas / tarefasObj.length) * 100);
  
  // Decide Project Status based on progress
  let pStatus = 'Em Andamento';
  if (porcentagem === 100) pStatus = 'Concluido';
  else if (porcentagem === 0) pStatus = 'Pendente';

  const docRef = doc(db, COLLECTIONS.PROJETOS, projetoId);
  await updateDoc(docRef, {
    Progresso: porcentagem,
    Status: pStatus
  });
}

// =============================================
// ADMIN: Atualizar NÃ­vel de Acesso
// =============================================

export async function updateUserRole(uid, newRole, requesterEmail) {
  // Security check: Only the super admin can change roles
  if (requesterEmail !== ADMIN_EMAIL) {
    throw new Error('PermissÃ£o negada: Apenas o Administrador Principal pode alterar nÃ­veis de acesso.');
  }

  // Bug 9 fix: if morto removido — requesterEmail === ADMIN_EMAIL já garantido acima
  const docRef = doc(db, COLLECTIONS.USUARIOS, uid);
  await updateDoc(docRef, { Nivel_Acesso: newRole });
}

/**
 * Delete a user account (Admin only)
 */
export async function deleteUser(uid, requesterEmail) {
  if (requesterEmail !== ADMIN_EMAIL) {
    throw new Error('PermissÃ£o negada: Apenas o Administrador Principal pode excluir contas.');
  }

  const userRef = doc(db, COLLECTIONS.USUARIOS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.Email === ADMIN_EMAIL) {
      throw new Error('OperaÃ§Ã£o negada: NÃ£o Ã© possÃ­vel excluir a conta do Administrador Principal.');
    }
  }

  await deleteDoc(userRef);
}

// =============================================
// EVENTOS_PUBLICOS (extras)
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

export async function getUserCount() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USUARIOS));
  return snapshot.size;
}

export async function getMinisterioCount() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MINISTERIOS));
  return snapshot.size;
}
