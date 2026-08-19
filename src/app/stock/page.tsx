import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ManageStockDialog } from "@/components/ManageStockDialog";

export const dynamic = 'force-dynamic';

export default async function StockPage() {
    const [stockEntries, products, activeOrders] = await Promise.all([
        prisma.stockEntry.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                product: true
            },
            take: 50
        }),
        prisma.product.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                stock: true
            }
        }),
        prisma.order.findMany({
            where: {
                paymentStatus: "PAID",
                shippingStatus: {
                    not: "SHIPPED"
                }
            },
            include: {
                items: true
            }
        })
    ]);

    const productionPlan = products.map(product => {
        // Calculate total ordered quantity for this product
        const totalOrdered = activeOrders.reduce((sum, order) => {
            const item = order.items.find(i => i.productId === product.id);
            return sum + (item?.quantity || 0);
        }, 0);

        // Calculate current stock
        const currentStock = (product.stock || []).reduce((sum, entry) => sum + entry.amount, 0);

        // Calculate deficit (what needs to be produced)
        const toProduce = Math.max(0, totalOrdered - currentStock);

        return {
            id: product.id,
            name: product.name,
            totalOrdered,
            currentStock,
            toProduce
        };
    }).filter(p => p.totalOrdered > 0 || p.currentStock > 0); // Only show relevant products

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">สต็อกสินค้า (Stock)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        จัดการจำนวนสินค้าคงคลัง หรือจำนวนขนมที่ทำเสร็จแล้ว
                    </p>
                </div>
                <div className="flex gap-3">
                    <ManageStockDialog type="out" products={products} />
                    <ManageStockDialog type="in" products={products} />
                </div>
            </div>

            {/* Production Summary Section */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-6">
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        📋 แผนการผลิต (Production Summary)
                    </h2>
                    <span className="text-xs text-muted-foreground">จากออเดอร์ที่ชำระเงินแล้ว และยังไม่จัดส่ง</span>
                </div>
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow>
                            <TableHead>เมนู/สินค้า</TableHead>
                            <TableHead className="text-center">ยอดสั่งซื้อ (รอส่ง)</TableHead>
                            <TableHead className="text-center">สต็อกปัจจุบัน</TableHead>
                            <TableHead className="text-right">⚠️ ต้องผลิตเพิ่ม</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productionPlan.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    ยังไม่มีข้อมูลออเดอร์หรือสต็อก
                                </TableCell>
                            </TableRow>
                        ) : (
                            productionPlan.map((item) => (
                                <TableRow key={item.id} className={item.toProduce > 0 ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-muted/30"}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-center">{item.totalOrdered}</TableCell>
                                    <TableCell className="text-center">{item.currentStock}</TableCell>
                                    <TableCell className="text-right">
                                        {item.toProduce > 0 ? (
                                            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                                                ขาด {item.toProduce} ชิ้น
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-emerald-600 border-emerald-500 bg-emerald-50">
                                                ✅ เพียงพอ
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/30 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        🕒 ประวัติการเคลื่อนไหวสต็อกล่าสุด
                    </h2>
                </div>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>วัน/เวลา</TableHead>
                            <TableHead>เมนู/สินค้า</TableHead>
                            <TableHead className="text-center">ประเภท</TableHead>
                            <TableHead className="text-right">จำนวน</TableHead>
                            <TableHead>หมายเหตุ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stockEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    ยังไม่มีประวัติการจัดการสต็อก
                                </TableCell>
                            </TableRow>
                        ) : (
                            stockEntries.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-muted/30">
                                    <TableCell className="text-sm text-muted-foreground">
                                        {entry.createdAt.toLocaleString('th-TH')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {entry.product.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {entry.amount > 0 ? (
                                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">นำเข้า</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">นำออก</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${entry.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {entry.note || "-"}
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
