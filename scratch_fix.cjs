const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fix() {
  console.log("Forçando criação do perfil de Admin...");
  
  const usersRef = db.collection('Usuarios');
  
  // Limpar qualquer sujeira
  const snap = await usersRef.where('Email', '==', 'vini.wincklerferreira@gmail.com').get();
  for (const doc of snap.docs) {
    await doc.ref.delete();
  }

  // Criar o perfil
  await usersRef.add({
    Nome_Exibicao: 'Vinicius Winckler Ferreira',
    Email: 'vini.wincklerferreira@gmail.com',
    Telefone: '',
    Nivel_Acesso: 'Admin',
    Status: 'Ativo',
    Firebase_UID: 'created_by_script',
    Data_Criacao: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("Perfil criado com sucesso na coleção 'Usuarios'.");
  process.exit(0);
}

fix().catch(console.error);
