
"use client"
import React, { useState } from "react";
import { ArrowLeft, Check, Package, MapPin, CreditCard, Loader2, Truck, Home } from "lucide-react";
import Link from "next/link";
import OrderSummaryStep from "@/components/checkout/order-summary-step";
import ShippingAddressStep from "@/components/checkout/shipping-address-step";
import PaymentStep from "@/components/checkout/payment-step";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp, writeBatch, getDocs, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Address } from "@/app/profile/address/page";
import type { Discount } from "@/app/admin/dashboard/discount/page";

const steps = [
    { id: 1, name: "Order", icon: Package },
    { id: 2, name: "Address", icon: MapPin },
    { id: 3, name: "Payment", icon: CreditCard }
];

export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [isLoading, setIsLoading] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);

    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, clearCart } = useCart();
    const { toast } = useToast();

    const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price.replace(/[^0-9.-]+/g,"")) * item.quantity), 0);
    
    const calculateDiscount = () => {
        if (!appliedDiscount) return 0;
        if (appliedDiscount.type === 'Percentage') {
            return subtotal * (appliedDiscount.value / 100);
        } else {
            return appliedDiscount.value;
        }
    }
    const discountAmount = calculateDiscount();
    const total = subtotal - discountAmount;

    const handlePlaceOrder = async () => {
        if (!user) {
            toast({ title: "Please login to place an order.", variant: "destructive" });
            return;
        }
        if (!selectedAddress) {
            toast({ title: "Please select a shipping address.", variant: "destructive" });
            return;
        }
         if (cartItems.length === 0) {
            toast({ title: "Your cart is empty.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            const orderData = {
                userId: user.uid,
                customer: {
                    name: user.displayName || 'N/A',
                    email: user.email || 'N/A',
                    phone: user.phoneNumber || 'N/A',
                    photoURL: user.photoURL || '',
                },
                items: cartItems.map(item => ({...item, price: item.price.toString()})),
                subtotal,
                discount: discountAmount,
                total,
                address: `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.zip}, ${selectedAddress.country}`,
                paymentMethod,
                status: "Pending",
                tracking: [
                    { status: "Order Placed", date: new Date().toISOString().split('T')[0], completed: true },
                    { status: "Processing", date: "", completed: false },
                    { status: "Shipped", date: "", completed: false },
                    { status: "Delivered", date: "", completed: false },
                ],
                createdAt: serverTimestamp(),
            };

            const orderRef = await addDoc(collection(db, "orders"), orderData);

            await clearCart(); // This now clears the cart in Firestore
            
            toast({ title: "Order Placed!", description: "Your order has been successfully placed." });
            router.push(`/checkout/confirmation?orderId=${orderRef.id}`);

        } catch (error) {
             console.error("Error placing order:", error);
             toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }

    }


    const handleNext = () => {
        if (currentStep === 2 && !selectedAddress) {
            toast({ title: "Please select a shipping address.", variant: "destructive" });
            return;
        }
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handlePlaceOrder();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Order Summary";
            case 2: return "Shipping Address";
            case 3: return "Payment";
            default: return "Checkout";
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-secondary/50">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <button onClick={() => currentStep === 1 ? router.back() : handleBack()}>
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back</span>
                    </button>
                    <h1 className="text-xl font-bold mx-auto">{getStepTitle()}</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            
            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                <div className="container mx-auto max-w-2xl">
                     {/* Stepper */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center z-10">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.name}</p>
                                </div>
                                {index < steps.length - 1 && (
                                     <div className={`flex-1 h-1 transition-colors -mx-2 ${currentStep > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {currentStep === 1 && <OrderSummaryStep subtotal={subtotal} discount={discountAmount} total={total} onApplyDiscount={setAppliedDiscount} />}
                    {currentStep === 2 && <ShippingAddressStep selectedAddress={selectedAddress} onSelectAddress={setSelectedAddress} />}
                    {currentStep === 3 && <PaymentStep selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />}
                </div>
            </main>

            {/* Bottom Navigation */}
             <div className="fixed bottom-16 left-0 right-0 md:hidden bg-background border-t p-4 shadow-t-lg">
                <div className="container mx-auto flex gap-4">
                     <button onClick={handleNext} className="w-full bg-primary text-primary-foreground py-3 px-6 text-center font-semibold rounded-full flex items-center justify-center" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (currentStep === 3 ? "Place Order" : "Proceed")}
                    </button>
                </div>
            </div>

             {/* Desktop Navigation */}
            <div className="hidden md:flex justify-end gap-4 container mx-auto max-w-2xl pb-8">
                <button onClick={handleNext} className="bg-primary text-primary-foreground py-3 px-10 font-semibold rounded-full flex items-center justify-center" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (currentStep === 3 ? "Place Order" : "Proceed")}
                </button>
            </div>
        </div>
    );
}
