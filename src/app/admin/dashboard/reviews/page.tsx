
"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2, Check, X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

export type Review = {
    id: string;
    userId: string;
    userName: string;
    userImage: string;
    productId: string;
    productTitle?: string;
    productImage?: string;
    rating: number;
    review: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
};


export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot(collection(db, "reviews"), async (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
            // You might want to fetch product details here to show in the table
            setReviews(reviewsData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (reviewId: string, status: Review['status']) => {
        const reviewRef = doc(db, 'reviews', reviewId);
        try {
            await updateDoc(reviewRef, { status });
            toast({ title: `Review ${status}` });
        } catch (error) {
            toast({ title: 'Error updating review', variant: 'destructive' });
        }
    };

    const handleDelete = async (reviewId: string) => {
        try {
            await deleteDoc(doc(db, "reviews", reviewId));
            toast({ title: "Review deleted" });
        } catch (error) {
            toast({ title: "Error deleting review", variant: 'destructive' });
        }
    }


    const getStatusBadge = (status: Review['status']) => {
        switch (status) {
            case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
        }
    };


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Reviews</h1>
                    <p className="text-muted-foreground">Manage customer reviews.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Review</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.map(review => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={review.userImage} alt={review.userName} />
                                                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{review.userName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="max-w-xs truncate">{review.review}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {review.rating} <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                {review.status !== 'approved' && (
                                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateStatus(review.id, 'approved')}>
                                                        <Check className="h-4 w-4 text-green-500"/>
                                                    </Button>
                                                )}
                                                 {review.status !== 'rejected' && (
                                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateStatus(review.id, 'rejected')}>
                                                        <X className="h-4 w-4 text-red-500"/>
                                                    </Button>
                                                )}
                                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(review.id)}>
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
