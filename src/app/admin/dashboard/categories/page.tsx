
"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { generateCategoryImage } from '@/ai/flows/generate-category-image-flow';


type Category = {
    id: string;
    title: string;
    image: string;
};

// Helper to convert data URI to File
const dataUriToBlob = (dataUri: string): Blob => {
    const byteString = atob(dataUri.split(',')[1]);
    const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [newCategoryImageFile, setNewCategoryImageFile] = useState<File | null>(null);
    const [newCategoryImageUrl, setNewCategoryImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(categoriesData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio');

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Image upload failed:', error);
            toast({ title: "Image upload failed", variant: "destructive" });
            return null;
        }
    };
    
    const handleAddCategory = async () => {
        if (!newCategoryTitle || !newCategoryImageFile) {
            toast({ title: "Missing fields", description: "Please provide a title and an image.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const imageUrl = await handleImageUpload(newCategoryImageFile);
            if (!imageUrl) {
                 setIsLoading(false);
                 return;
            }

            await addDoc(collection(db, "categories"), {
                title: newCategoryTitle,
                image: imageUrl,
                createdAt: new Date(),
            });

            toast({ title: "Success", description: "Category added successfully!" });
            setNewCategoryTitle('');
            setNewCategoryImageFile(null);
            setNewCategoryImageUrl(null);
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error adding category: ", error);
            toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteDoc(doc(db, "categories", categoryId));
            toast({ title: "Success", description: "Category deleted." });
        } catch (error) {
             console.error("Error deleting category: ", error);
            toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
        }
    }

    const handleGenerateImage = async () => {
        if(!newCategoryTitle){
            toast({ title: "Missing Title", description: "Please provide a title to generate an image.", variant: "destructive" });
            return;
        }
        setIsAiLoading(true);
        try {
            const result = await generateCategoryImage({ categoryName: newCategoryTitle });
            const blob = dataUriToBlob(result.imageDataUri);
            const file = new File([blob], `${newCategoryTitle.toLowerCase().replace(/\s/g, '-')}-icon.png`, { type: 'image/png' });
            setNewCategoryImageFile(file);
            setNewCategoryImageUrl(result.imageDataUri);
            toast({ title: "Image generated successfully!" });
        } catch(e) {
            console.error(e);
            toast({ title: "Image generation failed.", variant: 'destructive'})
        } finally {
            setIsAiLoading(false);
        }
    }

     const handleRegenerateImage = async (category: Category) => {
        setRegeneratingId(category.id);
        try {
            const result = await generateCategoryImage({ categoryName: category.title });
            const blob = dataUriToBlob(result.imageDataUri);
            const file = new File([blob], `${category.title.toLowerCase().replace(/\s/g, '-')}-icon.png`, { type: 'image/png' });
            
            const newImageUrl = await handleImageUpload(file);

            if (newImageUrl) {
                 await updateDoc(doc(db, "categories", category.id), {
                    image: newImageUrl,
                });
                toast({ title: "Image regenerated successfully!" });
            }
        } catch(e) {
            console.error(e);
            toast({ title: "Image regeneration failed.", variant: 'destructive'})
        } finally {
            setRegeneratingId(null);
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage your product categories.</p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                                Fill in the details for your new category.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="cat-title">Title</Label>
                                <Input id="cat-title" value={newCategoryTitle} onChange={(e) => setNewCategoryTitle(e.target.value)} placeholder="e.g. Apparel" />
                            </div>
                            <div className="space-y-2">
                                <Label>Image</Label>
                                <div className="flex items-center gap-2">
                                    <div className="w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-32">
                                        {newCategoryImageUrl ? (
                                             <Image src={newCategoryImageUrl} alt="Generated preview" width={80} height={80} className="rounded-md object-cover"/>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Generate an image to see a preview</p>
                                        )}
                                    </div>
                                    <Button size="icon" onClick={handleGenerateImage} disabled={isAiLoading}>
                                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddCategory} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Category
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(category => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <Image src={category.image} alt={category.title} width={40} height={40} className="rounded-md bg-secondary object-cover" />
                                        </TableCell>
                                        <TableCell className="font-medium">{category.title}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                 <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRegenerateImage(category)} disabled={regeneratingId === category.id}>
                                                    {regeneratingId === category.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4" />}
                                                 </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button variant="destructive" size="icon" className="h-8 w-8">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete the category.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
