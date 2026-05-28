import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from './index.js';

export async function createAgendaEvento(data) {
  const docRef = await addDoc(collection(db, COLLECTIONS.AGENDA_INTERNA), {
    ...data,
    Data_Criacao: serverTimestamp()
  });
  return docRef.id;
}

export async function getAgendaEventos() {
  // We can add filtering by ministryId here if needed, but for now we get all and filter in memory
  const q = query(
    collection(db, COLLECTIONS.AGENDA_INTERNA),
    orderBy('Data_Hora', 'desc')
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    const fallQ = query(collection(db, COLLECTIONS.AGENDA_INTERNA));
    const snap = await getDocs(fallQ);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export async function deleteAgendaEvento(id) {
  await deleteDoc(doc(db, COLLECTIONS.AGENDA_INTERNA, id));
}
