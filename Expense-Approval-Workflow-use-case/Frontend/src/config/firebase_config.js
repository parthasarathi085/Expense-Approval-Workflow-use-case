import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
//   apiKey: "AIzaSyATRO6fzg2ez5VdLFsRgPH7KcVNYe6_uVI",
//   authDomain: "matops-home.firebaseapp.com",
//   databaseURL: "https://matops-home-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "matops-home",
//   storageBucket: "matops-home.appspot.com",
//   messagingSenderId: "890000438315",
//   appId: "1:890000438315:web:026686fd7d85d917b1266e",
//   measurementId: "G-G1TLFQVYFD"
// };

const firebaseConfig = {
  apiKey: "AIzaSyATRO6fzg2ez5VdLFsRgPH7KcVNYe6_uVI",
  authDomain: "matops-home.firebaseapp.com",
  databaseURL: "https://matops-home-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "matops-home",
  storageBucket: "matops-home.appspot.com",
  messagingSenderId: "890000438315",
  appId: "1:890000438315:web:58eae4af39dba5feb1266e",
  measurementId: "G-L3NF93DJ2H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;