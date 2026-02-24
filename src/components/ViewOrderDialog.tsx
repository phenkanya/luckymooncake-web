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
import { Label } from "@/components/ui/label";
import { Eye, ReceiptText } from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/app/actions/order-actions";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Order, OrderItem, Product } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product | null })[];
};

interface ViewOrderDialogProps {
    order: OrderWithItems;
}

export function ViewOrderDialog({ order }: ViewOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
    const [shippingStatus, setShippingStatus] = useState(order.shippingStatus);

    async function handleUpdateStatus() {
        if (paymentStatus === order.paymentStatus && shippingStatus === order.shippingStatus) {
            setOpen(false);
            return;
        }
        setLoading(true);
        try {
            await updateOrderStatus(order.id, paymentStatus, shippingStatus);
            setOpen(false);
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบออเดอร์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;

        setLoading(true);
        try {
            await deleteOrder(order.id);
            setOpen(false);
        } catch (error) {
            console.error("Failed to delete order", error);
        } finally {
            setLoading(false);
        }
    }

    const getPaymentBadge = (s: string) => {
        switch (s) {
            case "PAID": return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">ชำระแล้ว</Badge>;
            default: return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">รอชำระเงิน</Badge>;
        }
    }

    const getShippingBadge = (s: string) => {
        switch (s) {
            case "WAITING": return <Badge variant="outline" className="bg-muted text-muted-foreground">รอเตรียมของ</Badge>;
            case "PREPARING": return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">กำลังเตรียม</Badge>;
            case "READY": return <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">พร้อมส่ง</Badge>;
            case "SHIPPED": return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">จัดส่งแล้ว</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full" title="ดูรายละเอียดและจัดการ">
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center pr-6">
                        <span>รายละเอียดออเดอร์</span>
                        <span className="text-sm font-normal text-muted-foreground">ID: {order.id.split('-')[0]}</span>
                    </DialogTitle>
                    <DialogDescription>
                        เปลี่ยนสถานะ ดูข้อมูลลูกค้าหรือรายการขนมที่สั่ง
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Customer Details */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold">{order.customerName}</div>
                                <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                            </div>
                            <div>
                                <div className="flex flex-col gap-1 items-end">
                                    {getPaymentBadge(order.paymentStatus)}
                                    {getShippingBadge(order.shippingStatus)}
                                </div>
                            </div>
                        </div>
                        {order.customerAddress && (
                            <div className="text-sm pt-2 border-t border-border/50">
                                <span className="font-medium">ที่อยู่/นัดรับ:</span> {order.customerAddress}
                            </div>
                        )}
                        <div className="text-sm flex justify-between">
                            <span>
                                <span className="font-medium">วันที่นัดรับ/จัดส่ง:</span> {order.deliveryDate ? order.deliveryDate.toLocaleDateString('th-TH') : '-'}
                            </span>
                        </div>
                        {order.note && (
                            <div className="text-sm bg-yellow-50/50 text-yellow-800 p-2 rounded border border-yellow-100">
                                <span className="font-medium">หมายเหตุ:</span> {order.note}
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm">รายการสินค้า</h4>
                        <div className="space-y-2">
                            {order.items.map((item: OrderItem & { product: Product | null }) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground mr-1">{item.quantity}x</span>
                                    <span className="flex-1">{item.product?.name || "สินค้าถูกลบ"}</span>
                                    <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-primary pt-2 border-t mt-2">
                                <span>ยอดรวมทั้งสิ้น</span>
                                <span>฿{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="space-y-4 pt-4 border-t">
                        <Label>อัปเดตสถานะออเดอร์</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">การชำระเงิน</Label>
                                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
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
                                <Label className="text-xs text-muted-foreground">การจัดส่ง</Label>
                                <Select value={shippingStatus} onValueChange={setShippingStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกสถานะจัดส่ง..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WAITING">รอ</SelectItem>
                                        <SelectItem value="PREPARING">กำลังเตรียมสินค้า</SelectItem>
                                        <SelectItem value="READY">พร้อมส่ง</SelectItem>
                                        <SelectItem value="SHIPPED">จัดส่งแล้ว</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between items-center w-full">
                    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto">
                        ลบออเดอร์
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
                            ปิด
                        </Button>
                        <Button type="button" onClick={handleUpdateStatus} disabled={loading || (paymentStatus === order.paymentStatus && shippingStatus === order.shippingStatus)} className="flex-1 sm:flex-none">
                            {loading ? "กำลังบันทึก..." : "บันทึกสถานะ"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
