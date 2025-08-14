
"use client"
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from "react";
import { type Order } from "@/lib/types";
import { cn } from "@/lib/utils";

const getStatusColor = (status: Order['status']) => {
    switch(status) {
        case 'Delivered': return 'text-green-500';
        case 'Shipped': return 'text-blue-500';
        case 'Processing': return 'text-purple-500';
        case 'Pending': return 'text-yellow-500';
        case 'Cancelled': return 'text-red-500';
        default: return 'text-gray-500';
    }
}

export default function OrdersPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            if(!isAuthLoading) setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(userOrders);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAuthLoading]);

    if (isLoading || isAuthLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!user) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-secondary/50 items-center justify-center">
                <p className="mb-4">Please log in to see your orders.</p>
                <Button asChild>
                    <Link href="/profile">Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-secondary/50">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/profile">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Profile</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Order History</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6">
                {orders.length > 0 ? orders.map(order => (
                     <Card key={order.id} className="rounded-2xl shadow-sm">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-lg">Order: #{order.id.slice(0, 6)}...</CardTitle>
                                <p className="text-sm text-muted-foreground">{new Date(order.createdAt.toDate()).toLocaleDateString()}</p>
                            </div>
                            <p className={cn("font-bold", getStatusColor(order.status))}>{order.status}</p>
                        </CardHeader>
                        <CardContent>
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 py-4">
                                     <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary">
                                         <Image src={item.image} alt={item.name} data-ai-hint={item.hint} fill className="object-cover" />
                                     </div>
                                     <div className="flex-1">
                                         <h3 className="font-semibold text-sm">{item.name}</h3>
                                         <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                                     </div>
                                     <p className="font-bold">{item.price}</p>
                                </div>
                            ))}
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex justify-between items-center pt-4">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
                        </CardFooter>
                         <CardFooter className="flex gap-4">
                            <Button variant="outline" className="w-full rounded-full" asChild>
                               <Link href={`/profile/orders/${order.id}`}>Details</Link>
                            </Button>
                            <Button className="w-full rounded-full">Re-Order</Button>
                        </CardFooter>
                    </Card>
                )) : (
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold">No Orders Yet</h2>
                        <p className="text-muted-foreground mt-2">You haven't placed any orders.</p>
                        <Button asChild className="mt-6">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

    