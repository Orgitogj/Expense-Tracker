// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {initializeAuth,getReactNativePersistence} from 'firebase/auth';
import  AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2R9Oy4vwifx5BPV-e0Mq78I85uRXVCsA",
  authDomain: "expense-tracker-307f5.firebaseapp.com",
  projectId: "expense-tracker-307f5",
  storageBucket: "expense-tracker-307f5.firebasestorage.app",
  messagingSenderId: "937433245594",
  appId: "1:937433245594:web:5c434644d71dca49f4fc23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=initializeAuth(app,{
    persistence:getReactNativePersistence(AsyncStorage),
})

export const firestore=getFirestore(app);

export const storage=getStorage(app);
