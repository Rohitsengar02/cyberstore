
"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, PlusCircle, MoreHorizontal, Tag, Percent, Zap, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export type Discount = {
    id: string;
    code: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    status: 'Active' | 'Expired' | 'Scheduled';
    usage?: number; // Made optional as it might not exist on new discounts
};


export default function DiscountPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state for new discount
    const [newCode, setNewCode] = useState('');
    const [newType, setNewType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
    const [newValue, setNewValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot(collection(db, "discounts"), (snapshot) => {
            const discountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount));
            setDiscounts(discountsData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateDiscount = async () => {
        if (!newCode || !newValue) {
            toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            await addDoc(collection(db, "discounts"), {
                code: newCode,
                type: newType,
                value: Number(newValue),
                status: 'Active',
                usage: 0,
                createdAt: new Date(),
            });
            toast({ title: "Success", description: "Discount created successfully!" });
            setIsDialogOpen(false);
            setNewCode('');
            setNewType('Percentage');
            setNewValue('');
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not create discount.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDiscount = async (discountId: string) => {
        try {
            await deleteDoc(doc(db, "discounts", discountId));
            toast({ title: "Success", description: "Discount deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Could not delete discount.", variant: "destructive"});
        }
    };


    const getStatusBadge = (status: Discount['status']) => {
        switch (status) {
            case 'Active': return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
            case 'Expired': return <Badge variant="destructive">Expired</Badge>;
            case 'Scheduled': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
        }
    };

    const formatValue = (type: Discount['type'], value: number) => {
        return type === 'Percentage' ? `${value}%` : `₹${value.toFixed(2)}`;
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Discounts</h1>
                    <p className="text-muted-foreground">Create and manage your promotional codes.</p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Discount
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Create New Discount</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new discount code.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" placeholder="e.g. SUMMER20" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                 <Select value={newType} onValueChange={(value) => setNewType(value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Percentage">Percentage</SelectItem>
                                        <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <Input id="value" type="number" placeholder="e.g. 20 or 10" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateDiscount} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Create Discount
                        </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Discounts</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Times Used</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.map(discount => (
                                    <TableRow key={discount.id}>
                                        <TableCell className="font-medium">{discount.code}</TableCell>
                                        <TableCell>{discount.type}</TableCell>
                                        <TableCell>{formatValue(discount.type, discount.value)}</TableCell>
                                        <TableCell>{getStatusBadge(discount.status)}</TableCell>
                                        <TableCell>{discount.usage || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteDiscount(discount.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {discounts.map(discount => (
                             <Card key={discount.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{discount.code}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{discount.type}</p>
                                        </div>
                                        {getStatusBadge(discount.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                        <span>Value: <span className="font-semibold">{formatValue(discount.type, discount.value)}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        <span>Used: <span className="font-semibold">{discount.usage || 0} times</span></span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                     <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDiscount(discount.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

