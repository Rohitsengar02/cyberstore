
"use client"

import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

const CartSidebar = () => {
    const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity } = useCart();
    const { user, setIsAuthDialogOpen } = useAuth();
    const router = useRouter();

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.price.replace('₹', '').replace(',', ''));
        return acc + price * item.quantity;
    }, 0);

    const handleCheckout = () => {
        setIsCartOpen(false);
        if(!user) {
            setIsAuthDialogOpen(true);
        } else {
            router.push('/checkout');
        }
    }

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>My Cart ({cartItems.length})</SheetTitle>
                </SheetHeader>
                {cartItems.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex items-center gap-4 py-4">
                                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary">
                                        <Image src={item.image} alt={item.name} fill className="object-cover"/>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm">{item.name}</h3>
                                        <p className="text-primary font-bold text-sm mt-1">{item.price}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <SheetFooter className="mt-auto">
                           <div className="w-full space-y-4">
                             <Separator />
                             <div className="flex justify-between items-center font-bold text-lg">
                                 <span>Subtotal</span>
                                 <span>₹{subtotal.toFixed(2)}</span>
                             </div>
                             <Button size="lg" className="w-full rounded-full" onClick={handleCheckout}>
                                Proceed to Checkout
                             </Button>
                           </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h3 className="text-xl font-semibold">Your cart is empty</h3>
                        <p className="text-muted-foreground mt-2">Add items to see them here.</p>
                        <Button className="mt-6 rounded-full" onClick={() => setIsCartOpen(false)}>Continue Shopping</Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default CartSidebar;
