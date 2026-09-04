import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/OrdersTable";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const [orders, activeProducts] = await Promise.all([
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                },
                round: true
            }
        }),
        (prisma.product.findMany as any)({
            where: { isActive: true },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'asc' }
            ]
        }).catch(() => prisma.product.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }))
    ]);

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <OrdersTable orders={orders} activeProducts={activeProducts} />
        </div>
    );
}
