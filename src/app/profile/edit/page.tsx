
"use client"
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";


export default function EditProfilePage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoURL, setPhotoURL] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setPhotoURL(user.photoURL || '');
        }
    }, [user]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoURL(URL.createObjectURL(file));
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        let newPhotoURL = user.photoURL;

        try {
            // Upload new photo if selected
            if (photoFile) {
                const storageRef = ref(storage, `profile_pictures/${user.uid}`);
                const snapshot = await uploadBytes(storageRef, photoFile);
                newPhotoURL = await getDownloadURL(snapshot.ref);
            }

            // Update Firebase Auth profile
            await updateProfile(auth.currentUser!, {
                displayName: displayName,
                photoURL: newPhotoURL,
            });

            // Update Firestore user document
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                displayName: displayName,
                photoURL: newPhotoURL,
            });

            toast({ title: "Profile updated successfully!" });
            router.push('/profile');

        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    if (isAuthLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    
    if (!user) {
        router.push('/profile');
        return null;
    }


    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/profile">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Profile</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Edit Profile</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 flex flex-col items-center">
                <div className="w-full max-w-md space-y-8">
                    <form onSubmit={handleSaveChanges} className="space-y-6">
                         <div className="flex flex-col items-center text-center py-8">
                            <div className="relative">
                                <label htmlFor="photo-upload" className="cursor-pointer">
                                    <Avatar className="h-32 w-32">
                                        <AvatarImage src={photoURL} alt={displayName} />
                                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                    </Avatar>
                                     <div className="absolute bottom-1 right-1 p-1 bg-primary rounded-full border-2 border-background">
                                        <Camera className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                </label>
                                 <Input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={user.email || ''} disabled />
                        </div>
                        <Button type="submit" size="lg" className="w-full rounded-full" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Save Changes'}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}
