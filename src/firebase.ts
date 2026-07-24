import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCmD7SuYArSlQs_Z5pqjkAYr7sa9kmBjnA',
  authDomain: 'solify1.firebaseapp.com',
  projectId: 'solify1',
  storageBucket: 'solify1.firebasestorage.app',
  messagingSenderId: '467187591397',
  appId: '1:467187591397:web:30fd8302a8ccd153394c0c',
  measurementId: 'G-FGKFEZZY2W',
}

const app = initializeApp(firebaseConfig)

export const auth: Auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
