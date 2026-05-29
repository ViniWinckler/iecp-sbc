const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require('./service-account.json')) });
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function seed() {
  // 1. Limpar perfil falso do Senai (criado sem UID real)
  const usersSnap = await db.collection('Usuarios').get();
  for (const doc of usersSnap.docs) {
    if (doc.data().Firebase_UID === 'created_by_script') {
      await doc.ref.delete();
      console.log('Removido doc falso:', doc.id);
    }
  }

  // 2. Ministério de Louvor
  const minRef = db.collection('Ministerios').doc('ministerio_louvor');
  await minRef.set({
    Nome_Ministerio: 'Louvor & Adoração',
    Descricao: 'Equipe responsável pelo louvor nos cultos.',
    Lider_Responsavel_Email: 'vini.wincklerferreira@gmail.com'
  });
  console.log('Ministério criado.');

  // 3. Ministério de Mídia
  const minRef2 = db.collection('Ministerios').doc('ministerio_midia');
  await minRef2.set({
    Nome_Ministerio: 'Mídia & Transmissão',
    Descricao: 'Responsável pelo streaming e redes sociais da igreja.',
    Lider_Responsavel_Email: 'vini.wincklerferreira@gmail.com'
  });
  console.log('Ministério Mídia criado.');

  // 4. Avisos
  await db.collection('Avisos').doc('aviso_geral').set({
    Titulo: 'Bem-vindos ao Portal IECP SBC!',
    Descricao: 'Este é o portal interno da Igreja Evangélica Cristã Presbiteriana. Aqui você encontra escalas, agenda e comunicados da equipe.',
    Ministerio_ID: null,
    Data_Hora: new Date().toISOString(),
    Autor_Email: 'vini.wincklerferreira@gmail.com'
  });
  await db.collection('Avisos').doc('aviso_louvor').set({
    Titulo: 'Ensaio desta semana confirmado',
    Descricao: 'O ensaio da equipe de louvor será na quarta-feira às 19h30. Presença obrigatória para todos os músicos.',
    Ministerio_ID: 'ministerio_louvor',
    Data_Hora: new Date().toISOString(),
    Autor_Email: 'vini.wincklerferreira@gmail.com'
  });
  console.log('Avisos criados.');

  // 5. Agenda Interna
  const em2dias = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const em5dias = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const em7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.collection('Agenda_Interna').doc('agenda_ensaio').set({
    Titulo: 'Ensaio - Equipe de Louvor',
    Data_Hora: em2dias,
    Tipo: 'Ensaio',
    ID_Ministerio: 'ministerio_louvor',
    Nome_Ministerio: 'Louvor & Adoração',
    Descricao: 'Ensaio geral para o culto de domingo.',
    Criado_Por: 'vini.wincklerferreira@gmail.com',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  await db.collection('Agenda_Interna').doc('agenda_reuniao').set({
    Titulo: 'Reunião de Líderes',
    Data_Hora: em5dias,
    Tipo: 'Reunião',
    ID_Ministerio: null,
    Nome_Ministerio: '',
    Descricao: 'Reunião mensal de alinhamento com todos os líderes de ministério.',
    Criado_Por: 'vini.wincklerferreira@gmail.com',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  await db.collection('Agenda_Interna').doc('agenda_culto').set({
    Titulo: 'Culto de Celebração',
    Data_Hora: em7dias,
    Tipo: 'Geral',
    ID_Ministerio: null,
    Nome_Ministerio: '',
    Descricao: 'Culto especial de celebração com a participação de todos os ministérios.',
    Criado_Por: 'vini.wincklerferreira@gmail.com',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  console.log('Agenda criada.');

  // 6. Escala
  await db.collection('Escalas').doc('escala_domingo').set({
    Titulo: 'Culto de Domingo',
    Data: em7dias,
    ID_Ministerio: 'ministerio_louvor',
    Nome_Ministerio: 'Louvor & Adoração',
    Membros_Escalados: [
      { email: 'vini.wincklerferreira@gmail.com', nome: 'Vinicius Winckler', funcao: 'Vocal / Guitarra', status: 'pendente' }
    ],
    Criado_Por: 'vini.wincklerferreira@gmail.com'
  });
  console.log('Escala criada.');

  // 7. Projeto com tarefas
  await db.collection('Projetos').doc('projeto_audio').set({
    Nome_Projeto: 'Reforma do Sistema de Áudio',
    Descricao: 'Atualização do cabeamento e equipamentos do palco.',
    Progresso: 33,
    Status: 'Em Andamento',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  await db.collection('Tarefas_Chamados').doc('tarefa_1').set({
    ID_Projeto: 'projeto_audio',
    Titulo: 'Comprar cabos P10 (5 unidades)',
    Descricao: 'Cabos de 10m para os retornos do palco.',
    Status: 'Concluido',
    Tipo: 'Tarefa',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  await db.collection('Tarefas_Chamados').doc('tarefa_2').set({
    ID_Projeto: 'projeto_audio',
    Titulo: 'Instalar rack de equipamentos',
    Descricao: 'Fixar o rack no canto do palco e organizar os equipamentos.',
    Status: 'Em Andamento',
    Tipo: 'Tarefa',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  await db.collection('Tarefas_Chamados').doc('tarefa_3').set({
    ID_Projeto: 'projeto_audio',
    Titulo: 'Testar todos os canais do console',
    Descricao: 'Verificar gain, EQ e roteamento de cada canal.',
    Status: 'Pendente',
    Tipo: 'Tarefa',
    Data_Criacao: FieldValue.serverTimestamp()
  });
  console.log('Projetos e tarefas criados.');

  console.log('\n✅ Banco de dados populado com sucesso!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
