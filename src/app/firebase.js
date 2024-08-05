import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7Z2TVYFmBOHMdiTB8wqgsmgH91qx_oZw",
  authDomain: "pantry-f55ec.firebaseapp.com",
  projectId: "pantry-f55ec",
  storageBucket: "pantry-f55ec.appspot.com",
  messagingSenderId: "444233292723",
  appId: "1:444233292723:web:4fe4aa8924573ef8f609c6",
  measurementId: "G-2VJ4KWB1FZ"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };