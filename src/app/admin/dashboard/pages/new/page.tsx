
"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Heading1, Pilcrow, Image as ImageIcon, GripVertical, MoveUp, MoveDown, Columns, Check } from "lucide-react";
import { products } from '@/lib/products';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';


type Block = {
    id: number;
    type: 'heading' | 'text' | 'image' | 'product-section';
    content: any;
};

const MultiSelectProduct = ({ block, selectedProducts, onSelectionChange }: { block: Block, selectedProducts: string[], onSelectionChange: (newSelection: string[]) => void }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (productName: string) => {
        const newSelection = selectedProducts.includes(productName)
            ? selectedProducts.filter(name => name !== productName)
            : [...selectedProducts, productName];
        onSelectionChange(newSelection);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {selectedProducts.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                            {selectedProducts.slice(0, 2).map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                            {selectedProducts.length > 2 && <Badge variant="secondary">+{selectedProducts.length - 2} more</Badge>}
                        </div>
                    ) : "+ Select Products"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {products.map(p => {
                                const isSelected = selectedProducts.includes(p.name);
                                return (
                                    <CommandItem
                                        key={p.id}
                                        onSelect={() => handleSelect(p.name)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{p.name}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


export default function NewPage() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [idCounter, setIdCounter] = useState(1);

    const updateBlockContent = (id: number, newContent: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
    };

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = { id: idCounter, type, content: {} };
        if (type === 'heading') newBlock.content = { text: 'New Heading', level: 'h2' };
        if (type === 'text') newBlock.content = { text: 'Lorem ipsum dolor sit amet...' };
        if (type === 'image') newBlock.content = { src: 'https://placehold.co/1200x400.png', alt: 'Placeholder' };
        if (type === 'product-section') newBlock.content = { title: 'Featured Products', selectedProducts: [], displayType: 'grid' };

        setBlocks([...blocks, newBlock]);
        setIdCounter(idCounter + 1);
    };

    const removeBlock = (id: number) => {
        setBlocks(blocks.filter(block => block.id !== id));
    };

    const moveBlock = (id: number, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;

        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[newIndex];
        newBlocks[newIndex] = temp;
        setBlocks(newBlocks);
    }
    
    const renderBlock = (block: Block) => {
        switch (block.type) {
            case 'heading':
                return (
                    <div className="flex items-center gap-2">
                        <Select defaultValue={block.content.level} onValueChange={(value) => updateBlockContent(block.id, { level: value })}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="h1">H1</SelectItem>
                                <SelectItem value="h2">H2</SelectItem>
                                <SelectItem value="h3">H3</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input defaultValue={block.content.text} className="text-2xl font-bold border-transparent focus-visible:border-input focus-visible:ring-1" onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}/>
                    </div>
                );
            case 'text':
                return <Textarea defaultValue={block.content.text} rows={5} onChange={(e) => updateBlockContent(block.id, { text: e.target.value })} />;
            case 'image':
                return (
                    <div>
                        <img src={block.content.src} alt={block.content.alt} className="rounded-lg w-full" />
                        <Input placeholder="Image URL" defaultValue={block.content.src} className="mt-2" onChange={(e) => updateBlockContent(block.id, { src: e.target.value })}/>
                    </div>
                );
            case 'product-section':
                return (
                    <Card>
                        <CardHeader>
                            <Input defaultValue={block.content.title} className="text-xl font-bold" onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Products</Label>
                                <MultiSelectProduct 
                                    block={block}
                                    selectedProducts={block.content.selectedProducts}
                                    onSelectionChange={(newSelection) => updateBlockContent(block.id, { selectedProducts: newSelection })}
                                />
                            </div>
                             <div>
                                <Label>Display Style</Label>
                                <RadioGroup 
                                    defaultValue={block.content.displayType} 
                                    className="flex gap-4 mt-2"
                                    onValueChange={(value) => updateBlockContent(block.id, { displayType: value })}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="grid" id={`grid-${block.id}`} />
                                        <Label htmlFor={`grid-${block.id}`}>Grid</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="slider" id={`slider-${block.id}`} />
                                        <Label htmlFor={`slider-${block.id}`}>Slider</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                )
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Create New Page</h1>
                <div className="flex gap-2">
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Publish Page</Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Page Title</CardTitle></CardHeader>
                        <CardContent>
                            <Input placeholder="e.g. About Us" />
                        </CardContent>
                    </Card>

                    {blocks.map(block => (
                        <Card key={block.id}>
                            <CardContent className="p-4 relative group">
                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background p-1 rounded-md border">
                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBlock(block.id, 'up')}><MoveUp className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBlock(block.id, 'down')}><MoveDown className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeBlock(block.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                                {renderBlock(block)}
                            </CardContent>
                        </Card>
                    ))}
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Block</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => addBlock('heading')}><Heading1 className="mr-2 h-4 w-4"/> Heading</Button>
                            <Button variant="outline" onClick={() => addBlock('text')}><Pilcrow className="mr-2 h-4 w-4"/> Text</Button>
                            <Button variant="outline" onClick={() => addBlock('image')}><ImageIcon className="mr-2 h-4 w-4"/> Image</Button>
                            <Button variant="outline" onClick={() => addBlock('product-section')}><Columns className="mr-2 h-4 w-4"/> Product Section</Button>
                        </CardContent>
                    </Card>

                </div>

                <div className="space-y-6">
                     <Card>
                        <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="page-slug">URL Slug</Label>
                                <Input id="page-slug" placeholder="/about-us" />
                            </div>
                             <div>
                                <Label htmlFor="page-status">Status</Label>
                                <Select defaultValue="draft">
                                    <SelectTrigger id="page-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="seo-title">SEO Title</Label>
                                <Input id="seo-title" placeholder="e.g. About Our Company" />
                            </div>
                             <div>
                                <Label htmlFor="seo-desc">Meta Description</Label>
                                <Textarea id="seo-desc" placeholder="A brief description for search engines." />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

    