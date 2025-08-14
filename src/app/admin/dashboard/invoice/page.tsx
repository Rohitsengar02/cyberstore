
"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, User, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';


const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Delivered': return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>; // Assuming Delivered means Paid
        case 'Pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'Cancelled': return <Badge variant="destructive">Cancelled</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function InvoicePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(ordersData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    
    const handleDownload = (order: Order) => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Invoice", 14, 22);
        doc.setFontSize(12);
        doc.text(`Invoice ID: INV-${order.id.slice(0,8)}`, 14, 32);
        doc.text(`Order ID: #${order.id.slice(0,6)}...`, 14, 38);
        doc.text(`Date: ${new Date(order.createdAt.toDate()).toLocaleDateString()}`, 14, 44);

        doc.setFontSize(14);
        doc.text("Billed To:", 14, 60);
        doc.setFontSize(12);
        doc.text(order.customer.name, 14, 68);
        doc.text(order.address, 14, 74);

        doc.setFontSize(14);
        doc.text("From:", 150, 60);
        doc.setFontSize(12);
        doc.text("NoirCart", 150, 68);
        doc.text("456 Market Ave", 150, 74);
        doc.text("Commerce City, World", 150, 80);

        const tableColumn = ["Item", "Quantity", "Price", "Total"];
        const tableRows: any[] = [];

        order.items.forEach(item => {
            const itemTotal = parseFloat(item.price.replace(/[^0-9.-]+/g,"")) * item.quantity;
            const itemData = [
                item.name,
                item.quantity,
                item.price,
                `₹${itemTotal.toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        (doc as any).autoTable({
            startY: 90,
            head: [tableColumn],
            body: tableRows,
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.text(`Total: ₹${order.total.toFixed(2)}`, 150, finalY + 10);
        
        doc.setFontSize(10);
        doc.text("Thank you for your business!", 14, doc.internal.pageSize.height - 10);

        doc.save(`invoice-${order.id.slice(0,8)}.pdf`);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Invoices</h1>
            
            {/* Desktop Table View */}
            <Card className="hidden md:block">
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">INV-{order.id.slice(0,8)}</TableCell>
                                        <TableCell>#{order.id.slice(0,6)}...</TableCell>
                                        <TableCell>{order.customer.name}</TableCell>
                                        <TableCell>{new Date(order.createdAt.toDate()).toLocaleDateString()}</TableCell>
                                        <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleDownload(order)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">INV-{order.id.slice(0,8)}</CardTitle>
                                    <p className="text-sm text-muted-foreground">#{order.id.slice(0,6)}...</p>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{order.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(order.createdAt.toDate()).toLocaleDateString()}</span>
                            </div>
                             <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                             <Button variant="outline" className="w-full" onClick={() => handleDownload(order)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Invoice
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

    