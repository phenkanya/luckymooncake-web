"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/app/actions/expense-actions";

export function DeleteExpenseButton({ id, description }: { id: string, description: string }) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteExpense(id);
            setOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8 gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="sr-only">ลบ</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ยืนยันการลบ?</DialogTitle>
                    <DialogDescription>
                        คุณแน่ใจหรือไม่ที่จะลบรายการ "{description}"? ข้อมูลนี้จะไม่สามารถกู้คืนได้
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                        ยกเลิก
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "กำลังลบ..." : "ยืนยันการลบ"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
