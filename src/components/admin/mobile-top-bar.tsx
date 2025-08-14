
"use client"
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
    onMenuClick: () => void;
}

const AdminMobileTopBar = ({ onMenuClick }: Props) => {
    return (
        <header className="md:hidden sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b h-16 flex items-center px-4">
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
            </Button>
            <h1 className="text-lg font-bold mx-auto">Dashboard</h1>
            <div className="w-8"></div>
        </header>
    );
};

export default AdminMobileTopBar;
