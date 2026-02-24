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
import { deleteOrder } from "@/app/actions/order-actions";
import { useState } from "react";

interface DeleteOrderButtonProps {
    id: string;
    customerName: string;
}

export function DeleteOrderButton({ id, customerName }: DeleteOrderButtonProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    async function handleDelete() {
        setLoading(true);
        try {
            await deleteOrder(id);
            setOpen(false);
        } catch (error) {
            console.error("Failed to delete order", error);
        } finally {
            setLoading(false);
        }
    }

    // Use a short ID for display to look nicer
    const displayId = id.split('-')[0];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" title="ลบออเดอร์">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ยืนยันการลบออเดอร์</DialogTitle>
                    <DialogDescription>
                        คุณแน่ใจหรือไม่ว่าต้องการลบออเดอร์ <strong>#{displayId} ({customerName})</strong>?
                        <br /><br />
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้ และข้อมูลการสั่งซื้อจะถูกลบออกจากระบบเป็นการถาวร
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        type="button"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "กำลังลบ..." : "ลบออเดอร์"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
