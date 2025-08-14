
"use client"
import { ArrowLeft, CheckCircle, Package, Truck, Home, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const trackingIcons = {
    'Order Placed': Package,
    'Processing': CheckCircle,
    'Shipped': Truck,
    'In Delivery': Truck,
    'Delivered': Home,
};

const cancellationReasons = [
    "I want to change my shipping address",
    "I want to change a product in my order",
    "I ordered by mistake",
    "I found a better price elsewhere",
    "Other",
];

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!orderId) return;
        setIsLoading(true);
        const orderRef = doc(db, 'orders', orderId);
        const unsubscribe = onSnapshot(orderRef, (doc) => {
            if (doc.exists()) {
                setOrder({ id: doc.id, ...doc.data() } as Order);
            } else {
                console.error("No such order!");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!order) return;
        setIsCancelling(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                status: 'Cancelled'
            });
            toast({ title: 'Order Cancelled', description: 'Your order has been successfully cancelled.' });
        } catch (error) {
            console.error("Error cancelling order: ", error);
            toast({ title: 'Error', description: 'Failed to cancel order.', variant: 'destructive' });
        } finally {
            setIsCancelling(false);
        }
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!order) {
        return <div>Order not found</div>;
    }

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
    
    const canCancel = !['Shipped', 'Delivered', 'Cancelled'].includes(order.status);


    return (
        <div className="flex min-h-screen w-full flex-col bg-secondary/50">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/profile/orders">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Orders</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Order Details</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 pb-24 md:pb-6">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">Order: #{order.id.slice(0,6)}...</CardTitle>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt.toDate()).toLocaleDateString()}</p>
                        </div>
                        <p className={cn("font-bold", getStatusColor(order.status))}>{order.status}</p>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-bold mb-4">Order Tracking</h3>
                        {/* Mobile Tracking */}
                        <div className="relative">
                             <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
                             {order.tracking.map((step, index) => {
                                const Icon = trackingIcons[step.status as keyof typeof trackingIcons] || Package;
                                return (
                                <div key={index} className="flex items-start gap-4 pl-0 mb-6">
                                    <div className="relative z-10">
                                        <div className={cn("p-3 rounded-full", step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-sm font-semibold">{step.status}</p>
                                        <p className="text-xs text-muted-foreground">{step.date}</p>
                                    </div>
                                </div>
                             )})}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Products</CardTitle>
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
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{order.address}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
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

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full rounded-full" disabled={!canCancel}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Order
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please select a reason for cancellation. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <RadioGroup defaultValue={cancellationReasons[0]} className="space-y-2">
                                {cancellationReasons.map((reason) => (
                                    <div key={reason} className="flex items-center space-x-2">
                                        <RadioGroupItem value={reason} id={reason} />
                                        <Label htmlFor={reason}>{reason}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            <Input className="mt-4" placeholder="Please specify other reason..." />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Don't Cancel</AlertDialogCancel>
                            <AlertDialogAction className="rounded-full bg-destructive hover:bg-destructive/90" onClick={handleCancelOrder} disabled={isCancelling}>
                                {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Cancellation"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}
