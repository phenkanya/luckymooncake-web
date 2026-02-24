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
import { Plus } from "lucide-react";
import { addProduct } from "@/app/actions/product-actions";
import { useState } from "react";

export function AddMenuDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await addProduct(formData);
            setOpen(false); // Close dialog on success
        } catch (error) {
            console.error("Failed to add product", error);
            // In a real app, you'd show a toast error here
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> เพิ่มเมนูใหม่
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>เพิ่มเมนูใหม่</DialogTitle>
                        <DialogDescription>
                            สร้างรายการขนมใหม่เพื่อเปิดรับพรีออเดอร์ในรอบถัดไป
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                ชื่อเมนู <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                className="col-span-3"
                                placeholder="เช่น ขนมเปี๊ยะไส้ถั่วไข่เค็ม"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cost" className="text-right">
                                ต้นทุน (บาท) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="cost"
                                name="cost"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="col-span-3"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                ราคา (บาท) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="col-span-3"
                                placeholder="0.00"
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
