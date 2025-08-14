
"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, PlusCircle, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon, Edit, Sparkles } from "lucide-react";
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { generateBannerImage } from '@/ai/flows/generate-banner-image-flow';
import { Textarea } from '@/components/ui/textarea';

type Banner = {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
    link: string;
};

type HeroCard = {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    price: string;
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


const HeroCustomizationPage = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [cards, setCards] = useState<HeroCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
    const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [editingCard, setEditingCard] = useState<HeroCard | null>(null);
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiBannerDesc, setAiBannerDesc] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);


    const { toast } = useToast();
    
    // Form States
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [bannerImageUrl, setBannerImageUrl] = useState('');
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerDesc, setBannerDesc] = useState('');
    const [bannerPrice, setBannerPrice] = useState('');
    const [bannerLink, setBannerLink] = useState('');

    const [cardImage, setCardImage] = useState<File | null>(null);
    const [cardImageUrl, setCardImageUrl] = useState('');
    const [cardTitle, setCardTitle] = useState('');
    const [cardDesc, setCardDesc] = useState('');
    const [cardPrice, setCardPrice] = useState('');

    useEffect(() => {
        const heroRef = doc(db, 'heroContent', 'main');
        const unsub = onSnapshot(heroRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setBanners(data.banners || []);
                setCards(data.cards || []);
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const resetBannerForm = () => {
        setEditingBanner(null);
        setBannerImage(null);
        setBannerImageUrl('');
        setBannerTitle('');
        setBannerDesc('');
        setBannerPrice('');
        setBannerLink('');
    };
    
    const resetCardForm = () => {
        setEditingCard(null);
        setCardImage(null);
        setCardImageUrl('');
        setCardTitle('');
        setCardDesc('');
        setCardPrice('');
    };

    const handleOpenBannerDialog = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setBannerImageUrl(banner.imageUrl);
            setBannerTitle(banner.title);
            setBannerDesc(banner.description);
            setBannerPrice(banner.price);
            setBannerLink(banner.link);
        } else {
            resetBannerForm();
        }
        setIsBannerDialogOpen(true);
    };
    
    const handleOpenCardDialog = (card?: HeroCard) => {
        if (card) {
            setEditingCard(card);
            setCardImageUrl(card.imageUrl);
            setCardTitle(card.title);
            setCardDesc(card.description);
            setCardPrice(card.price);
        } else {
            resetCardForm();
        }
        setIsCardDialogOpen(true);
    };

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

    const handleSaveBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        let finalImageUrl = bannerImageUrl;
        
        if (bannerImage) {
            finalImageUrl = await handleImageUpload(bannerImage) || '';
        }
        
        if (!finalImageUrl) {
            toast({ title: 'Image is required', variant: 'destructive' });
            setIsSaving(false);
            return;
        }

        const newBanner: Banner = {
            id: editingBanner?.id || Date.now().toString(),
            imageUrl: finalImageUrl,
            title: bannerTitle,
            description: bannerDesc,
            price: bannerPrice,
            link: bannerLink
        };

        const updatedBanners = editingBanner
            ? banners.map(b => b.id === editingBanner.id ? newBanner : b)
            : [...banners, newBanner];
        
        try {
            await setDoc(doc(db, 'heroContent', 'main'), { banners: updatedBanners, cards }, { merge: true });
            toast({ title: 'Banner saved!' });
            setIsBannerDialogOpen(false);
            resetBannerForm();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error saving banner', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
     const handleSaveCard = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        let finalImageUrl = cardImageUrl;
        
        if (cardImage) {
            finalImageUrl = await handleImageUpload(cardImage) || '';
        }

        if (!finalImageUrl) {
            toast({ title: 'Image is required', variant: 'destructive' });
            setIsSaving(false);
            return;
        }

        const newCard: HeroCard = {
            id: editingCard?.id || Date.now().toString(),
            imageUrl: finalImageUrl,
            title: cardTitle,
            description: cardDesc,
            price: cardPrice
        };

        const updatedCards = editingCard
            ? cards.map(c => c.id === editingCard.id ? newCard : c)
            : [...cards, newCard];
        
        try {
            await setDoc(doc(db, 'heroContent', 'main'), { banners, cards: updatedCards }, { merge: true });
            toast({ title: 'Card saved!' });
            setIsCardDialogOpen(false);
            resetCardForm();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error saving card', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        const updatedBanners = banners.filter(b => b.id !== id);
        await setDoc(doc(db, 'heroContent', 'main'), { banners: updatedBanners }, { merge: true });
        toast({ title: 'Banner deleted' });
    };

    const handleDeleteCard = async (id: string) => {
        const updatedCards = cards.filter(c => c.id !== id);
        await setDoc(doc(db, 'heroContent', 'main'), { cards: updatedCards }, { merge: true });
        toast({ title: 'Card deleted' });
    };

    const handleGenerateImage = async () => {
        if (!aiBannerDesc) {
            toast({ title: "Please enter a description", variant: "destructive" });
            return;
        }
        setIsAiLoading(true);
        try {
            const result = await generateBannerImage({ bannerDescription: aiBannerDesc });
            const blob = dataUriToBlob(result.imageDataUri);
            const file = new File([blob], `${aiBannerDesc.substring(0, 20)}.png`, { type: 'image/png' });
            
            setBannerImage(file);
            setBannerImageUrl(URL.createObjectURL(file));

            toast({ title: "Image generated successfully!" });
            setIsAiDialogOpen(false);
        } catch(e) {
            console.error(e);
            toast({ title: "Image generation failed.", variant: 'destructive' });
        } finally {
            setIsAiLoading(false);
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/dashboard/customize">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Customize Hero Section</h1>
            </div>

            {/* Banner Management */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Hero Banners (Carousel)</CardTitle>
                        <CardDescription>Manage the main rotating banners on the homepage.</CardDescription>
                    </div>
                    <Dialog open={isBannerDialogOpen} onOpenChange={(isOpen) => { setIsBannerDialogOpen(isOpen); if (!isOpen) resetBannerForm(); }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenBannerDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingBanner ? 'Edit' : 'Add'} Hero Banner</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveBanner} className="space-y-4">
                                <div>
                                    <Label>Banner Image</Label>
                                    <div className="flex gap-2 items-start">
                                        <div className="w-full">
                                            <Input type="file" onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : null;
                                                setBannerImage(file);
                                                if (file) setBannerImageUrl(URL.createObjectURL(file));
                                            }} />
                                            {bannerImageUrl && <Image src={bannerImageUrl} alt="Banner preview" width={800} height={400} className="w-full h-auto rounded-md mt-2" />}
                                        </div>
                                         <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="icon" type="button" variant="outline"><Sparkles className="h-4 w-4"/></Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Generate Banner Image</DialogTitle>
                                                    <DialogDescription>Describe the main object for the banner.</DialogDescription>
                                                </DialogHeader>
                                                <Textarea placeholder="e.g., a stylish leather handbag" value={aiBannerDesc} onChange={(e) => setAiBannerDesc(e.target.value)} />
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleGenerateImage} disabled={isAiLoading}>
                                                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Generate'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                                <Input placeholder="Title" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} required />
                                <Input placeholder="Description" value={bannerDesc} onChange={e => setBannerDesc(e.target.value)} required />
                                <Input placeholder="Price Text (e.g., $69.99/-)" value={bannerPrice} onChange={e => setBannerPrice(e.target.value)} required />
                                <Input placeholder="Link URL" value={bannerLink} onChange={e => setBannerLink(e.target.value)} required />
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsBannerDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-2">
                    {banners.map(banner => (
                        <div key={banner.id} className="flex items-center gap-4 p-2 border rounded-lg">
                            <Image src={banner.imageUrl} alt={banner.title} width={80} height={40} className="rounded-md object-cover" />
                            <span className="flex-grow font-medium">{banner.title}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenBannerDialog(banner)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(banner.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Card Management */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Hero Cards</CardTitle>
                        <CardDescription>Manage the smaller cards next to the main banner.</CardDescription>
                    </div>
                     <Dialog open={isCardDialogOpen} onOpenChange={(isOpen) => { setIsCardDialogOpen(isOpen); if (!isOpen) resetCardForm(); }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenCardDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Card
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCard ? 'Edit' : 'Add'} Hero Card</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveCard} className="space-y-4">
                                <Input type="file" onChange={(e) => {
                                    const file = e.target.files ? e.target.files[0] : null;
                                    setCardImage(file);
                                    if(file) setCardImageUrl(URL.createObjectURL(file));
                                }} />
                                {cardImageUrl && <Image src={cardImageUrl} alt="Card preview" width={200} height={200} className="w-full h-auto rounded-md" />}
                                <Input placeholder="Title" value={cardTitle} onChange={e => setCardTitle(e.target.value)} required />
                                <Input placeholder="Description" value={cardDesc} onChange={e => setCardDesc(e.target.value)} required />
                                <Input placeholder="Price Text (e.g., $46.99/-)" value={cardPrice} onChange={e => setCardPrice(e.target.value)} required />
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCardDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-2">
                    {cards.map(card => (
                        <div key={card.id} className="flex items-center gap-4 p-2 border rounded-lg">
                            <Image src={card.imageUrl} alt={card.title} width={50} height={50} className="rounded-md object-cover" />
                            <span className="flex-grow font-medium">{card.title}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenCardDialog(card)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default HeroCustomizationPage;
