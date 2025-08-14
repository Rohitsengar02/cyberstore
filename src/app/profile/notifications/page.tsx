
import { ArrowLeft, Tag, CheckCircle, Truck, Gift } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const notifications = [
    {
        icon: Tag,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "30% Special Discount!",
        description: "Special promotion only valid today.",
        time: "1h ago",
    },
    {
        icon: CheckCircle,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        title: "Order Successful",
        description: "You have successfully placed an order. Track your order now.",
        time: "5h ago",
    },
    {
        icon: Truck,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        title: "Order in Delivery",
        description: "Your order is on its way to your address.",
        time: "1d ago",
    },
     {
        icon: Gift,
        iconBg: "bg-pink-100",
        iconColor: "text-pink-600",
        title: "New Services Available!",
        description: "Now you can send gifts to your friends.",
        time: "2d ago",
    },
];

export default function NotificationsPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-secondary/50">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/profile">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Profile</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Notifications</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1">
                <Card className="rounded-none border-none shadow-none bg-transparent">
                    <CardContent className="p-0">
                        <ul className="space-y-1">
                            {notifications.map((item, index) => (
                                <li key={index} className="bg-background">
                                    <div className="flex items-start gap-4 p-4">
                                        <div className={`p-3 rounded-full ${item.iconBg}`}>
                                            <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{item.time}</p>
                                    </div>
                                    {index < notifications.length - 1 && <Separator />}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
