
"use client"
import { Search, ShoppingBag, ChevronDown, Heart, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import ThemeToggle from "./theme-toggle";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/context/cart-context";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";


type Category = {
    id: string;
    title: string;
};

type StoreSettings = {
    logoType: 'text' | 'image';
    logoText: string;
    logoUrl: string;
};


const Header = () => {
  const { cartItems, setIsCartOpen } = useCart();
  const { user, setIsAuthDialogOpen } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    useEffect(() => {
        const fetchSettings = async () => {
            const docRef = doc(db, "settings", "store");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data() as StoreSettings);
            }
        };
        fetchSettings();

        const unsubSettings = onSnapshot(doc(db, "settings", "store"), (doc) => {
             if (doc.exists()) {
                setSettings(doc.data() as StoreSettings);
            }
        });

        const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(categoriesData);
        });

        return () => {
            unsubSettings();
            unsubCategories();
        };
    }, []);

  const handleAvatarClick = () => {
      if (user) {
          // Handled by Link component
      } else {
          setIsAuthDialogOpen(true);
      }
  }


  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 gap-4">
        <Link href="/" className="flex items-center space-x-2">
            {settings?.logoType === 'image' && settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.logoText} width={32} height={32} />
            ) : (
                <ShoppingBag className="h-8 w-8" />
            )}
        </Link>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <button onClick={() => setIsCartOpen(true)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
            <ShoppingBag />
            {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartItems.length}
                </span>
            )}
            <span className="sr-only">Open cart</span>
          </button>
          <Input type="search" placeholder="Search" className="pl-10 pr-10 h-12 bg-secondary rounded-full border-none w-full" />
        </div>
        <div onClick={handleAvatarClick} className="cursor-pointer">
             <Avatar>
                {user ? (
                    <Link href="/profile">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Link>
                ) : (
                    <>
                        <AvatarImage />
                        <AvatarFallback><User /></AvatarFallback>
                    </>
                )}
            </Avatar>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block border-b">
        <div className="container mx-auto flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
                {settings?.logoType === 'image' && settings.logoUrl ? (
                    <Image src={settings.logoUrl} alt={settings.logoText} width={40} height={40} />
                ) : (
                    <ShoppingBag className="h-8 w-8" />
                )}
                <span className="font-bold text-2xl">{settings?.logoText || 'NoirCart'}</span>
            </Link>

            <nav className="flex items-center space-x-8 text-sm font-medium">
                <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link>
                <Link href="/shop" className="transition-colors hover:text-foreground/80 text-foreground/60">Shop</Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 px-0 hover:bg-transparent">
                      Categories
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="start">
                    <DropdownMenuLabel>Shop by Category</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {categories.map((category) => (
                          <DropdownMenuItem key={category.id} asChild>
                            <Link href={`/shop/category/${encodeURIComponent(category.title)}`} className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" /> 
                              <span>{category.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/shop/categories" className="font-semibold text-primary">View All Categories</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">About Us</Link>
                <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search products..." className="pl-10 h-10 bg-secondary rounded-full border-none focus-visible:ring-2 focus-visible:ring-primary/50" />
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Button>
                <button onClick={() => setIsCartOpen(true)} className="relative">
                    <ShoppingBag className="h-6 w-6" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                            {cartItems.length}
                        </span>
                    )}
                    <span className="sr-only">Open cart</span>
                </button>
              </div>

            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
