
"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, MoreHorizontal, Eye, Package, User, Truck, CheckCircle, Home, Mail, Phone, MapPin, CreditCard, Edit, Trash2, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';


const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--primary))",
  },
};

const trackingIcons = {
    'Order Placed': Package,
    'Processing': CheckCircle,
    'Shipped': Truck,
    'Delivered': Home,
}

const getStatusColor = (status: Order['status']) => {
    switch(status) {
        case 'Delivered': return 'text-green-500';
        case 'Shipped': return 'text-blue-500';
        case 'Processing': return 'text-purple-500';
        case 'Pending': return 'text-yellow-500';
        case 'Cancelled': return 'text-red-500';
        default: return 'text-gray-500';
    }
}

export default function OrdersPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 6),
        to: new Date(),
    });
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { toast } = useToast();


    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setAllOrders(ordersData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const chartData = useMemo(() => {
        if (!date?.from || !date?.to) return [];

        const ordersInDateRange = allOrders.filter(order => {
            const orderDate = order.createdAt.toDate();
            return orderDate >= date.from! && orderDate <= date.to!;
        });
        
        const data: { [key: string]: { date: string, orders: number } } = {};
        let currentDate = new Date(date.from);

        while(currentDate <= date.to) {
            const formattedDate = format(currentDate, 'yyyy-MM-dd');
            data[formattedDate] = { date: formattedDate, orders: 0 };
            currentDate = addDays(currentDate, 1);
        }

        ordersInDateRange.forEach(order => {
            const formattedDate = format(order.createdAt.toDate(), 'yyyy-MM-dd');
            if(data[formattedDate]) {
                data[formattedDate].orders++;
            }
        });

        return Object.values(data);

    }, [allOrders, date]);


    useEffect(() => {
        let tempOrders = [...allOrders];
        if (activeTab !== 'all') {
            tempOrders = tempOrders.filter(order => order.status.toLowerCase() === activeTab);
        }
        setFilteredOrders(tempOrders);
    }, [allOrders, activeTab]);


    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        if(!selectedOrder) return;

        const orderRef = doc(db, 'orders', orderId);
        
        let newTracking = [...selectedOrder.tracking];
        const today = format(new Date(), 'yyyy-MM-dd');

        const statusMap: Record<Order['status'], number> = {
            'Pending': -1,
            'Processing': 0,
            'Shipped': 1,
            'Delivered': 2,
            'Cancelled': -1, // Not in regular flow
        };
        const newStatusIndex = statusMap[newStatus];

        if (newStatusIndex > -1) {
            newTracking = newTracking.map((step, index) => {
                const stepIndex = statusMap[step.status as Order['status']];
                if (stepIndex > -1 && stepIndex <= newStatusIndex) {
                    return { ...step, completed: true, date: step.date || today };
                }
                return { ...step, completed: false };
            });
        }


        try {
            await updateDoc(orderRef, { status: newStatus, tracking: newTracking });
            toast({ title: "Success", description: "Order status updated." });
            // Update local state to reflect change immediately
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus, tracking: newTracking } : null);
        } catch (error) {
            console.error("Error updating status: ", error);
            toast({ title: "Error", description: "Could not update status.", variant: "destructive"});
        }
    }


    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }


    return (
        <Sheet onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-0 max-w-full overflow-x-hidden">
                <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
                <Card className="w-full">
                     <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl">Total Orders</CardTitle>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                 <Select 
                                    defaultValue="last-week"
                                    onValueChange={(value) => {
                                        const now = new Date();
                                        if (value === 'last-day') setDate({ from: subDays(now, 1), to: now});
                                        if (value === 'last-week') setDate({ from: subDays(now, 6), to: now});
                                        if (value === 'last-month') setDate({ from: startOfMonth(now), to: endOfMonth(now)});
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-auto rounded-full min-w-[120px]">
                                        <SelectValue placeholder="Last Week" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="last-day">Last Day</SelectItem>
                                        <SelectItem value="last-week">Last Week</SelectItem>
                                        <SelectItem value="last-month">Last Month</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full sm:w-[260px] justify-start text-left font-normal rounded-full text-sm",
                                        !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">
                                        {date?.from ? (
                                        date.to ? (
                                            <>
                                            {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                        ) : (
                                        "Pick a date"
                                        )}
                                        </span>
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={1}
                                        className="sm:block"
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6">
                        <div className="h-[200px] sm:h-[300px] w-full">
                             <ChartContainer config={chartConfig} className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                        <defs>
                                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickMargin={8}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            tick={{ fontSize: 12 }}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickMargin={8}
                                            tick={{ fontSize: 12 }}
                                            width={30}
                                        />
                                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Area type="monotone" dataKey="orders" stroke="var(--color-orders)" fillOpacity={1} fill="url(#colorOrders)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader className="pb-4">
                       <div className="w-full">
                            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="overflow-x-auto">
                                    <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:grid-cols-none sm:flex">
                                        <TabsTrigger value="all" className="text-xs sm:text-sm">All Order</TabsTrigger>
                                        <TabsTrigger value="delivered" className="text-xs sm:text-sm">Delivered</TabsTrigger>
                                        <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                                        <TabsTrigger value="processing" className="text-xs sm:text-sm">Processing</TabsTrigger>
                                        <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled</TabsTrigger>
                                    </TabsList>
                                </div>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6">
                         {/* Desktop Table */}
                        <div className="hidden lg:block">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[80px]">ID</TableHead>
                                            <TableHead className="min-w-[120px]">Name</TableHead>
                                            <TableHead className="min-w-[80px]">Payment</TableHead>
                                            <TableHead className="min-w-[80px]">Type</TableHead>
                                            <TableHead className="min-w-[80px]">Status</TableHead>
                                            <TableHead className="min-w-[80px]">Total</TableHead>
                                            <TableHead className="text-right min-w-[60px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                          <SheetTrigger asChild key={order.id}>
                                            <TableRow className="cursor-pointer" onClick={() => handleViewDetails(order)}>
                                                <TableCell className="font-medium">#{order.id.slice(0,6)}...</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={order.customer.photoURL} alt={order.customer.name} />
                                                            <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate">{order.customer.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{order.paymentMethod}</TableCell>
                                                <TableCell>Delivery</TableCell>
                                                <TableCell>
                                                     <span className={cn("px-2 py-1 rounded-full text-xs whitespace-nowrap", getStatusColor(order.status), "bg-opacity-10")}>{order.status}</span>
                                                </TableCell>
                                                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                     <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                          </SheetTrigger>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                         {/* Mobile Cards View */}
                        <div className="lg:hidden space-y-3">
                            {filteredOrders.map((order) => (
                              <SheetTrigger asChild key={order.id}>
                                <Card onClick={() => handleViewDetails(order)} className="p-4 cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={order.customer.photoURL} alt={order.customer.name} />
                                                <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{order.customer.name}</p>
                                                <p className="text-xs text-gray-500">#{order.id.slice(0,6)}...</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Payment:</span>
                                            <span className="ml-1">{order.paymentMethod}</span>
                                        </div>
                                         <div>
                                            <span className="text-gray-500">Total:</span>
                                            <span className="ml-1 font-medium">₹{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center">
                                         <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor(order.status), "bg-opacity-10")}>{order.status}</span>
                                    </div>
                                </Card>
                              </SheetTrigger>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
             {selectedOrder && (
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                    <SheetHeader className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <SheetTitle className="text-xl">Order Details</SheetTitle>
                                <SheetDescription>Order ID: #{selectedOrder.id.slice(0,6)}... - <span className={cn("font-semibold", getStatusColor(selectedOrder.status))}>{selectedOrder.status}</span></SheetDescription>
                            </div>
                             <Badge variant="secondary" className="capitalize">Delivery</Badge>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto space-y-6 p-6">

                        <Card>
                             <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4"/>Customer</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <div className="flex items-center gap-4">
                                     <Avatar className="h-14 w-14">
                                        <AvatarImage src={selectedOrder.customer.photoURL} alt={selectedOrder.customer.name} />
                                        <AvatarFallback>{selectedOrder.customer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{selectedOrder.customer.name}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.customer.email}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.customer.phone}</p>
                                    </div>
                               </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4"/>Order Tracking</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                     <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
                                     {selectedOrder.tracking.map((step, index) => {
                                        const Icon = trackingIcons[step.status as keyof typeof trackingIcons] || Package;
                                        return (
                                        <div key={index} className="flex items-start gap-4 pl-0 mb-6">
                                            <div className="relative z-10">
                                                <div className={cn("p-3 rounded-full", step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-sm font-semibold">{step.status}</p>
                                                <p className="text-xs text-muted-foreground">{step.date}</p>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4"/>Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 py-4">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm">{item.name}</h3>
                                            <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold">{item.price}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4"/>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{selectedOrder.address}</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4"/>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span>{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                     <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>₹0.00</span>
                                </div>
                            </CardContent>
                            <Separator />
                            <CardFooter className="flex justify-between items-center font-bold text-lg pt-4">
                                <span>Total</span>
                                <span>₹{selectedOrder.total.toFixed(2)}</span>
                            </CardFooter>
                        </Card>
                    </div>
                     <SheetFooter className="p-6 mt-auto bg-background border-t">
                        <div className="flex flex-col gap-4 w-full">
                            <div>
                                <Select 
                                defaultValue={selectedOrder.status} 
                                onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value as Order['status'])}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            )}
        </Sheet>
    )
}
