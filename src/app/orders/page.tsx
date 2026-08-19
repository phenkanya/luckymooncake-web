import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/OrdersTable";

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
        <div className="animate-in fade-in duration-500 pb-10">
            <OrdersTable orders={orders} activeProducts={activeProducts} />
        </div>
    );
}
