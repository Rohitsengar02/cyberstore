
"use client"
import Link from 'next/link';
import { Home, ShoppingCart, Package, Users, Plus, LineChart, MessageSquare, Puzzle, FileText, Tag, Settings, Shield, HelpCircle, Palette, FilePlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

const bottomNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/dashboard/products", label: "Products", icon: Package },
    { href: "/admin/dashboard/customers", label: "Customers", icon: Users },
];

const allNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/dashboard/customers", label: "Customers", icon: Users },
    { href: "/admin/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/dashboard/products", label: "Products", icon: Package },
    { href: "/admin/dashboard/integrations", label: "Integrations", icon: Puzzle },
    { href: "/admin/dashboard/analytics", label: "Analytics", icon: LineChart },
    { href: "/admin/dashboard/invoice", label: "Invoice", icon: FileText },
    { href: "/admin/dashboard/discount", label: "Discount", icon: Tag },
    { href: "/admin/dashboard/customize", label: "Customize", icon: Palette },
    { href: "/admin/dashboard/pages", label: "Content Pages", icon: FilePlus },
    { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/admin/dashboard/security", label: "Security", icon: Shield },
    { href: "/admin/dashboard/help", label: "Help", icon: HelpCircle },
];

const AdminMobileBottomBar = () => {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-30">
            <div className="grid grid-cols-5 h-full max-w-lg mx-auto relative">
                {bottomNavItems.slice(0, 2).map(item => (
                    <Link 
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-center font-medium",
                            pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
                
                <div className="flex justify-center items-center">
                   <Sheet>
                        <SheetTrigger asChild>
                             <Button size="icon" className="w-16 h-16 rounded-full absolute -top-8 shadow-lg">
                                <Plus className="h-8 w-8" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl h-[60%]">
                            <SheetHeader>
                                <SheetTitle>All Pages</SheetTitle>
                            </SheetHeader>
                            <nav className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
                                {allNavItems.map(item => (
                                     <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-lg",
                                            pathname === item.href ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary"
                                        )}
                                    >
                                        <item.icon className="h-6 w-6" />
                                        <span className='text-sm text-center'>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {bottomNavItems.slice(2, 4).map(item => (
                     <Link 
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-center font-medium",
                            pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminMobileBottomBar;
