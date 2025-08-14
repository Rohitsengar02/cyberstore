import type { Product, Category } from './types';

export const featuredProducts: Product[] = [
  { id: '1', title: 'Minimalist Watch', pricing: { regular: 12999, offered: 11999 }, categories: ['Accessories'], mainImage: 'https://placehold.co/600x600.png', hint: 'watch fashion', status: 'published' },
  { id: '2', title: 'Leather Backpack', pricing: { regular: 19999, offered: 17999 }, categories: ['Bags'], mainImage: 'https://placehold.co/600x600.png', hint: 'backpack leather', status: 'published' },
  { id: '3', title: 'Wireless Headphones', pricing: { regular: 16999, offered: 15999 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'headphones audio', status: 'published' },
  { id: '4', title: 'Modern Desk Lamp', pricing: { regular: 7999, offered: 6999 }, categories: ['Home Goods'], mainImage: 'https://placehold.co/600x600.png', hint: 'lamp desk', status: 'published' },
  { id: '5', title: 'Stylish Sunglasses', pricing: { regular: 6999, offered: 5999 }, categories: ['Accessories'], mainImage: 'https://placehold.co/600x600.png', hint: 'sunglasses fashion', status: 'published' },
  { id: '6', title: 'Smart Speaker', pricing: { regular: 10999, offered: 9999 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'speaker smart', status: 'published' },
  { id: '7', title: 'Ceramic Vase', pricing: { regular: 4499, offered: 3499 }, categories: ['Home Goods'], mainImage: 'https://placehold.co/600x600.png', hint: 'vase ceramic', status: 'published' },
];

export const bestSellerProducts: Product[] = [
  { id: '8', title: 'Running Shoes', pricing: { regular: 15999, offered: 14999 }, categories: ['Footwear'], mainImage: 'https://placehold.co/600x600.png', hint: 'shoes running', status: 'published' },
  { id: '9', title: 'Travel Mug', pricing: { regular: 2499, offered: 1999 }, categories: ['Kitchen'], mainImage: 'https://placehold.co/600x600.png', hint: 'mug travel', status: 'published' },
  { id: '10', title: 'Yoga Mat', pricing: { regular: 4999, offered: 4499 }, categories: ['Fitness'], mainImage: 'https://placehold.co/600x600.png', hint: 'yoga mat', status: 'published' },
  { id: '11', title: 'Leather Wallet', pricing: { regular: 5999, offered: 4999 }, categories: ['Accessories'], mainImage: 'https://placehold.co/600x600.png', hint: 'wallet leather', status: 'published' },
  { id: '12', title: 'Bluetooth Earbuds', pricing: { regular: 9999, offered: 8999 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'earbuds audio', status: 'published' },
  { id: '13', title: 'Scented Candle', pricing: { regular: 2999, offered: 2499 }, categories: ['Home Goods'], mainImage: 'https://placehold.co/600x600.png', hint: 'candle home', status: 'published' },
  { id: '14', title: 'Denim Jacket', pricing: { regular: 13999, offered: 12999 }, categories: ['Apparel'], mainImage: 'https://placehold.co/600x600.png', hint: 'jacket denim', status: 'published' },
];

export const newArrivals: Product[] = [
  { id: '15', title: 'Smart Water Bottle', pricing: { regular: 4999, offered: 3999 }, categories: ['Kitchen'], mainImage: 'https://placehold.co/600x600.png', hint: 'water bottle', status: 'published' },
  { id: '16', title: 'Portable Projector', pricing: { regular: 27999, offered: 24999 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'projector technology', status: 'published' },
  { id: '17', title: 'Linen Throw Pillow', pricing: { regular: 3499, offered: 2999 }, categories: ['Home Goods'], mainImage: 'https://placehold.co/600x600.png', hint: 'pillow linen', status: 'published' },
  { id: '18', title: 'Electric Toothbrush', pricing: { regular: 5999, offered: 5499 }, categories: ['Personal Care'], mainImage: 'https://placehold.co/600x600.png', hint: 'toothbrush electric', status: 'published' },
  { id: '19', title: 'Gourmet Coffee Beans', pricing: { regular: 1999, offered: 1499 }, categories: ['Kitchen'], mainImage: 'https://placehold.co/600x600.png', hint: 'coffee beans', status: 'published' },
  { id: '20', title: 'Wireless Charger', pricing: { regular: 3999, offered: 3499 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'charger wireless', status: 'published' },
  { id: '21', title: 'Silk Sleep Mask', pricing: { regular: 2499, offered: 1999 }, categories: ['Personal Care'], mainImage: 'https://placehold.co/600x600.png', hint: 'sleep mask', status: 'published' },
];

export const onSale: Product[] = [
  { id: '22', title: 'Classic Aviators', pricing: { regular: 5999, offered: 4999 }, categories: ['Accessories'], mainImage: 'https://placehold.co/600x600.png', hint: 'sunglasses classic', status: 'published' },
  { id: '23', title: 'Digital Photo Frame', pricing: { regular: 8999, offered: 7999 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'photo frame', status: 'published' },
  { id: '24', title: 'Cotton Bath Towel', pricing: { regular: 1599, offered: 1299 }, categories: ['Home Goods'], mainImage: 'https://placehold.co/600x600.png', hint: 'towel cotton', status: 'published' },
  { id: '25', title: 'Gaming Mouse', pricing: { regular: 4999, offered: 4499 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'mouse gaming', status: 'published' },
  { id: '26', title: 'Insulated Lunch Box', pricing: { regular: 2599, offered: 2199 }, categories: ['Kitchen'], mainImage: 'https://placehold.co/600x600.png', hint: 'lunch box', status: 'published' },
  { id: '27', title: 'Graphic T-Shirt', pricing: { regular: 1999, offered: 1799 }, categories: ['Apparel'], mainImage: 'https://placehold.co/600x600.png', hint: 'tshirt graphic', status: 'published' },
  { id: '28', title: 'Resistance Bands Set', pricing: { regular: 2499, offered: 1999 }, categories: ['Fitness'], mainImage: 'https://placehold.co/600x600.png', hint: 'fitness bands', status: 'published' },
];

export const topRated: Product[] = [
    { id: '29', title: 'Noise-Cancelling Earphones', pricing: { regular: 13999, offered: 12999 }, categories: ['Electronics'], mainImage: 'https://placehold.co/600x600.png', hint: 'earphones noise cancelling', status: 'published' },
    { id: '30', title: 'French Press Coffee Maker', pricing: { regular: 3999, offered: 3499 }, categories: ['Kitchen'], mainImage: 'https://placehold.co/600x600.png', hint: 'coffee maker', status: 'published' },
    { id: '31', title: 'Hard-Shell Suitcase', pricing: { regular: 10999, offered: 9999 }, categories: ['Travel'], mainImage: 'https://placehold.co/600x600.png', hint: 'suitcase travel', status: 'published' },
    { id: '32', title: 'Weighted Blanket', pricing: { regular: 7999, offered: 6999 }, categories: ['Home Goods'], mainImage: 'https://placehold.co/600x600.png', hint: 'blanket weighted', status: 'published' },
    { id: '33', title: 'Smart Notebook', pricing: { regular: 3499, offered: 2999 }, categories: ['Office'], mainImage: 'https://placehold.co/600x600.png', hint: 'notebook smart', status: 'published' },
    { id: '34', title: 'Air Fryer', pricing: { regular: 8999, offered: 8499 }, categories: ['Kitchen'], mainImage: 'https://placehold.co/600x600.png', hint: 'air fryer', status: 'published' },
    { id: '35', title: 'Waterproof Picnic Blanket', pricing: { regular: 3599, offered: 3199 }, categories: ['Outdoor'], mainImage: 'https://placehold.co/600x600.png', hint: 'picnic blanket', status: 'published' },
];

export const allProducts: Product[] = [
    ...featuredProducts,
    ...bestSellerProducts,
    ...newArrivals,
    ...onSale,
    ...topRated
];

export const categories: Category[] = [
    { id: '1', name: 'Beauty', image: 'https://placehold.co/400x400.png', hint: 'beauty makeup' },
    { id: '2', name: 'Technology', image: 'https://placehold.co/400x400.png', hint: 'tech gadgets' },
    { id: '3', name: 'Fashion', image: 'https://placehold.co/400x400.png', hint: 'clothing style' },
    { id: '4', name: 'Accessories', image: 'https://placehold.co/400x400.png', hint: 'watch jewelry' },
    { id: '5', name: 'Home', image: 'https://placehold.co/400x400.png', hint: 'home decor' },
    { id: '6', name: 'Personal Care', image: 'https://placehold.co/400x400.png', hint: 'skincare wellness' },
];