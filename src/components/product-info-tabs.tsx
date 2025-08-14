
"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Star, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import type { Product } from '@/lib/types';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";

type Review = {
    id: string;
    userName: string;
    userImage: string;
    rating: number;
    review: string;
    createdAt: any;
}


const ProductInfoTabs = ({ product }: { product: Product }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

     useEffect(() => {
        setIsLoadingReviews(true);
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("productId", "==", product.id), where("status", "==", "approved"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const approvedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
            setReviews(approvedReviews);
            setIsLoadingReviews(false);
        });

        return () => unsubscribe();
    }, [product.id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: "Please login to submit a review.", variant: "destructive" });
            return;
        }
        if (rating === 0 || !reviewText) {
            toast({ title: "Please provide a rating and review text.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "reviews"), {
                productId: product.id,
                userId: user.uid,
                userName: user.displayName,
                userImage: user.photoURL,
                rating,
                review: reviewText,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            toast({ title: "Review Submitted!", description: "Thank you! Your review is pending approval."});
            setReviewText('');
            setRating(0);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto h-auto bg-transparent p-0">
                <TabsTrigger value="info" className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-primary font-semibold">Product Info</TabsTrigger>
                <TabsTrigger value="delivery" className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-primary font-semibold">Delivery & Returns</TabsTrigger>
                <TabsTrigger value="reviews" className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-primary font-semibold">Reviews</TabsTrigger>
            </TabsList>
            <Card className="mt-6 border-none shadow-none">
                <CardContent className="p-0">
                    <TabsContent value="info">
                        <div className="grid md:grid-cols-2 gap-8 text-sm text-muted-foreground">
                            <div>
                                <h3 className="font-semibold text-foreground mb-4">Description</h3>
                                <p>{product.longDesc}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-4">Features</h3>
                                <ul className="list-disc list-inside space-y-2">
                                   {(product.features || []).map((feature, index) => (
                                       <li key={index}>{feature}</li>
                                   ))}
                                </ul>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="delivery">
                        <p className="text-sm text-muted-foreground">{product.deliveryReturns}</p>
                    </TabsContent>
                    <TabsContent value="reviews">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Customer Reviews ({reviews.length})</h3>
                                <div className="space-y-4">
                                    {isLoadingReviews ? <Loader2 className="animate-spin" /> : reviews.map((review, index) => (
                                        <div key={index} className="border-b pb-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Avatar>
                                                    <AvatarImage src={review.userImage} alt={review.userName} />
                                                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{review.userName}</p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground ml-auto">{review.createdAt ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{review.review}</p>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && !isLoadingReviews && <p className="text-sm text-muted-foreground">No reviews yet. Be the first to write one!</p>}
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                                    {user ? (
                                        <form className="space-y-4" onSubmit={handleReviewSubmit}>
                                            <Textarea placeholder="Your Review" value={reviewText} onChange={e => setReviewText(e.target.value)}/>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium">Your Rating:</span>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-5 w-5 cursor-pointer hover:text-yellow-400 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} onClick={() => setRating(i+1)} />
                                                    ))}
                                                </div>
                                                <Button type="submit" className="rounded-full" disabled={isSubmitting}>
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                    Submit Review
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">You must be <button className="text-primary underline">logged in</button> to write a review.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    )
}

export default ProductInfoTabs;
