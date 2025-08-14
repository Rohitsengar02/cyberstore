
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/footer";


const faqs = [
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for unused items in their original packaging. Please visit our returns page for more details and to initiate a return."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order has shipped, you will receive an email with a tracking number. You can use this number on the carrier's website to track your package."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary depending on the destination."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and other local payment methods depending on your region."
    },
     {
        question: "How do I apply a discount code?",
        answer: "You can apply your discount code at checkout. There will be a field to enter your code before you confirm your payment."
    },
      {
        question: "Can I change or cancel my order?",
        answer: "If you need to change or cancel my order, please contact our customer support as soon as possible. We can't guarantee changes can be made once the order is processed."
    }
];


export default function HelpPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">Help & FAQ</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="container mx-auto max-w-2xl">
                     <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </main>
            <Footer />
        </div>
    );
}
