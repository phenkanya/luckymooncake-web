"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { clearAllStock, clearProductStock } from "@/app/actions/stock-actions";

interface ClearStockDialogProps {
    products: any[];
}

export function ClearStockDialog({ products }: ClearStockDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [targetProduct, setTargetProduct] = useState<string>("ALL");
    const [note, setNote] = useState<string>("");

    async function handleClear() {
        if (!confirm(targetProduct === "ALL" 
            ? "คุณแน่ใจหรือไม่ว่าต้องการล้างสต็อกขนมทุกรายการให้เป็น 0?" 
            : "คุณแน่ใจหรือไม่ว่าต้องการล้างสต็อกรายการนี้ให้เป็น 0?")) {
            return;
        }

        setLoading(true);
        try {
            if (targetProduct === "ALL") {
                await clearAllStock(note || undefined);
            } else {
                await clearProductStock(targetProduct, note || undefined);
            }
            setOpen(false);
            setNote("");
            setTargetProduct("ALL");
        } catch (error) {
            console.error("Failed to clear stock", error);
            alert("เกิดข้อผิดพลาดในการล้างสต็อก");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm text-amber-700 border-amber-300 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-800">
                    <RotateCcw className="w-4 h-4" /> ล้างสต็อก
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-800">
                        <RotateCcw className="w-5 h-5 text-amber-600" /> ล้างสต็อกสินค้า (Reset Stock)
                    </DialogTitle>
                    <DialogDescription>
                        ปรับจำนวนคงเหลือในสต็อกให้เป็น 0 โดยประวัติการเคลื่อนไหวสต็อกเดิมจะยังคงถูกบันทึกไว้อย่างครบถ้วน
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>เลือกรายการที่ต้องการล้าง</Label>
                        <Select value={targetProduct} onValueChange={setTargetProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกรายการ..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">🌟 ล้างสต็อกขนมทุกรายการ (ทั้งหมด)</SelectItem>
                                {products.map((p) => {
                                    const stockCount = (p.stock || []).reduce((s: number, e: any) => s + e.amount, 0);
                                    return (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} (คงเหลือ: {stockCount.toLocaleString('th-TH')} ชิ้น)
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clear-note">หมายเหตุ <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span></Label>
                        <Input
                            id="clear-note"
                            placeholder="เช่น ปิดรอบการขาย / รีเซ็ตสต็อกก่อนเริ่มรอบใหม่"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        type="button"
                        onClick={handleClear}
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {loading ? "กำลังล้างสต็อก..." : "ยืนยันการล้างสต็อกเป็น 0"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
