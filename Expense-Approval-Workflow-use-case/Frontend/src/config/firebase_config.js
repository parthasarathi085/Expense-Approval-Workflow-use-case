import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
