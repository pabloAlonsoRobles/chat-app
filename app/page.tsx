'use client';

import { useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db } from './config/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Save user info to Firestore when they're already logged in
        saveUserToFirestore(user);
        router.push('/chat');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const saveUserToFirestore = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        lastSeen: new Date(),
        uid: user.uid
      }, { merge: true }); // merge: true will update existing fields and add new ones
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      router.push('/chat');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat App</h1>
          <p className="text-gray-600">Sign in to start chatting</p>
        </div>
        
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          <Image
            src="/google-icon.svg"
            alt="Google Logo"
            width={20}
            height={20}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
