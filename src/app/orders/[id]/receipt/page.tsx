import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReceiptView } from "@/components/ReceiptView";

interface ReceiptPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: { product: true }
            },
            round: true
        }
    });

    if (!order) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-3 sm:px-6 flex flex-col items-center justify-start print:bg-white print:p-0">
            <ReceiptView order={order} />
        </div>
    );
}
