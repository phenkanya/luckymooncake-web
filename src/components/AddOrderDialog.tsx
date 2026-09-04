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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { createOrder } from "@/app/actions/order-actions";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Product } from "@prisma/client";

interface AddOrderDialogProps {
    products: Product[];
}

export function AddOrderDialog({ products }: AddOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<{ productId: string; quantity: number; price: number }[]>([
        { productId: "", quantity: 1, price: 0 }
    ]);

    const handleAddItem = () => {
        setItems([...items, { productId: "", quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        const newItems = [...items];
        newItems[index].productId = productId;
        newItems[index].price = product ? product.price : 0;
        setItems(newItems);
    };

    const handleQtyChange = (index: number, qty: number) => {
        const newItems = [...items];
        newItems[index].quantity = qty;
        setItems(newItems);
    };

    const [discountMode, setDiscountMode] = useState<"NONE" | "5" | "10" | "15" | "20" | "CUSTOM_PERCENT" | "CUSTOM_AMOUNT">("NONE");
    const [customDiscountValue, setCustomDiscountValue] = useState<number>(0);

    const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountPercent = 0;
    let discountAmount = 0;

    if (discountMode === "5") {
        discountPercent = 5;
        discountAmount = (itemsSubtotal * 5) / 100;
    } else if (discountMode === "10") {
        discountPercent = 10;
        discountAmount = (itemsSubtotal * 10) / 100;
    } else if (discountMode === "15") {
        discountPercent = 15;
        discountAmount = (itemsSubtotal * 15) / 100;
    } else if (discountMode === "20") {
        discountPercent = 20;
        discountAmount = (itemsSubtotal * 20) / 100;
    } else if (discountMode === "CUSTOM_PERCENT") {
        discountPercent = customDiscountValue;
        discountAmount = (itemsSubtotal * customDiscountValue) / 100;
    } else if (discountMode === "CUSTOM_AMOUNT") {
        discountPercent = itemsSubtotal > 0 ? (customDiscountValue / itemsSubtotal) * 100 : 0;
        discountAmount = customDiscountValue;
    }

    const grandTotal = Math.max(0, itemsSubtotal - discountAmount);

    async function handleSubmit(formData: FormData) {
        // Debugging client side
        console.log("Client Form Data - Note:", formData.get("note"));
        console.log("Client Form Data - DeliveryDate:", formData.get("deliveryDate"));

        // Basic validation
        if (items.some(item => !item.productId || item.quantity < 1)) {
            alert("กรุณาเลือกสินค้าและระบุจำนวนให้ถูกต้องทุกรายการ");
            return;
        }

        setLoading(true);
        formData.append("items", JSON.stringify(items));

        if (discountPercent > 0) {
            formData.append("discountPercent", discountPercent.toString());
        } else if (discountAmount > 0) {
            formData.append("discountAmount", discountAmount.toString());
        }

        try {
            await createOrder(formData);
            setOpen(false);
            setItems([{ productId: "", quantity: 1, price: 0 }]); // Reset
            setDiscountMode("NONE");
            setCustomDiscountValue(0);
        } catch (error) {
            console.error("Failed to create order", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> สร้างออเดอร์ใหม่
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>สร้างออเดอร์ใหม่</DialogTitle>
                        <DialogDescription>
                            บันทึกคำสั่งซื้อจากลูกค้า เลือกสินค้าที่ต้องการสั่งพรีออเดอร์
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">ข้อมูลลูกค้า</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">ชื่อลูกค้า <span className="text-red-500">*</span></Label>
                                    <Input id="customerName" name="customerName" required placeholder="เช่น คุณสมหญิง" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                                    <Input id="customerPhone" name="customerPhone" required placeholder="08x-xxx-xxxx" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">ที่อยู่จัดส่ง / สาขาที่รับ</Label>
                                <Input id="customerAddress" name="customerAddress" placeholder="ถ้าลูกค้ารับเองที่ร้าน สามารถข้ามได้" />
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-sm">รายการสินค้า</h3>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-8 gap-1">
                                    <Plus className="w-3 h-3" /> เพิ่มรายการ
                                </Button>
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex-1 space-y-1">
                                        <Select value={item.productId || ""} onValueChange={(val) => handleProductChange(index, val)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกเมนูขนม..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name} (฿{p.price})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                                            required
                                        />
                                    </div>
                                    <div className="w-16 text-right font-medium text-sm">
                                        ฿{item.price * item.quantity}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {/* Discount Section */}
                            <div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border/50">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        🏷️ ส่วนลด (Discount)
                                    </Label>
                                    {discountAmount > 0 && (
                                        <span className="text-xs text-red-500 font-medium">
                                            ลด ฿{discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ({discountPercent.toFixed(0)}%)
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: "ไม่มี (0%)", val: "NONE" },
                                        { label: "5%", val: "5" },
                                        { label: "10% ⭐", val: "10" },
                                        { label: "15%", val: "15" },
                                        { label: "20%", val: "20" },
                                        { label: "ระบุ % เอง", val: "CUSTOM_PERCENT" },
                                        { label: "ระบุ ฿ เอง", val: "CUSTOM_AMOUNT" },
                                    ].map((btn) => (
                                        <Button
                                            key={btn.val}
                                            type="button"
                                            size="sm"
                                            variant={discountMode === btn.val ? "default" : "outline"}
                                            className={`h-7 text-xs px-2.5 ${discountMode === btn.val ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}
                                            onClick={() => {
                                                setDiscountMode(btn.val as any);
                                                if (btn.val === "NONE" || btn.val === "5" || btn.val === "10" || btn.val === "15" || btn.val === "20") {
                                                    setCustomDiscountValue(0);
                                                }
                                            }}
                                        >
                                            {btn.label}
                                        </Button>
                                    ))}
                                </div>

                                {(discountMode === "CUSTOM_PERCENT" || discountMode === "CUSTOM_AMOUNT") && (
                                    <div className="pt-2 flex items-center gap-2">
                                        <Label className="text-xs whitespace-nowrap">
                                            {discountMode === "CUSTOM_PERCENT" ? "ระบุ % ส่วนลด:" : "ระบุจำนวนเงินส่วนลด (บาท):"}
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max={discountMode === "CUSTOM_PERCENT" ? "100" : undefined}
                                            placeholder={discountMode === "CUSTOM_PERCENT" ? "เช่น 10" : "เช่น 50"}
                                            value={customDiscountValue || ""}
                                            onChange={(e) => setCustomDiscountValue(parseFloat(e.target.value) || 0)}
                                            className="h-8 text-sm max-w-[140px]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Subtotal, Discount & Grand Total breakdown */}
                            <div className="space-y-1.5 px-3 py-2.5 bg-muted/60 rounded-lg text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>ราคารวมสินค้า:</span>
                                    <span>฿{itemsSubtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-red-500 font-medium">
                                        <span>ส่วนลด ({discountPercent > 0 ? `${discountPercent.toFixed(0)}%` : "บาท"}):</span>
                                        <span>-฿{discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center font-bold text-base pt-1.5 border-t border-border/50">
                                    <span>ยอดรวมสุทธิ:</span>
                                    <span className="text-lg text-primary">฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                        {/* Extra Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">ข้อมูลเพิ่มเติม</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deliveryDate">วันที่นัดรับ / วันที่จัดส่ง <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span></Label>
                                    <Input id="deliveryDate" name="deliveryDate" type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentStatus">สถานะการชำระเงิน <span className="text-red-500">*</span></Label>
                                    <Select name="paymentStatus" defaultValue="UNPAID">
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกการชำระเงิน..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UNPAID">ยังไม่จ่าย</SelectItem>
                                            <SelectItem value="PAID">จ่ายแล้ว</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shippingStatus">การจัดส่ง <span className="text-red-500">*</span></Label>
                                    <Select name="shippingStatus" defaultValue="WAITING">
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกสถานะจัดส่ง..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WAITING">รอเตรียมของ</SelectItem>
                                            <SelectItem value="PREPARING">กำลังเตรียมสินค้า</SelectItem>
                                            <SelectItem value="READY">พร้อมส่ง</SelectItem>
                                            <SelectItem value="SHIPPED">จัดส่งแล้ว</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note">หมายเหตุ <span className="text-muted-foreground text-xs">(ไม่บังคับ, กด Enter ขึ้นบรรทัดใหม่ได้)</span></Label>
                                <Textarea id="note" name="note" rows={3} placeholder="เช่น ขอใบเสร็จ, ระวังแตก, ผูกโบว์ ฯลฯ (เคาะขึ้นบรรทัดใหม่ได้)" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "กำลังบันทึก..." : "บันทึกออเดอร์"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
