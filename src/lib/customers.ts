
import type { Order } from './types';
import type { User } from 'firebase/auth';

export type CustomerData = User & {
    id: string;
    stats: {
        totalOrders: number;
        totalSpent: number;
    };
    recentOrders: Order[];
    status: 'Active' | 'Inactive'; // Example status
};
