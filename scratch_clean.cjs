const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function run() {
  const email = 'vini.wincklerferreira@gmail.com';
  console.log(`Starting proper cleanup for ${email}`);
  
  // 1. Delete from Auth
  try {
    const userRecord = await auth.getUserByEmail(email);
    console.log(`Found Auth User: ${userRecord.uid}`);
    await auth.deleteUser(userRecord.uid);
    console.log('Auth User deleted.');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('No Auth User found for this email.');
    } else {
      console.error('Error fetching Auth user:', error);
    }
  }

  // 2. Delete from Firestore collection 'Usuarios'
  try {
    const snapshot = await db.collection('Usuarios').where('Email', '==', email).get();
    console.log(`Found ${snapshot.size} Firestore documents.`);
    
    if (!snapshot.empty) {
      for (const doc of snapshot.docs) {
        console.log(`Deleting Firestore document ${doc.id}`);
        await doc.ref.delete();
      }
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
  }

  console.log('Cleanup complete!');
  process.exit(0);
}

run();
