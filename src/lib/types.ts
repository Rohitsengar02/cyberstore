

import type { Timestamp } from "firebase/firestore";
import type { CartItem } from "@/context/cart-context";
import type { LucideIcon } from "lucide-react";

export type Product = {
    id: string;
    title: string;
    sku?: string;
    mainImage: string;
    pricing: { regular: number; offered: number };
    inventory?: { stock: number; views: number };
    status: 'published' | 'draft' | 'archived';
    shortDesc?: string;
    longDesc?: string;
    gallery?: string[];
    variants?: { type: string, options: { name: string, price: string }[] }[];
    categories?: string[];
    tags?: string[];
    features?: string[];
    relatedProducts?: { suggested: string[], quickAdd: string[] };
    deliveryReturns?: string;
    createdAt?: any;
    hint?: string;
};


export type Category = {
  id: string;
  name: string;
  image: string;
  hint: string;
};

export type TrackingStep = {
    status: string;
    date: string;
    icon: string;
    completed: boolean;
};

export type Order = {
  id: string;
  userId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    photoURL?: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  address: string;
  paymentMethod: string;
  status: "Delivered" | "Pending" | "Cancelled" | "Processing" | "Shipped";
  tracking: { status: string; date: string; completed: boolean }[];
  createdAt: Timestamp;
};
