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
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/product-actions";
import { useState } from "react";

interface DeleteMenuButtonProps {
    id: string;
    name: string;
}

export function DeleteMenuButton({ id, name }: DeleteMenuButtonProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    async function handleDelete() {
        setLoading(true);
        try {
            await deleteProduct(id);
            setOpen(false);
        } catch (error) {
            console.error("Failed to delete product", error);
            // Ignore error or show toast in real app
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="ลบเมนู">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ยืนยันการลบเมนู</DialogTitle>
                    <DialogDescription>
                        คุณแน่ใจหรือไม่ว่าต้องการลบเมนู <strong>{name}</strong>? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                        และอาจมีผลกระทบต่อออเดอร์ในอดีตหากสินค้านี้ถูกผูกไว้อยู่
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        type="button"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault(); // Prevent closing before we await delete
                            handleDelete();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "กำลังลบ..." : "ลบเมนู"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
