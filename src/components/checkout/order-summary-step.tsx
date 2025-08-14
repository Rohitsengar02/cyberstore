
"use client"
import { useCart } from "@/context/cart-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import QuickAddProductCard from "@/components/quick-add-product-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import type { Discount } from "@/app/admin/dashboard/discount/page";

type OrderSummaryStepProps = {
    subtotal: number;
    discount: number;
    total: number;
    onApplyDiscount: (discount: Discount | null) => void;
};


const OrderSummaryStep = ({ subtotal, discount, total, onApplyDiscount }: OrderSummaryStepProps) => {
    const { cartItems } = useCart();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const productsCol = collection(db, 'products');
            const productSnapshot = await getDocs(productsCol);
            const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setAllProducts(productList.filter(p => p.status === 'published'));
        };
        const unsubDiscounts = onSnapshot(collection(db, "discounts"), (snapshot) => {
            setDiscounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Discount, 'id'> })))
        });
        
        fetchProducts();
        return () => unsubDiscounts();
    }, []);

    const handleApplyDiscount = () => {
        const discountToApply = discounts.find(d => d.id === selectedDiscount);
        onApplyDiscount(discountToApply || null);
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {cartItems.map((item, index) => (
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

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="w-full rounded-full">Add Coupon</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60%] rounded-t-2xl flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Apply Coupon</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 flex-1 overflow-y-auto">
                        <RadioGroup value={selectedDiscount || ''} onValueChange={setSelectedDiscount} className="space-y-4">
                            {discounts.filter(d => d.status === 'Active').map(d => (
                                <Card key={d.id} className="rounded-xl">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <RadioGroupItem value={d.id} id={d.id} />
                                        <div className="flex-1">
                                            <Label htmlFor={d.id} className="font-bold text-lg">{d.code}</Label>
                                            <p className="text-sm text-muted-foreground">{d.type === 'Percentage' ? `Get ${d.value}% off` : `Get ₹${d.value} off`}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </RadioGroup>
                    </div>
                     <div className="p-4 mt-auto">
                        <Button size="lg" className="w-full rounded-full" onClick={handleApplyDiscount}>Apply</Button>
                    </div>
                </SheetContent>
            </Sheet>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Quick Add</h2>
                 <Carousel
                    opts={{
                        align: "start",
                        dragFree: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {allProducts.slice(0, 10).map(p => (
                            <CarouselItem key={p.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4">
                                <QuickAddProductCard product={p} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>


            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Price Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Products Price</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span className="text-muted-foreground">Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                    </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between items-center font-bold text-lg pt-4">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </CardFooter>
            </Card>

           
        </div>
    )
}

export default OrderSummaryStep;
