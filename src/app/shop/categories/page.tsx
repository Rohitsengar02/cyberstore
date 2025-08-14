import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CategoryCard from "@/components/category-card";

type Category = {
    id: string;
    title: string;
    image: string;
};

const getCategories = async (): Promise<Category[]> => {
    const categoriesCol = collection(db, "categories");
    const snapshot = await getDocs(categoriesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}


export default async function CategoriesPage() {
    const categories = await getCategories();
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/shop" className="md:hidden">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Shop</span>
                    </Link>
                    <h1 className="text-xl font-bold">Categories</h1>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                    {categories.map((category, index) => (
                       <CategoryCard key={category.id} category={category} index={index} />
                    ))}
                </div>
            </main>
        </div>
    );
}
