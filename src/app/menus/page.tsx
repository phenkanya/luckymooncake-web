import { prisma } from "@/lib/prisma";
import { AddMenuDialog } from "@/components/AddMenuDialog";
import { MenusTable } from "@/components/MenusTable";

export const dynamic = 'force-dynamic';

export default async function MenusPage() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;`);
    } catch (e) {
        // Table/column might already exist
    }

    const products = await prisma.product.findMany({
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' }
        ]
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">จัดการเมนู (Menus)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        เพิ่ม ลบ แก้ไข หรือจัดเรียงลำดับรายการขนมที่ต้องการเปิดรับพรีออเดอร์
                    </p>
                </div>
                <AddMenuDialog />
            </div>

            <MenusTable products={products} />
        </div>
    );
}
