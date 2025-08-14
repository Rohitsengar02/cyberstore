
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Address } from '@/app/profile/address/page';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: (isOpen: boolean) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, photoURL: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id' | 'isDefault'> & {isDefault?: boolean}) => Promise<void>;
  updateAddress: (id: string, address: Partial<Omit<Address, 'id'>>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setAddresses([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if (user?.uid) {
      const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        // Combine auth data with firestore data
        setUser(prevUser => prevUser ? ({ ...prevUser, ...doc.data() } as User) : null);
        setIsLoading(false);
      });
      
      const addressesCol = collection(db, `users/${user.uid}/addresses`);
      const unsubAddresses = onSnapshot(addressesCol, (snapshot) => {
        const userAddresses = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Address));
        setAddresses(userAddresses);
      });
      
      return () => {
        unsubUser();
        unsubAddresses();
      }
    }
  }, [user?.uid])


  const login = async (email: string, pass: string) => {
      await signInWithEmailAndPassword(auth, email, pass);
  };
  
  const register = async (email: string, pass: string, name: string, photoURL: string, phone: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      if (user) {
          await updateProfile(user, { displayName: name, photoURL: photoURL });
          await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: name,
              photoURL: photoURL,
              phoneNumber: phone,
              createdAt: new Date(),
          });
      }
  };

  const logout = async () => {
      await signOut(auth);
  }

  const addAddress = async (address: Omit<Address, 'id' | 'isDefault'> & {isDefault?: boolean}) => {
    if (!user) throw new Error("You must be logged in to add an address.");
    const addressesCol = collection(db, `users/${user.uid}/addresses`);
    await addDoc(addressesCol, address);
  };

  const updateAddress = async (id: string, address: Partial<Omit<Address, 'id'>>) => {
    if (!user) throw new Error("You must be logged in to update an address.");
    const addressRef = doc(db, `users/${user.uid}/addresses`, id);
    await updateDoc(addressRef, address);
  }
  
  const deleteAddress = async (id: string) => {
     if (!user) throw new Error("You must be logged in to delete an address.");
     const addressRef = doc(db, `users/${user.uid}/addresses`, id);
     await deleteDoc(addressRef);
  }


  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthDialogOpen, setIsAuthDialogOpen, login, register, logout, addresses, addAddress, updateAddress, deleteAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    