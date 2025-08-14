
"use client"

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const AuthDialog = () => {
    const { isAuthDialogOpen, setIsAuthDialogOpen, login, register } = useAuth();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(loginEmail, loginPassword);
            toast({ title: 'Login Successful' });
            setIsAuthDialogOpen(false);
        } catch (error: any) {
            toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfileImageUrl(URL.createObjectURL(file));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerPassword !== confirmPassword) {
            toast({ title: 'Registration Failed', description: "Passwords do not match.", variant: 'destructive' });
            return;
        }
        if (!profileImage) {
            toast({ title: 'Registration Failed', description: "Please upload a profile picture.", variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            let photoURL = '';
            if (profileImage) {
                 const formData = new FormData();
                formData.append('file', profileImage);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio');

                const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                photoURL = data.secure_url;
            }

            await register(registerEmail, registerPassword, registerName, photoURL, registerPhone);
            toast({ title: 'Registration Successful' });
            setIsAuthDialogOpen(false);
        } catch (error: any) {
            toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Welcome</DialogTitle>
                    <DialogDescription className="text-center">
                        Please login or create an account to continue.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" placeholder="m@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4 pt-4">
                            <div className="flex flex-col items-center space-y-2">
                                <Label htmlFor="profile-pic-upload-dialog" className="relative cursor-pointer">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profileImageUrl || "https://placehold.co/96x96.png"} />
                                        <AvatarFallback>PIC</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full">
                                        <Camera className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                </Label>
                                <Input id="profile-pic-upload-dialog" type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-name">Full Name</Label>
                                <Input id="register-name" placeholder="John Doe" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input id="register-email" type="email" placeholder="m@example.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="register-phone-dialog">Phone Number</Label>
                                <Input id="register-phone-dialog" type="tel" placeholder="+1234567890" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <Input id="register-password" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AuthDialog;

    