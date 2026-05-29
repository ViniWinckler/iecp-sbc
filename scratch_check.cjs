const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function check() {
  console.log("=== VERIFICANDO DADOS ===");
  
  // 1. Verificar usuários
  const usersRef = db.collection('Usuarios');
  const snapshot = await usersRef.where('Email', '==', 'vini.wincklerferreira@gmail.com').get();
  
  if (snapshot.empty) {
    console.log("Usuário Vinicius NÃO ENCONTRADO na coleção 'Usuarios'.");
    // Talvez esteja em letra minúscula/maiúscula?
    const allUsers = await usersRef.get();
    let found = false;
    allUsers.forEach(doc => {
      const data = doc.data();
      if (data.Email && data.Email.toLowerCase() === 'vini.wincklerferreira@gmail.com') {
         console.log("Usuário encontrado com variação de caixa:", data.Email);
         console.log("Dados:", data);
         found = true;
      }
    });
    if (!found) {
      console.log("Realmente não existe nenhum usuário com este email.");
    }
  } else {
    console.log(`Foram encontrados ${snapshot.size} documento(s) para Vinicius:`);
    snapshot.forEach(doc => {
      console.log(`ID: ${doc.id}`);
      console.log(doc.data());
      console.log("----------------------");
    });
  }

  // 2. Verificar quantidades de dados falsos
  const colecoes = ['Ministerios', 'Avisos', 'Projetos', 'Tarefas_Chamados', 'Agenda_Interna', 'Escalas'];
  for (const col of colecoes) {
    const snap = await db.collection(col).get();
    console.log(`Coleção ${col}: ${snap.size} documentos`);
  }

  process.exit(0);
}

check().catch(console.error);
