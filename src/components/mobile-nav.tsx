
"use client"

import { Home, LayoutGrid, Store, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";

const MobileNav = () => {
    const pathname = usePathname();
    const { cartItems, setIsCartOpen } = useCart();
    
    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: Store },
        { href: "/shop/categories", label: "Categories", icon: LayoutGrid },
        { href: "#", label: "Cart", icon: ShoppingCart, isButton: true, badge: cartItems.length > 0 ? cartItems.length : undefined },
        { href: "/profile", label: "Account", icon: User },
    ];

    const handleCartClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsCartOpen(true);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50 shadow-t-lg">
            <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
                {navItems.map((item) => (
                    <div 
                        key={item.label} 
                        className="flex flex-col items-center justify-center gap-1 text-center font-medium"
                        onClick={item.label === 'Cart' ? handleCartClick : undefined}
                    >
                         <Link href={item.href} className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-md transition-colors w-full relative",
                            pathname === item.href && !item.isButton ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}>
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs">{item.label}</span>
                             {item.badge !== undefined && (
                                <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default MobileNav;
