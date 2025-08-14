
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Privacy Policy</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="container mx-auto max-w-2xl space-y-6 prose prose-lg">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-2xl font-bold">1. Introduction</h2>
                    <p>Welcome to NoirCart. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

                    <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                    <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.</li>
                        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    </ul>

                    <h2 className="text-2xl font-bold">3. Use of Your Information</h2>
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Create and manage your account.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                        <li>Increase the efficiency and operation of the Site.</li>
                    </ul>

                    <h2 className="text-2xl font-bold">4. Security of Your Information</h2>
                    <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

                     <h2 className="text-2xl font-bold">5. Contact Us</h2>
                    <p>If you have questions or comments about this Privacy Policy, please contact us at: privacy@noircart.com</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}

