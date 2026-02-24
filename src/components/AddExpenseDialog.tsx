"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addExpense } from "@/app/actions/expense-actions";

export function AddExpenseDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            await addExpense(formData);
            setOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    เพิ่มรายจ่าย
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>เพิ่มรายจ่ายใหม่</DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            รายการ
                        </Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="เช่น ค่ากล่องใส่ขนม"
                            required
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            จำนวนเงิน
                        </Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "กำลังบันทึก..." : "บันทึกรายจ่าย"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
