import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddMenuDialog } from "@/components/AddMenuDialog";
import { EditMenuDialog } from "@/components/EditMenuDialog";
import { DeleteMenuButton } from "@/components/DeleteMenuButton";

export const dynamic = 'force-dynamic';

export default async function MenusPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">จัดการเมนู (Menus)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        เพิ่ม ลบ หรือแก้ไขแคตตาล็อกสินค้าที่คุณต้องการเปิดรับพรีออเดอร์
                    </p>
                </div>
                <AddMenuDialog />
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>ชื่อเมนู</TableHead>
                            <TableHead className="text-right">ต้นทุน</TableHead>
                            <TableHead className="text-right">ราคาขาย</TableHead>
                            <TableHead className="text-right">กำไรต่อชิ้น</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    ยังไม่มีข้อมูลเมนูในระบบ กรุณากด "เพิ่มเมนูใหม่"
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        ฿{(product.cost || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                        ฿{product.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                                        ฿{(product.price - (product.cost || 0)).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditMenuDialog product={product} />
                                            <DeleteMenuButton id={product.id} name={product.name} />
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
