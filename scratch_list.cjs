const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('Usuarios').get();
  console.log(`Total users in DB: ${snapshot.size}`);
  snapshot.forEach(doc => {
    console.log(`User: ${doc.id} ->`, doc.data());
  });
  process.exit(0);
}
run();
