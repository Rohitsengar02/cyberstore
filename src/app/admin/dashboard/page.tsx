
'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  ShoppingBag,
  Calendar,
  ChevronRight,
  Eye,
  Package,
  Star,
  Truck,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Info,
  Settings,
  Tag,
  Palette,
  GripVertical
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Product } from '@/lib/types';
import type { Review } from '@/app/admin/dashboard/reviews/page';
import Link from 'next/link';
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AdminDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
      setAllOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setAllProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setAllCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubReviews = onSnapshot(query(collection(db, "reviews"), orderBy("createdAt", "desc")), (snapshot) => {
      setAllReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });
    setIsLoading(false);

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
      unsubReviews();
    }
  }, []);

  const {
    filteredOrders,
    filteredCustomers,
    filteredReviews,
    totalRevenue,
    totalOrders,
    totalCustomers
  } = useMemo(() => {
    const fromDate = date?.from;
    const toDate = date?.to;

    const filterByDate = (items: any[]) => {
      if (!fromDate || !toDate) return items;
      return items.filter(item => {
        const itemDate = item.createdAt?.toDate();
        if (!itemDate) return false;
        return itemDate >= fromDate && itemDate <= toDate;
      });
    };
    
    const currentOrders = filterByDate(allOrders);
    const currentCustomers = filterByDate(allCustomers);
    const currentReviews = filterByDate(allReviews);

    const revenue = currentOrders
      .filter(o => o.status === 'Delivered')
      .reduce((acc, order) => acc + order.total, 0);

    return {
      filteredOrders: currentOrders,
      filteredCustomers: currentCustomers,
      filteredReviews: currentReviews,
      totalRevenue: revenue,
      totalOrders: currentOrders.length,
      totalCustomers: currentCustomers.length,
    }
  }, [date, allOrders, allCustomers, allReviews]);


  const totalProducts = allProducts.length;

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000) {
      return `₹${(revenue / 1000).toFixed(1)}K`;
    }
    return `₹${revenue.toFixed(2)}`;
  }

  const stats = [
    { 
      title: "Total Revenue", 
      value: formatRevenue(totalRevenue),
      icon: DollarSign, 
      gradient: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-200",
      change: "+12.5%",
      changeType: "up"
    },
    { 
      title: "Products", 
      value: totalProducts, 
      icon: Package, 
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-200",
      change: "+8.2%",
      changeType: "up"
    },
    { 
      title: "Orders", 
      value: totalOrders, 
      icon: ShoppingBag, 
      gradient: "from-red-500 to-red-600",
      shadowColor: "shadow-red-200",
      change: "-3.1%",
      changeType: "down"
    },
    { 
      title: "Customers", 
      value: totalCustomers, 
      icon: Users, 
      gradient: "from-orange-500 to-orange-600",
      shadowColor: "shadow-orange-200",
      change: "+15.8%",
      changeType: "up"
    }
  ];

  const recentActivities = [
    ...filteredOrders.slice(0, 3).map(o => ({
        id: o.id,
        type: "New Order Placed",
        description: `Order #${o.id.slice(0,6)} from ${o.customer.name}`,
        time: o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleTimeString() : 'N/A',
        color: "bg-green-500",
        icon: ShoppingBag
    })),
    ...filteredReviews.slice(0, 3).map(r => ({
        id: r.id,
        type: "New Customer Review",
        description: `${r.rating}-star review from ${r.userName}`,
        time: r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleTimeString() : 'N/A',
        color: "bg-yellow-500",
        icon: Star
    }))
  ].sort((a:any, b:any) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Delivered': return "bg-green-500";
        case 'Processing': return "bg-blue-500";
        case 'Shipped': return "bg-purple-500";
        case 'Pending': return "bg-yellow-500";
        case 'Cancelled': return "bg-red-500";
        default: return "bg-gray-500";
    }
  }

  const getRelatedProducts = (ids: string[] = []) => {
      return allProducts.filter(p => ids.includes(p.id));
  }


  return (
    <Sheet>
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal shadow-sm",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <DatePickerCalendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
      </div>

      {isLoading ? <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br ${stat.gradient} text-white border-0 shadow-lg ${stat.shadowColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />
                    <div className="flex items-center gap-1">
                    {stat.changeType === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">{stat.change}</span>
                    </div>
                </div>
                <div className="text-xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80 text-xs sm:text-sm font-medium">{stat.title}</div>
                </CardContent>
            </Card>
            ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Left Column */}
            <div className="xl:col-span-3 space-y-6">
            
            {/* Sales Overview */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Sales Overview</CardTitle>
                    <p className="text-sm text-gray-600">Performance for the selected period</p>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-1">
                    <div className="text-3xl font-bold text-gray-900 mb-2">₹{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <p className="text-sm text-gray-600 mb-4">Total Revenue</p>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{totalOrders}</div>
                    <p className="text-sm text-gray-600 mb-6">Total Orders</p>
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6">
                        <Link href="/admin/dashboard/analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        VIEW FULL REPORT
                        </Link>
                    </Button>
                    </div>
                    <div className="lg:col-span-2 h-80">
                    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 flex items-end justify-center">
                        <svg viewBox="0 0 400 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="mainChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
                            </linearGradient>
                            <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6"/>
                              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1"/>
                            </linearGradient>
                          </defs>
                          
                          {/* Grid lines */}
                          <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
                            {[40, 80, 120, 160].map((y) => (
                              <line key={y} x1="0" y1={y} x2="400" y2={y} />
                            ))}
                          </g>
                          
                          {/* Sales area chart */}
                          <path 
                            d="M 0,160 L 33,140 L 66,150 L 99,120 L 132,125 L 165,100 L 198,95 L 231,110 L 264,105 L 297,85 L 330,80 L 363,75 L 400,70 L 400,200 L 0,200 Z" 
                            fill="url(#mainChartGradient)" 
                          />
                          
                          {/* Orders area chart */}
                          <path 
                            d="M 0,170 L 33,155 L 66,165 L 99,145 L 132,150 L 165,135 L 198,130 L 231,140 L 264,135 L 297,125 L 330,120 L 363,115 L 400,110 L 400,200 L 0,200 Z" 
                            fill="url(#ordersGradient)" 
                          />
                          
                          {/* Sales line */}
                          <path 
                            d="M 0,160 L 33,140 L 66,150 L 99,120 L 132,125 L 165,100 L 198,95 L 231,110 L 264,105 L 297,85 L 330,80 L 363,75 L 400,70" 
                            fill="none" 
                            stroke="#8b5cf6" 
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Orders line */}
                          <path 
                            d="M 0,170 L 33,155 L 66,165 L 99,145 L 132,150 L 165,135 L 198,130 L 231,140 L 264,135 L 297,125 L 330,120 L 363,115 L 400,110" 
                            fill="none" 
                            stroke="#ec4899" 
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Month labels */}
                          <g className="text-xs fill-gray-500">
                            <text x="0" y="195" textAnchor="start">Jan</text>
                            <text x="66" y="195" textAnchor="middle">Mar</text>
                            <text x="132" y="195" textAnchor="middle">May</text>
                            <text x="198" y="195" textAnchor="middle">Jul</text>
                            <text x="264" y="195" textAnchor="middle">Sep</text>
                            <text x="330" y="195" textAnchor="middle">Nov</text>
                            <text x="400" y="195" textAnchor="end">Dec</text>
                          </g>
                        </svg>
                    </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Sales Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Orders</span>
                        </div>
                    </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Top Selling Products</CardTitle>
                    <Button variant="ghost" size="sm" className="text-purple-600" asChild>
                    <Link href="/admin/dashboard/products">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                    </Button>
                </div>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {allProducts.slice(0, 5).map((product, index) => (
                    <SheetTrigger asChild key={product.id}>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-600">{product.inventory?.stock || 0} in stock</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="font-bold text-gray-900">₹{product.pricing.offered.toLocaleString()}</div>
                        </div>
                        </div>
                    </div>
                    </SheetTrigger>
                    ))}
                </div>
                </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{activity.type}</div>
                        <div className="text-gray-600 text-sm">{activity.description}</div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</div>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
            
            {/* Analytics Donut Chart */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-6">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    
                    {/* Sales segment */}
                    <circle 
                        cx="64" 
                        cy="64" 
                        r="56" 
                        stroke="#8b5cf6" 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray="175.9" // 50%
                        strokeDashoffset="0"
                        className="transition-all duration-1000"
                    />
                    
                    {/* Orders segment */}
                    <circle 
                        cx="64" 
                        cy="64" 
                        r="56" 
                        stroke="#ec4899" 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray="123.13" // 35%
                        strokeDashoffset="-175.9"
                        className="transition-all duration-1000"
                    />
                    
                    {/* Returns segment */}
                    <circle 
                        cx="64" 
                        cy="64" 
                        r="56" 
                        stroke="#f97316" 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray="52.77" // 15%
                        strokeDashoffset="-299.03"
                        className="transition-all duration-1000"
                    />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-gray-900">85%</div>
                    <div className="text-xs text-gray-600">Conversion</div>
                    </div>
                </div>
                
                <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Online Sales</span>
                    </div>
                    <span className="text-sm font-medium">50%</span>
                    </div>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">In-Store</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Returns</span>
                    </div>
                    <span className="text-sm font-medium">15%</span>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Order Status */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" className="text-purple-600" asChild>
                    <Link href="/admin/dashboard/orders"><Eye className="h-4 w-4" /></Link>
                    </Button>
                </div>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {filteredOrders.slice(0, 5).map((order, index) => (
                    <SheetTrigger asChild key={order.id}>
                    <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm text-gray-900">#{order.id.slice(0,6)}...</div>
                        <Badge className={`${getStatusColor(order.status)} text-white text-xs px-2 py-1`}>
                            {order.status}
                        </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">{order.customer.name}</div>
                        <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{order.address.split(',').pop()?.trim()}</span>
                        <span className="text-sm font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                    </SheetTrigger>
                    ))}
                </div>
                <Button variant="outline" className="w-full mt-4 text-purple-600 border-purple-200 hover:bg-purple-50" asChild>
                    <Link href="/admin/dashboard/orders">
                        View All Orders
                    </Link>
                </Button>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Page Views</span>
                    </div>
                    <span className="font-bold text-gray-900">24.5K</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">New Users</span>
                    </div>
                    <span className="font-bold text-gray-900">{totalCustomers}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Bounce Rate</span>
                    </div>
                    <span className="font-bold text-gray-900">23.8%</span>
                </div>
                </CardContent>
            </Card>
            </div>
        </div>
        </>
        }
        </div>
        {selectedProduct && (
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                <div className="relative aspect-video w-full">
                    <Image
                        src={selectedProduct.mainImage || 'https://placehold.co/600x400.png'}
                        alt={selectedProduct.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <SheetHeader className="p-6">
                    <div>
                        <SheetTitle className="text-2xl">{selectedProduct.title}</SheetTitle>
                        <SheetDescription>SKU: {selectedProduct.sku || 'N/A'}</SheetDescription>
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto space-y-6 p-6 pt-0">
                    
                    <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8']} className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-semibold"><Info className="mr-2"/> General</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-1">Short Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.shortDesc}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-1">Long Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.longDesc}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <SheetFooter className="p-6 mt-auto bg-background border-t">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/dashboard/products/edit/${selectedProduct.id}`}>
                            Edit Product
                        </Link>
                    </Button>
                </SheetFooter>
            </SheetContent>
        )}
         {selectedOrder && (
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <SheetTitle className="text-xl">Order Details</SheetTitle>
                            <SheetDescription>Order ID: #{selectedOrder.id.slice(0,6)}... - <span className={cn("font-semibold", getStatusColor(selectedOrder.status))}>{selectedOrder.status}</span></SheetDescription>
                        </div>
                    </div>
                </SheetHeader>
                 <div className="flex-1 overflow-y-auto space-y-6 p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Package className="mr-2"/>Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedOrder.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 py-2">
                                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary">
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
                </div>
                 <SheetFooter className="p-6 mt-auto bg-background border-t">
                     <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/dashboard/orders`}>
                            View All Orders
                        </Link>
                    </Button>
                </SheetFooter>
            </SheetContent>
        )}
    </Sheet>
  );
}

