import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ManageStockDialog } from "@/components/ManageStockDialog";
import { ClearStockDialog } from "@/components/ClearStockDialog";

export const dynamic = 'force-dynamic';

export default async function StockPage() {
    const [stockEntries, products, activeOrders, shippedOrders] = await Promise.all([
        prisma.stockEntry.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                product: true
            },
            take: 50
        }),
        (prisma.product.findMany as any)({
            where: { isActive: true },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'asc' }
            ],
            include: {
                stock: true
            }
        }).catch(() => prisma.product.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, include: { stock: true } })),
        // 1. ออเดอร์ทั้งหมดที่รอส่ง (คิดทุกออเดอร์ ทั้งที่จ่ายแล้วและยังไม่จ่าย)
        prisma.order.findMany({
            where: {
                shippingStatus: {
                    not: "SHIPPED"
                }
            },
            include: {
                items: true
            }
        }),
        // 2. ออเดอร์ที่จัดส่ง/ขายเรียบร้อยแล้ว
        prisma.order.findMany({
            where: {
                shippingStatus: "SHIPPED"
            },
            include: {
                items: true
            }
        })
    ]);

    // Calculate Summary for ALL products
    const productionPlan = products.map(product => {
        // จำนวนออเดอร์ตอนนี้ (รอส่ง)
        const totalOrdered = activeOrders.reduce((sum, order) => {
            const item = order.items.find(i => i.productId === product.id);
            return sum + (item?.quantity || 0);
        }, 0);

        // ที่มีในสต็อกปัจจุบัน
        const currentStock = (product.stock || []).reduce((sum, entry) => sum + entry.amount, 0);

        // ขายแล้ว / จัดส่งแล้ว
        const totalSold = shippedOrders.reduce((sum, order) => {
            const item = order.items.find(i => i.productId === product.id);
            return sum + (item?.quantity || 0);
        }, 0);

        // ขาด / ต้องผลิตเพิ่ม
        const toProduce = Math.max(0, totalOrdered - currentStock);

        return {
            id: product.id,
            name: product.name,
            totalOrdered,
            currentStock,
            totalSold,
            toProduce
        };
    });

    const sumTotalOrdered = productionPlan.reduce((s, p) => s + p.totalOrdered, 0);
    const sumCurrentStock = productionPlan.reduce((s, p) => s + p.currentStock, 0);
    const sumTotalSold = productionPlan.reduce((s, p) => s + p.totalSold, 0);
    const sumToProduce = productionPlan.reduce((s, p) => s + p.toProduce, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header with Title and Stock Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">สต็อกสินค้า (Stock)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        จัดการจำนวนสินค้าคงคลัง คำนวณยอดผลิต และติดตามประวัติการนำเข้า-ออก
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                    <ClearStockDialog products={products} />
                    <ManageStockDialog type="out" products={products} />
                    <ManageStockDialog type="in" products={products} />
                </div>
            </div>

            {/* Quick KPI Cards for Stock Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">ออเดอร์ทั้งหมดตอนนี้ (รอส่ง)</div>
                    <div className="text-2xl font-bold text-primary mt-1">
                        {sumTotalOrdered.toLocaleString('th-TH')} <span className="text-xs font-normal text-muted-foreground">ชิ้น</span>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">คงเหลือในสต็อก</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {sumCurrentStock.toLocaleString('th-TH')} <span className="text-xs font-normal text-muted-foreground">ชิ้น</span>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">ขายแล้ว (จัดส่งแล้ว)</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {sumTotalSold.toLocaleString('th-TH')} <span className="text-xs font-normal text-muted-foreground">ชิ้น</span>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">ต้องผลิตเพิ่ม (ขาด)</div>
                    <div className={`text-2xl font-bold mt-1 ${sumToProduce > 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {sumToProduce > 0 ? `${sumToProduce.toLocaleString('th-TH')} ชิ้น` : "✅ พอดี"}
                    </div>
                </div>
            </div>

            {/* Main Stock & Production Summary Table */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="font-semibold text-base flex items-center gap-2">
                            📋 สรุปสต็อกและแผนการผลิต (Production & Stock Summary)
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            แสดงรายการขนมทั้งหมด คำนวณจากทุกออเดอร์ในระบบ (รวมทั้งที่ชำระแล้วและรอชำระเงิน)
                        </p>
                    </div>
                    <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                        ขนมทั้งหมด {productionPlan.length} รายการ
                    </span>
                </div>
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow>
                            <TableHead className="font-semibold">เมนู / สินค้า</TableHead>
                            <TableHead className="text-center font-semibold">ออเดอร์ตอนนี้ (รอส่ง)</TableHead>
                            <TableHead className="text-center font-semibold">ที่มีในสต็อก</TableHead>
                            <TableHead className="text-center font-semibold">ขายแล้ว (จัดส่งแล้ว)</TableHead>
                            <TableHead className="text-right font-semibold">สถานะ / ขาด</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productionPlan.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    ยังไม่มีรายการขนมในระบบ
                                </TableCell>
                            </TableRow>
                        ) : (
                            productionPlan.map((item) => (
                                <TableRow key={item.id} className={item.toProduce > 0 ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-muted/30"}>
                                    <TableCell className="font-medium text-sm">
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {item.totalOrdered > 0 ? (
                                            <span className="font-semibold text-primary">{item.totalOrdered.toLocaleString('th-TH')}</span>
                                        ) : (
                                            <span className="text-muted-foreground">0</span>
                                        )}
                                        <span className="text-xs text-muted-foreground ml-1">ชิ้น</span>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        <span className={item.currentStock > 0 ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-muted-foreground"}>
                                            {item.currentStock.toLocaleString('th-TH')}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-1">ชิ้น</span>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground text-sm">
                                        {item.totalSold > 0 ? (
                                            <span className="font-medium text-emerald-600">{item.totalSold.toLocaleString('th-TH')}</span>
                                        ) : (
                                            <span>0</span>
                                        )}
                                        <span className="text-xs ml-1">ชิ้น</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.toProduce > 0 ? (
                                            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 font-semibold">
                                                ขาด {item.toProduce.toLocaleString('th-TH')} ชิ้น
                                            </Badge>
                                        ) : item.totalOrdered > 0 ? (
                                            <Badge variant="outline" className="text-emerald-600 border-emerald-500 bg-emerald-50">
                                                ✅ เพียงพอ
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">พร้อมรับออเดอร์</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Stock Movement History Section */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold flex items-center gap-2">
                            🕒 ประวัติการเคลื่อนไหวสต็อกล่าสุด
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            บันทึกรายการนำเข้า ตัดออก และการล้างสต็อก
                        </p>
                    </div>
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
                                        {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString('th-TH')}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-[220px]" title={entry.note || ""}>
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
