import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddOrderDialog } from "@/components/AddOrderDialog";
import { ViewOrderDialog } from "@/components/ViewOrderDialog";
import { EditOrderDialog } from "@/components/EditOrderDialog";
import { DeleteOrderButton } from "@/components/DeleteOrderButton";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: { product: true }
            },
            round: true
        }
    });

    const activeProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">จัดการออเดอร์ (Orders)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        ดูและสร้างออเดอร์ใหม่จากลูกค้า จัดการสถานะการชำระเงินและขนส่ง
                    </p>
                </div>
                <AddOrderDialog products={activeProducts} />
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>รหัสออเดอร์ / ลูกค้า</TableHead>
                            <TableHead>ยอดรวม</TableHead>
                            <TableHead>นัดรับ/จัดส่ง</TableHead>
                            <TableHead className="text-center">สถานะชำระเงิน</TableHead>
                            <TableHead className="text-center">การจัดส่ง</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    ยังไม่มีออเดอร์ในระบบ
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="text-xs text-muted-foreground truncate w-40">
                                            ID: {order.id.split('-')[0]} • {order.items.length} รายการ
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                                        ฿{order.totalAmount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {order.deliveryDate ? order.deliveryDate.toLocaleDateString('th-TH') : <span className="text-muted-foreground">-</span>}
                                        {order.note && <div className="text-xs text-muted-foreground truncate w-32 mt-1" title={order.note}>📝 {order.note}</div>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {order.paymentStatus === "PAID" ? (
                                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">ชำระแล้ว</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">รอชำระเงิน</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {order.shippingStatus === "WAITING" ? (
                                            <Badge variant="outline" className="bg-muted text-muted-foreground">รอเตรียมของ</Badge>
                                        ) : order.shippingStatus === "PREPARING" ? (
                                            <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">กำลังเตรียม</Badge>
                                        ) : order.shippingStatus === "READY" ? (
                                            <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">พร้อมส่ง</Badge>
                                        ) : order.shippingStatus === "SHIPPED" ? (
                                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">จัดส่งแล้ว</Badge>
                                        ) : (
                                            <Badge variant="outline">{order.shippingStatus}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="ดูใบเสร็จ" asChild>
                                                <Link href={`/orders/${order.id}/receipt`} target="_blank">
                                                    <ReceiptText className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <EditOrderDialog order={order} products={activeProducts} />
                                            <ViewOrderDialog order={order} />
                                            <DeleteOrderButton id={order.id} customerName={order.customerName} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
