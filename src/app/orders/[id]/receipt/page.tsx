import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { PrintButton } from "@/components/PrintButton";

interface ReceiptPageProps {
    params: {
        id: string;
    };
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
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center print:bg-white print:p-0">
            <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl print:shadow-none print:max-w-none print:w-[80mm] print:p-4">

                {/* Print Button (Hidden in Print Mode) */}
                <div className="flex justify-end mb-6 print:hidden">
                    <PrintButton />
                </div>

                {/* Receipt Wrapper (Styled for 80mm thermal printers or standard A4) */}
                <div id="receipt-content" className="font-sans p-4" style={{ backgroundColor: "#ffffff", color: "#1f2937" }}>
                    {/* Header */}
                    <div className="text-center pb-6 border-b border-dashed" style={{ borderColor: "#e5e7eb" }}>
                        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "#1e3a8a" }}>Lucky Mooncake</h1>
                        <p className="text-sm" style={{ color: "#6b7280" }}>ใบเสร็จรับเงิน / Receipt</p>
                        <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>ID: {order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>วันที่: {format(order.createdAt, 'dd MMM yyyy HH:mm', { locale: th })}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="py-4 space-y-1 border-b border-dashed text-sm" style={{ borderColor: "#e5e7eb" }}>
                        <div className="flex justify-between">
                            <span style={{ color: "#6b7280" }}>ลูกค้า:</span>
                            <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: "#6b7280" }}>เบอร์โทร:</span>
                            <span>{order.customerPhone}</span>
                        </div>
                        {order.deliveryDate && (
                            <div className="flex justify-between">
                                <span style={{ color: "#6b7280" }}>วันที่นัดรับ:</span>
                                <span className="font-medium" style={{ color: "#059669" }}>{format(order.deliveryDate, 'dd MMM yyyy', { locale: th })}</span>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="py-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b font-medium pb-2 text-left" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                                    <th className="pb-3 w-12 text-center">จำนวน</th>
                                    <th className="pb-3 px-2">รายการ</th>
                                    <th className="pb-3 text-right">รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: any) => (
                                    <tr key={item.id} className="border-b" style={{ borderColor: "#f3f4f6", color: "#374151" }}>
                                        <td className="py-3 text-center align-top">{item.quantity}</td>
                                        <td className="py-3 px-2 align-top" style={{ color: "#1f2937" }}>{item.product?.name || "สินค้าถูกลบ"}
                                            <div className="text-xs" style={{ color: "#9ca3af" }}>@{item.price.toFixed(2)}</div>
                                        </td>
                                        <td className="py-3 text-right align-top font-medium">✨ {(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total & Note */}
                    <div className="pt-4 border-t border-dashed" style={{ borderColor: "#d1d5db" }}>
                        {(() => {
                            const subtotal = order.items.reduce((s: number, i: any) => s + (i.price * i.quantity), 0);
                            const discount = Math.max(0, subtotal - order.totalAmount);
                            const discountPct = subtotal > 0 && discount > 0 ? Math.round((discount / subtotal) * 100) : 0;

                            return (
                                <>
                                    {discount > 0 && (
                                        <div className="space-y-1 mb-3 text-sm">
                                            <div className="flex justify-between" style={{ color: "#6b7280" }}>
                                                <span>ราคารวมสินค้า (Subtotal):</span>
                                                <span>฿ {subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium" style={{ color: "#ef4444" }}>
                                                <span>ส่วนลดพิเศษ {discountPct > 0 ? `(${discountPct}%)` : ""} (Discount):</span>
                                                <span>- ฿ {discount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-lg font-bold mb-4" style={{ color: "#111827" }}>
                                        <span>ยอดรวมสุทธิ (Total)</span>
                                        <span className="text-2xl" style={{ color: "#2563eb" }}>฿ {order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </>
                            );
                        })()}

                        {order.note && (
                            <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#f9fafb", color: "#4b5563" }}>
                                <span className="font-medium block mb-1" style={{ color: "#111827" }}>หมายเหตุ:</span>
                                {order.note}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-4">
                        <p className="text-sm font-medium" style={{ color: "#1f2937" }}>ขอบคุณที่อุดหนุนขนมพรีเมียมของเราครับ! 😊</p>
                        <div className="mt-4 blur-[1px] opacity-20 select-none text-xs">
                            ||| | | || || | | || | | ||
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
