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
import { Edit2, Plus, Trash2 } from "lucide-react";
import { updateOrder } from "@/app/actions/order-actions";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Order, OrderItem, Product } from "@prisma/client";

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product | null })[];
};

interface EditOrderDialogProps {
    order: OrderWithItems;
    products: Product[];
}

export function EditOrderDialog({ order, products }: EditOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initialize state with existing order data
    const [items, setItems] = useState<{ productId: string; quantity: number; price: number }[]>(
        order.items.map((item: OrderItem) => ({
            productId: item.productId || "",
            quantity: item.quantity,
            price: item.price
        }))
    );

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

    async function handleSubmit(formData: FormData) {
        if (items.some(item => !item.productId || item.quantity < 1)) {
            alert("กรุณาเลือกสินค้าและระบุจำนวนให้ถูกต้องทุกรายการ");
            return;
        }

        setLoading(true);
        formData.append("orderId", order.id);
        formData.append("items", JSON.stringify(items));

        try {
            await updateOrder(formData);
            setOpen(false);
        } catch (error) {
            console.error("Failed to update order", error);
            alert("เกิดข้อผิดพลาดในการแก้ไขออเดอร์");
        } finally {
            setLoading(false);
        }
    }

    const grandTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Format delivery date for the input field (YYYY-MM-DD)
    const formattedDeliveryDate = order.deliveryDate
        ? new Date(order.deliveryDate.getTime() - (order.deliveryDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
        : "";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full" title="แก้ไขออเดอร์">
                    <Edit2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>แก้ไขออเดอร์</DialogTitle>
                        <DialogDescription>
                            แก้ไขข้อมูลลูกค้าและรายการสินค้าของออเดอร์ {order.id.split('-')[0]}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">ข้อมูลลูกค้า</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`customerName-${order.id}`}>ชื่อลูกค้า <span className="text-red-500">*</span></Label>
                                    <Input id={`customerName-${order.id}`} name="customerName" defaultValue={order.customerName} required placeholder="เช่น คุณสมหญิง" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`customerPhone-${order.id}`}>เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                                    <Input id={`customerPhone-${order.id}`} name="customerPhone" defaultValue={order.customerPhone} required placeholder="08x-xxx-xxxx" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`customerAddress-${order.id}`}>ที่อยู่จัดส่ง / สาขาที่รับ</Label>
                                <Input id={`customerAddress-${order.id}`} name="customerAddress" defaultValue={order.customerAddress || ""} placeholder="ถ้าลูกค้ารับเองที่ร้าน สามารถข้ามได้" />
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

                            <div className="flex justify-between items-center px-2 py-3 bg-muted/50 rounded-lg">
                                <span className="font-semibold text-sm">ยอดรวมทั้งสิ้น:</span>
                                <span className="font-bold text-lg text-primary">฿{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        {/* Extra Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">ข้อมูลเพิ่มเติม</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`deliveryDate-${order.id}`}>วันที่นัดรับ / วันที่จัดส่ง <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span></Label>
                                    <Input id={`deliveryDate-${order.id}`} name="deliveryDate" type="date" defaultValue={formattedDeliveryDate} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`paymentStatus-${order.id}`}>สถานะการชำระเงิน <span className="text-red-500">*</span></Label>
                                    <Select name="paymentStatus" defaultValue={order.paymentStatus}>
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
                                    <Label htmlFor={`shippingStatus-${order.id}`}>การจัดส่ง <span className="text-red-500">*</span></Label>
                                    <Select name="shippingStatus" defaultValue={order.shippingStatus}>
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
                                <Label htmlFor={`note-${order.id}`}>หมายเหตุ <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span></Label>
                                <Input id={`note-${order.id}`} name="note" defaultValue={order.note || ""} placeholder="เช่น ขอใบเสร็จ, ระวังแตก, ผูกโบว์ ฯลฯ" />
                            </div>
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
