// =============================================
// Firestore Database Module — Igreja App
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

export {
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserCount
} from './db/usuarios.js';
export {
  getMinisterios,
  getMinisterio,
  createMinisterio,
  updateMinisterio,
  deleteMinisterio,
  getConvitesByEmail,
  getConvitesPendentes,
  getConvitesByMinisterio,
  createConvite,
  updateConviteStatus,
  getMinisteriosDoUsuario,
  getMembrosMinisterio,
  getMinisterioCount
} from './db/ministerios.js';
export {
  getEscalas,
  updateEscala,
  deleteEscala,
  getFuncoesByEscala,
  createFuncaoEscala,
  confirmarPresenca,
  createEscala,
  getEscalasDoMinisterio,
  responderEscala,
  getEscalasDoMembro
} from './db/escalas.js';
export {
  createProjeto,
  getProjetosDoLider,
  getProjeto,
  getAllProjetos,
  deleteProjeto,
  createTarefa,
  getTarefasPorProjeto,
  updateTarefaStatus,
  deleteTarefa,
  autoUpdateProjectProgress
} from './db/projetos.js';
export {
  getAvisos,
  createAviso,
  deleteAviso,
  getEventosPublicos,
  createEventoPublico,
  deleteEventoPublico,
  getBannersAtivos,
  createBanner,
  getAllBanners,
  deleteBanner
} from './db/eventos.js';
