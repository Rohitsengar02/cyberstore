
"use client"
import { ArrowLeft, Search, SlidersHorizontal, User } from "lucide-react";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/context/auth-context";

type ShopHeaderProps = {
    onFilterClick: () => void;
}

const ShopHeader = ({ onFilterClick }: ShopHeaderProps) => {
    const { user, setIsAuthDialogOpen } = useAuth();
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const handleAvatarClick = () => {
        if (!user) {
            setIsAuthDialogOpen(true);
        }
    }


    return (
        <header className="sticky top-0 z-40 w-full bg-background border-b">
            <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                <Link href="/" className="md:hidden">
                    <ArrowLeft className="h-6 w-6" />
                    <span className="sr-only">Back to Home</span>
                </Link>
                <div className="hidden md:flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold">Shop</h1>
                    </Link>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="What are you looking for?"
                        className="pl-10 h-10 bg-secondary rounded-full border-none w-full"
                    />
                </div>
                <Button variant="outline" size="icon" className="shrink-0" onClick={onFilterClick}>
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="sr-only">Filters</span>
                </Button>
                <div onClick={handleAvatarClick} className="cursor-pointer md:hidden">
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
        </header>
    );
};

export default ShopHeader;
