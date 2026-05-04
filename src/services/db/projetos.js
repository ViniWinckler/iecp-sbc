import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS, ADMIN_EMAIL } from './index.js';

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
  // Bug 5 fix: quando todas as tarefas s�o deletadas, resetar progresso para 0
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
// ADMIN: Atualizar Nível de Acesso
// =============================================

