import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwgfeVsb7mUnPUDk7QKY9dpkBGzjI9r7s",
  authDomain: "myfirstapp-2d652.firebaseapp.com",
  projectId: "myfirstapp-2d652",
  storageBucket: "myfirstapp-2d652.appspot.com",
  messagingSenderId: "943214060736",
  appId: "1:943214060736:web:4e8c4afb3ed66016373925",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
