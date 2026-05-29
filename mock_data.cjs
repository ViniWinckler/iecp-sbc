const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  console.log("1. Atualizando permissão do Vinicius...");
  const usersRef = db.collection('Usuarios');
  const snapshot = await usersRef.where('Email', '==', 'vini.wincklerferreira@gmail.com').get();
  
  let adminUserId = null;
  if (snapshot.empty) {
    console.log("Usuário Vinicius não encontrado. Você precisa logar pelo menos uma vez.");
  } else {
    for (const doc of snapshot.docs) {
      adminUserId = doc.id;
      await doc.ref.update({
        Nivel_Acesso: 'Admin',
        Status: 'Ativo'
      });
      console.log(`Permissão atualizada para o doc: ${doc.id}`);
    }
  }

  console.log("2. Criando Ministério de Teste...");
  const minRef = await db.collection('Ministerios').add({
    Nome_Ministerio: 'Louvor & Adoração (Teste)',
    Descricao: 'Equipe responsável pelo momento de louvor nos cultos.',
    Lider_Responsavel_Email: 'vini.wincklerferreira@gmail.com'
  });
  console.log(`Ministério criado: ${minRef.id}`);

  console.log("3. Criando Aviso de Teste...");
  await db.collection('Avisos').add({
    Titulo: 'Reunião de Alinhamento (Teste)',
    Descricao: 'Aviso de teste: Teremos uma reunião geral após o culto de domingo para apresentar as novas funcionalidades do app.',
    Ministerio_ID: null,
    Data_Hora: admin.firestore.FieldValue.serverTimestamp(),
    Autor_Email: 'vini.wincklerferreira@gmail.com'
  });
  console.log("Aviso criado.");

  console.log("4. Criando Projeto e Tarefas...");
  const projRef = await db.collection('Projetos').add({
    Nome_Projeto: 'Reforma do Áudio (Teste)',
    Descricao: 'Projeto para cabeamento novo no palco e instalação de novos retornos.',
    Progresso: 50,
    Status: 'Em Andamento',
    Data_Criacao: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('Tarefas_Chamados').add({
    ID_Projeto: projRef.id,
    Titulo: 'Comprar cabos P10',
    Descricao: 'Necessitamos de 5 cabos P10 de 10 metros.',
    Status: 'Pendente',
    Tipo: 'Tarefa',
    Data_Criacao: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('Tarefas_Chamados').add({
    ID_Projeto: projRef.id,
    Titulo: 'Soldar conectores do multicabo',
    Descricao: 'Refazer a solda que está com mau contato no canal 4.',
    Status: 'Concluido',
    Tipo: 'Tarefa',
    Data_Criacao: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("Projetos e tarefas criados.");

  console.log("5. Criando Agenda Interna...");
  await db.collection('Agenda_Interna').add({
    Titulo: 'Ensaio Geral (Teste)',
    Data_Hora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Daqui a 2 dias
    Tipo: 'Ensaio',
    ID_Ministerio: minRef.id,
    Nome_Ministerio: 'Louvor & Adoração (Teste)',
    Descricao: 'Ensaio focado nas músicas do culto de Ceia.',
    Data_Criacao: admin.firestore.FieldValue.serverTimestamp(),
    Criado_Por: 'vini.wincklerferreira@gmail.com'
  });
  console.log("Agenda interna criada.");

  console.log("6. Criando Escala...");
  await db.collection('Escalas').add({
    Titulo: 'Culto de Domingo (Teste)',
    Data: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Daqui a 3 dias
    ID_Ministerio: minRef.id,
    Nome_Ministerio: 'Louvor & Adoração (Teste)',
    Membros_Escalados: [
      {
        email: 'vini.wincklerferreira@gmail.com',
        nome: 'Vinicius Winckler',
        funcao: 'Vocal',
        status: 'pendente'
      }
    ],
    Criado_Por: adminUserId || 'vini.wincklerferreira@gmail.com'
  });
  console.log("Escala criada.");

  console.log("Tudo pronto! Pressione Ctrl+C para sair (ou o script terminará em instantes).");
  process.exit(0);
}

run().catch(console.error);
