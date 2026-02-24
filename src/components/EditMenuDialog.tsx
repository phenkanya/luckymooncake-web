"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { updateProduct } from "@/app/actions/product-actions";
import { useState } from "react";
import { Product } from "@prisma/client";

interface EditMenuDialogProps {
    product: Product;
}

export function EditMenuDialog({ product }: EditMenuDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            formData.append("id", product.id);
            await updateProduct(formData);
            setOpen(false); // Close dialog on success
        } catch (error) {
            console.error("Failed to update product", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="แก้ไข">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>แก้ไขเมนู</DialogTitle>
                        <DialogDescription>
                            ปรับปรุงข้อมูลของ {product.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                ชื่อเมนู <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={product.name}
                                required
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-cost" className="text-right">
                                ต้นทุน (บาท) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-cost"
                                name="cost"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product.cost || 0}
                                required
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-price" className="text-right">
                                ราคา (บาท) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product.price}
                                required
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
