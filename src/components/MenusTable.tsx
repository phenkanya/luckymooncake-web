"use client";

import { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditMenuDialog } from "@/components/EditMenuDialog";
import { DeleteMenuButton } from "@/components/DeleteMenuButton";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { moveProductOrder } from "@/app/actions/product-actions";
import { Product } from "@prisma/client";

interface MenusTableProps {
    products: any[];
}

export function MenusTable({ products }: MenusTableProps) {
    const [isPending, startTransition] = useTransition();
    const [movingId, setMovingId] = useState<string | null>(null);

    const handleMove = (id: string, direction: "up" | "down") => {
        setMovingId(id);
        startTransition(async () => {
            try {
                await moveProductOrder(id, direction);
            } catch (error) {
                console.error("Failed to reorder product", error);
            } finally {
                setMovingId(null);
            }
        });
    };

    if (products.length === 0) {
        return (
            <div className="bg-card rounded-xl border shadow-sm p-12 text-center text-muted-foreground">
                ยังไม่มีข้อมูลเมนูในระบบ กรุณากด "เพิ่มเมนูใหม่" ด้านบน
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-base flex items-center gap-2">
                        📋 รายการเมนูทั้งหมด ({products.length} รายการ)
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        กดปุ่มลูกศร ⬆️ / ⬇️ เพื่อปรับเปลี่ยนลำดับการแสดงผลเมนูได้ตามต้องการ
                    </p>
                </div>
            </div>
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-20 text-center font-semibold">ลำดับ</TableHead>
                        <TableHead className="font-semibold">เมนูขนม</TableHead>
                        <TableHead className="text-right font-semibold">ราคาขาย</TableHead>
                        <TableHead className="w-32 text-center font-semibold">ปรับลำดับ</TableHead>
                        <TableHead className="text-right font-semibold">จัดการ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product, index) => {
                        const isFirst = index === 0;
                        const isLast = index === products.length - 1;
                        const isThisMoving = movingId === product.id && isPending;

                        return (
                            <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted font-bold text-foreground">
                                        #{index + 1}
                                    </span>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                        <span>{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                    ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            disabled={isFirst || isPending}
                                            onClick={() => handleMove(product.id, "up")}
                                            className="h-8 w-8 text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30"
                                            title="เลื่อนขึ้น"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            disabled={isLast || isPending}
                                            onClick={() => handleMove(product.id, "down")}
                                            className="h-8 w-8 text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30"
                                            title="เลื่อนลง"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <EditMenuDialog product={product} />
                                        <DeleteMenuButton id={product.id} name={product.name} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
