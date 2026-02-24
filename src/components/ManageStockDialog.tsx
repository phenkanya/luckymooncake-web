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
import { PlusSquare, MinusSquare } from "lucide-react";
import { addStockEntry } from "@/app/actions/stock-actions";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Product } from "@prisma/client";

interface ManageStockDialogProps {
    type: "in" | "out";
    products: Product[];
}

export function ManageStockDialog({ type, products }: ManageStockDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isAdd = type === "in";

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append("type", type);
        try {
            await addStockEntry(formData);
            setOpen(false);
        } catch (error) {
            console.error("Failed to add stock entry", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isAdd ? (
                    <Button className="gap-2 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700">
                        <PlusSquare className="w-4 h-4" /> เพิ่มสต็อก
                    </Button>
                ) : (
                    <Button variant="outline" className="gap-2 shadow-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                        <MinusSquare className="w-4 h-4" /> ตัดสต็อก
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isAdd ? "นำเข้าสินค้า/วัตถุดิบ" : "ตัดสต็อกสินค้า"}</DialogTitle>
                        <DialogDescription>
                            {isAdd ? "เพิ่มจำนวนนำเข้าสินค้าลงในคลัง" : "หักลบจำนวนสินค้า หรือบันทึกสินค้าเสียหาย"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="productId" className="text-right">
                                เมนูขนม <span className="text-red-500">*</span>
                            </Label>
                            <div className="col-span-3">
                                <Select name="productId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกเมนู..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                จำนวน <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                min="1"
                                required
                                className="col-span-3"
                                placeholder={isAdd ? "จำนวนที่นำเข้า" : "จำนวนที่ตัดออก"}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="note" className="text-right">
                                หมายเหตุ
                            </Label>
                            <Input
                                id="note"
                                name="note"
                                className="col-span-3"
                                placeholder="เช่น ผลิตล็อตที่ 2 หรือ ของเสียระหว่างทำ"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading} variant={isAdd ? "default" : "destructive"}>
                            {loading ? "กำลังบันทึก..." : (isAdd ? "บันทึกการนำเข้า" : "บันทึกการตัดสต็อก")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
