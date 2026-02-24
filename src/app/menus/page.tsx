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
                            <TableHead className="w-[80px]">รูปภาพ</TableHead>
                            <TableHead>ชื่อเมนู</TableHead>
                            <TableHead>รายละเอียด</TableHead>
                            <TableHead className="text-right">ราคา</TableHead>
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
                                    <TableCell>
                                        {product.imageUrl ? (
                                            <div className="w-10 h-10 rounded bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">ไม่มีรูป</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                        {product.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                                        ฿{product.price.toFixed(2)}
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
