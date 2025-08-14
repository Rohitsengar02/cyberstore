
"use client"
import Link from "next/link";
import { Home, ShoppingCart, Package, Users, LineChart, X, Puzzle, FileText, Tag, Settings, HelpCircle, Palette, FilePlus, LogOut, LayoutGrid, Star } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navGroups = [
    {
        title: "MAIN",
        items: [
            { href: "/admin/dashboard", label: "Dashboard", icon: Home },
            { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
            { href: "/admin/dashboard/customers", label: "Customers", icon: Users },
            { href: "/admin/dashboard/reviews", label: "Reviews", icon: Star },
        ]
    },
    {
        title: "TOOLS",
        items: [
            { href: "/admin/dashboard/products", label: "Products", icon: Package },
            { href: "/admin/dashboard/categories", label: "Categories", icon: LayoutGrid },
            { href: "/admin/dashboard/analytics", label: "Analytics", icon: LineChart },
            { href: "/admin/dashboard/invoice", label: "Invoice", icon: FileText },
            { href: "/admin/dashboard/discount", label: "Discount", icon: Tag },
            { href: "/admin/dashboard/customize", label: "Customize", icon: Palette },
            { href: "/admin/dashboard/pages", label: "Content Pages", icon: FilePlus },
        ]
    },
    {
        title: "SETTINGS",
        items: [
            { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
            { href: "/admin/dashboard/help", label: "Help & Q/A", icon: HelpCircle },
        ]
    }
]

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/admin/login');
        } catch (error) {
            console.error("Error signing out: ", error);
            // Optionally, show a toast notification on error
        }
    };

    return (
        <aside className="w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto">
                {navGroups.map(group => (
                    <div key={group.title}>
                        <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider px-3 mb-2">{group.title}</h3>
                        <div className="space-y-1">
                            {group.items.map(item => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-secondary hover:text-primary font-medium",
                                        (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))) && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="mt-6">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </Button>
            </div>
        </aside>
    )
}
