
"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, ShoppingCart } from "lucide-react";

const faqs = [
    {
        question: "How do I add a new product?",
        answer: "Navigate to the 'Products' page from the sidebar and click the 'Add Product' button. Fill in the required details like title, price, images, and description. You can also use the AI generation feature to fill in the details automatically."
    },
    {
        question: "How can I view my monthly sales report?",
        answer: "Go to the 'Analytics' section. You can see charts and statistics about your sales, customers, and traffic sources. Use the date range picker to filter the data for a specific period."
    },
    {
        question: "How do I process a new order?",
        answer: "New orders appear in the 'Orders' section. Click on an order to view its details. You can update the order status (e.g., from 'Pending' to 'Processing' to 'Shipped') from the order detail view."
    },
    {
        question: "How do I add a discount code?",
        answer: "Go to the 'Discount' page. Click 'Create Discount' and fill in the code, type (percentage or fixed amount), and value. Once created, customers can use this code at checkout."
    },
    {
        question: "How do I customize my homepage?",
        answer: "The 'Customize' section allows you to manage the sections on your homepage. You can add, remove, and reorder sections like 'Featured Products' or special offer banners."
    }
];

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Help & Q/A</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Contact Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Can't find the answer you're looking for? Contact our support team for further assistance.
                        </p>
                        <div className="space-y-3">
                           <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Email Support</h4>
                                    <p className="text-sm text-muted-foreground">Get help via email for any inquiries.</p>
                                    <a href="mailto:support@noircart.com" className="text-sm text-primary">support@noircart.com</a>
                                </div>
                           </div>
                            <div className="flex items-start gap-3">
                                <ShoppingCart className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Sales Inquiries</h4>
                                    <p className="text-sm text-muted-foreground">For questions about sales and partnerships.</p>
                                     <a href="mailto:sales@noircart.com" className="text-sm text-primary">sales@noircart.com</a>
                                </div>
                           </div>
                           <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Security Issues</h4>
                                    <p className="text-sm text-muted-foreground">Report any security concerns or vulnerabilities.</p>
                                     <a href="mailto:security@noircart.com" className="text-sm text-primary">security@noircart.com</a>
                                </div>
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
