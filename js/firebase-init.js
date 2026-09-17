import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  projectId: "gen-lang-client-0237437923",
  appId: "1:833135886184:web:a038f90b1f5c18412060dd",
  apiKey: "AIzaSyAyKySfR_uDOo2PhE5NXyExrmJ6jBUdfj8",
  authDomain: "gen-lang-client-0237437923.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-lavajatodanilode-e261df4e-97bf-4fcf-8c9f-056d118147ca",
  storageBucket: "gen-lang-client-0237437923.firebasestorage.app",
  messagingSenderId: "833135886184",
  oAuthClientId: "833135886184-bguo7aga7s36fnder58fucd3h463m17m.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
const auth = getAuth(app);

async function initFirebase() {
    return { app, db, auth };
}

export { 
    app, 
    db, 
    auth, 
    initFirebase, 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    onSnapshot, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
};
