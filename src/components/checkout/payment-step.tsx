
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Landmark, CircleDollarSign } from "lucide-react";
import Image from "next/image";

type PaymentStepProps = {
    selectedMethod: string;
    onSelectMethod: (method: string) => void;
}

const UpiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 19.3333C7 18.0614 8.06142 17 9.33333 17H14.6667C15.9386 17 17 18.0614 17 19.3333V21H7V19.3333Z" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13.6667L12 10.6667L15 13.6667" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 10.6667V3" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 10.1C4.5 9.78931 4.57018 9.4828 4.70477 9.1993C4.83936 8.9158 5.03473 8.66219 5.27702 8.4552C5.51931 8.24821 5.80373 8.09295 6.11181 8.00167C6.4199 7.91039 6.7451 7.8858 7.06221 7.93006L7.5 8" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.5 10.1C19.5 9.78931 19.4298 9.4828 19.2952 9.1993C19.1606 8.9158 18.9653 8.66219 18.723 8.4552C18.4807 8.24821 18.1963 8.09295 17.8882 8.00167C17.5801 7.91039 17.2549 7.8858 16.9378 7.93006L16.5 8" stroke="#4F4F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const paymentMethods = [
    { id: "upi", name: "UPI", icon: UpiIcon },
    { id: "gpay", name: "Google Pay", icon: () => <Image src="https://www.gstatic.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png" alt="Google Pay" width={24} height={24} /> },
    { id: "phonepe", name: "PhonePe", icon: () => <Image src="https://res.cloudinary.com/dc367rgig/image/upload/v1717657905/phonepe-logo-icon_zfp10c.png" alt="PhonePe" width={24} height={24} /> },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "cod", name: "Cash on Delivery", icon: CircleDollarSign },
]

const PaymentStep = ({ selectedMethod, onSelectMethod }: PaymentStepProps) => {
    
    return (
        <div className="space-y-6">
            <RadioGroup value={selectedMethod} onValueChange={onSelectMethod} className="space-y-4">
                {paymentMethods.map(method => (
                     <Card key={method.id} className="rounded-2xl">
                        <CardContent className="p-4">
                             <Label htmlFor={method.id} className="flex items-center gap-4 cursor-pointer">
                                <RadioGroupItem value={method.id} id={method.id} />
                                <method.icon />
                                <span>{method.name}</span>
                            </Label>
                        </CardContent>
                    </Card>
                ))}
            </RadioGroup>
        </div>
    )
}

export default PaymentStep;

    