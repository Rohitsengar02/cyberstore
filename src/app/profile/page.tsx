
"use client"

import { ArrowLeft, User, MapPin, Heart, ClipboardList, Bell, CreditCard, ChevronRight, LogOut, Loader2, Camera, Phone, HelpCircle, Shield } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const ProfileContent = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const menuItems = [
        { icon: User, text: "Edit Profile", href: "/profile/edit" },
        { icon: MapPin, text: "Shopping Address", href: "/profile/address" },
        { icon: Heart, text: "Wishlist", href: "/profile/wishlist" },
        { icon: ClipboardList, text: "Order History", href: "/profile/orders" },
        { icon: Bell, text: "Notification", href: "/profile/notifications" },
        { icon: CreditCard, text: "Cards", href: "#" },
        { icon: HelpCircle, text: "Help", href: "/help" },
        { icon: Shield, text: "Privacy Policy", href: "/privacy-policy" },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

     const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <>
            <div className="flex flex-col items-center text-center py-8">
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-pink-400 to-blue-400">
                        <Avatar className="h-28 w-28 border-4 border-background">
                        <AvatarImage src={user?.photoURL || "https://placehold.co/120x120.png"} alt={user?.displayName || "User"} data-ai-hint="woman portrait" />
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                </div>
                <h2 className="text-2xl font-bold mt-4">{user?.displayName || 'Guest'}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <p className="text-sm text-muted-foreground">Active status</p>
                </div>
            </div>

            <Card className="w-full max-w-md rounded-2xl shadow-none border-none">
                <CardContent className="p-2">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => (
                            <li key={item.text}>
                                <Link href={item.href} className="flex items-center p-4 rounded-lg hover:bg-secondary transition-colors">
                                    <item.icon className="h-6 w-6 text-muted-foreground" />
                                    <span className="flex-1 ml-4 font-medium">{item.text}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </Link>
                                {index < menuItems.length - 1 && <Separator className="my-0 mx-4" />}
                            </li>
                        ))}
                            <li>
                            <Separator className="my-0 mx-4" />
                            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start p-4 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive">
                                <LogOut className="h-6 w-6 text-destructive" />
                                <span className="flex-1 ml-4 font-medium">Logout</span>
                            </Button>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </>
    )
}

const AuthContent = () => {
    const { login, register } = useAuth();
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
        } catch (error: any) {
            toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full max-w-md">
             <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleLogin} className="space-y-4">
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
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="register">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="flex flex-col items-center space-y-2">
                                    <Label htmlFor="profile-pic-upload" className="relative cursor-pointer">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={profileImageUrl || "https://placehold.co/96x96.png"} />
                                            <AvatarFallback>PIC</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full">
                                            <Camera className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    </Label>
                                    <Input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
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
                                    <Label htmlFor="register-phone">Phone Number</Label>
                                    <Input id="register-phone" type="tel" placeholder="+1234567890" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} required />
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-secondary/50">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/" className="">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Profile</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 flex flex-col items-center">
               {isLoading ? (
                   <Loader2 className="h-8 w-8 animate-spin" />
               ) : user ? (
                   <ProfileContent />
               ) : (
                   <AuthContent />
               )}
            </main>
        </div>
    );
}

    
