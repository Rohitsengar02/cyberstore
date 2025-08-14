
"use client"
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { ChevronRight, Mail, MapPin, Phone, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import type { Order } from '@/lib/types';
import type { CustomerData as Customer } from '@/lib/customers';


export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomersAndOrders = async () => {
            setIsLoading(true);
            const usersRef = collection(db, "users");
            const ordersRef = collection(db, "orders");

            const [usersSnapshot, ordersSnapshot] = await Promise.all([
                getDocs(usersRef),
                getDocs(ordersRef)
            ]);

            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as User & {id: string}));
            const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

            const customersWithStats = usersData.map(user => {
                const userOrders = ordersData.filter(order => order.userId === user.uid);
                const totalSpent = userOrders.reduce((acc, order) => acc + order.total, 0);
                
                return {
                    ...user,
                    stats: {
                        totalOrders: userOrders.length,
                        totalSpent: totalSpent
                    },
                    recentOrders: userOrders.slice(0, 3),
                    status: 'Active' // Placeholder status
                } as Customer;
            });
            
            setCustomers(customersWithStats);
            setIsLoading(false);
        };
        
        fetchCustomersAndOrders();
    }, []);


    const handleViewDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }


    return (
        <Sheet>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Customers</h1>
                        <p className="text-muted-foreground">Manage your customer base.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search customers..." className="pl-10 rounded-lg w-full" />
                        </div>
                        <Select defaultValue="all-status">
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-status">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="sort-newest">
                            <SelectTrigger className="w-auto">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sort-newest">Newest</SelectItem>
                                <SelectItem value="sort-oldest">Oldest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customers.map((customer) => (
                        <Card key={customer.id} className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-secondary">
                                    <AvatarImage src={customer.photoURL || undefined} alt={customer.displayName || ''} />
                                    <AvatarFallback>{(customer.displayName || 'U').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-semibold">{customer.displayName}</h3>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                                <div className="mt-4">
                                     <Badge variant={customer.status === 'Active' ? 'secondary' : 'destructive'} className="capitalize">
                                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${customer.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {customer.status}
                                    </Badge>
                                </div>
                                <SheetTrigger asChild>
                                    <Button className="mt-6 w-full rounded-full" onClick={() => handleViewDetails(customer)}>
                                        View Detail
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                            </CardContent>
                             <CardFooter className="p-4 pt-0">
                                <div className="flex justify-end gap-2 w-full">
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {selectedCustomer && (
                <SheetContent className="w-full sm:max-w-md p-0">
                    <SheetHeader className="p-6">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-16 w-16 border-4 border-secondary">
                                <AvatarImage src={selectedCustomer.photoURL || undefined} alt={selectedCustomer.displayName || ''} />
                                <AvatarFallback>{(selectedCustomer.displayName || 'U').charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle className="text-2xl">{selectedCustomer.displayName}</SheetTitle>
                                <SheetDescription>{selectedCustomer.email}</SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="space-y-6 p-6 overflow-y-auto h-[calc(100%-120px)]">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Customer Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2 rounded-lg bg-secondary">
                                    <p className="text-xs text-muted-foreground">Total Orders</p>
                                    <p className="text-xl font-bold">{selectedCustomer.stats.totalOrders}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-secondary">
                                    <p className="text-xs text-muted-foreground">Total Spent</p>
                                    <p className="text-xl font-bold">₹{selectedCustomer.stats.totalSpent.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="text-base">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedCustomer.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedCustomer.phoneNumber}</span>
                                </div>
                                {selectedCustomer.recentOrders[0]?.address &&
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                        <span>{selectedCustomer.recentOrders[0].address}</span>
                                    </div>
                                }
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="text-base">Recent Orders</CardTitle>
                            </CardHeader>
                             <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCustomer.recentOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.id.slice(0,6)}...</TableCell>
                                                <TableCell>{new Date(order.createdAt.toDate()).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                             </CardContent>
                        </Card>
                    </div>
                </SheetContent>
            )}
        </Sheet>
    )
}
