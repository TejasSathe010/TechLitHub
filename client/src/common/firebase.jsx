// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8guFCnK78104j0Eb5lsbGLTsBuaKedu8",
  authDomain: "tech-blog-site-1b8f1.firebaseapp.com",
  projectId: "tech-blog-site-1b8f1",
  storageBucket: "tech-blog-site-1b8f1.appspot.com",
  messagingSenderId: "882402280801",
  appId: "1:882402280801:web:3a25cc30fa4f60942af120",
  measurementId: "G-721R5Y65MF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Google Auth
const provider = new GoogleAuthProvider();
const auth = getAuth();
export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
  .then((result) => {user = result.user})
  .catch((err) => console.log(err));
  return user;
};