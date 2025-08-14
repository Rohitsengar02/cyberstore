
"use client"
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

type Sale = {
    rank: number;
    name: string;
    sold: number;
    profit: number;
    image: string;
};

type SalesReportTableProps = {
    salesData: Sale[];
};

const SalesReportTable = ({ salesData }: SalesReportTableProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Profits</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {salesData.map((sale) => (
                    <TableRow key={sale.rank}>
                        <TableCell className="font-medium">{sale.rank}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Image
                                    src={sale.image}
                                    alt={sale.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover bg-secondary"
                                />
                                <span>{sale.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">{sale.sold}</TableCell>
                        <TableCell className="text-right font-medium">${(sale.profit / 1000).toFixed(1)}K</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default SalesReportTable;
