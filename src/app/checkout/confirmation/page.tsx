
"use client"
import { CheckCircle, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!orderId) {
             setIsLoading(false);
             return;
        }

        const fetchOrder = async () => {
            const docRef = doc(db, "orders", orderId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
            } else {
                console.log("No such document!");
            }
            setIsLoading(false);
        };

        fetchOrder();
    }, [orderId]);


    if(isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    
    if(!order) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Order not found</h1>
                    <p className="text-muted-foreground">We couldn't find the order you're looking for.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 pt-12 md:pt-24">
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                className="flex flex-col items-center text-center w-full max-w-2xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <CheckCircle className="h-24 w-24 text-green-500" />
                </motion.div>
                <h1 className="text-3xl font-bold mt-6">Thank You!</h1>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Your order has been placed successfully.
                </p>

                <Card className="w-full mt-8 rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                     <CardContent>
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 py-4">
                                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary">
                                    <Image src={item.image} alt={item.name} data-ai-hint={item.hint} fill className="object-cover" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-sm">{item.name}</h3>
                                    <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold">{item.price}</p>
                            </div>
                        ))}
                    </CardContent>
                    <Separator />
                    <CardContent className="space-y-2 pt-6">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span className="text-muted-foreground">Discount</span>
                            <span>-₹{order.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>₹0.00</span>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between items-center font-bold text-lg pt-4">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                    </CardFooter>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm">
                    <Button asChild size="lg" className="w-full rounded-full">
                        <Link href="/profile/orders">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            See All Orders
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                        <Link href="/">
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
