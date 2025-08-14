
export type Product = {
    id: string;
    name: string;
    sku: string;
    image: string;
    price: number;
    stock: number;
    views: number;
    status: 'Active' | 'Inactive';
};

export const products: Product[] = [
    {
        id: '1',
        name: 'Gabriela Cashmere Blazer',
        sku: 'T14116',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 1113,
        views: 14012,
        status: 'Active',
    },
    {
        id: '2',
        name: 'Loewe blend Jacket - Blue',
        sku: 'T14136',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 721,
        views: 13212,
        status: 'Active',
    },
    {
        id: '3',
        name: 'Sandro - Jacket - Black',
        sku: 'T14136',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 407,
        views: 8201,
        status: 'Active',
    },
    {
        id: '4',
        name: 'Adidas By Stella McCartney',
        sku: 'T14116',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 1203,
        views: 1002,
        status: 'Active',
    },
    {
        id: '5',
        name: 'Meteo Hooded Wool Jacket',
        sku: 'T14116',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 306,
        views: 807,
        status: 'Active',
    },
    {
        id: '6',
        name: 'Hida Down Ski Jacket - Red',
        sku: 'T14116',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 201,
        views: 406,
        status: 'Active',
    },
    {
        id: '7',
        name: 'Dolce & Gabbana',
        sku: 'T14116',
        image: 'https://placehold.co/64x64.png',
        price: 113.99,
        stock: 108,
        views: 204,
        status: 'Active',
    },
];
