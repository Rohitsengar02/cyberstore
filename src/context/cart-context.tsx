
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string; // This is the product ID
  productId: string;
  name: string;
  price: string;
  image: string;
  hint: string;
  category: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'>, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthLoading) return;
    
    if (user) {
      setIsLoading(true);
      const cartRef = collection(db, `users/${user.uid}/cart`);
      const unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        setCartItems(items);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching cart:", error);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setCartItems([]);
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  const addToCart = async (product: Omit<CartItem, 'quantity' | 'id'>, quantity = 1) => {
    if (!user) {
      toast({ title: "Please login to add items to your cart.", variant: "destructive" });
      setIsAuthDialogOpen(true);
      return;
    }

    const cartRef = collection(db, `users/${user.uid}/cart`);
    const q = query(cartRef, where("productId", "==", product.productId));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const newQuantity = existingDoc.data().quantity + quantity;
            await updateDoc(doc(db, `users/${user.uid}/cart`, existingDoc.id), { quantity: newQuantity });
        } else {
            await addDoc(cartRef, { ...product, quantity });
        }
        setIsCartOpen(true);
        toast({ title: "Added to cart!" });
    } catch(e) {
        console.error(e);
        toast({ title: "Error", description: "Could not add item to cart.", variant: "destructive"});
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;
    const itemRef = doc(db, `users/${user.uid}/cart`, cartItemId);
    await deleteDoc(itemRef);
    toast({ title: "Item removed from cart." });
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
    } else {
      const itemRef = doc(db, `users/${user.uid}/cart`, cartItemId);
      await updateDoc(itemRef, { quantity });
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const cartRef = collection(db, `users/${user.uid}/cart`);
    const snapshot = await getDocs(cartRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    setIsCartOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
