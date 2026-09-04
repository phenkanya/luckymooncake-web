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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-3 sm:px-6 flex flex-col items-center justify-start print:bg-white print:p-0">
            {/* Top Navigation & Action Buttons */}
            <div className="w-full max-w-[440px] mb-4 print:hidden">
                <PrintButton />
            </div>

            {/* Receipt Card (Fixed standard slip width ~420px - perfectly fits phones without scaling/scrolling) */}
            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-[80mm] print:rounded-none">
                <div
                    id="receipt-content"
                    className="p-6 sm:p-7 font-sans text-slate-800"
                    style={{ backgroundColor: "#ffffff", color: "#1e293b", minWidth: "100%", boxSizing: "border-box" }}
                >
                    {/* Header */}
                    <div className="text-center pb-5 border-b border-dashed border-slate-300">
                        <h1 className="text-2xl font-bold tracking-tight mb-1 text-blue-900">
                            Lucky Mooncake
                        </h1>
                        <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                            ใบเสร็จรับเงิน / Receipt
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                            <span>ID: #{order.id.split('-')[0].toUpperCase()}</span>
                            <span>{format(order.createdAt, 'dd MMM yyyy HH:mm', { locale: th })} น.</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="py-3.5 space-y-1.5 border-b border-dashed border-slate-300 text-xs sm:text-sm">
                        <div className="flex justify-between items-start gap-2">
                            <span className="text-slate-500 whitespace-nowrap">ลูกค้า:</span>
                            <span className="font-semibold text-slate-800 text-right">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-500 whitespace-nowrap">เบอร์โทร:</span>
                            <span className="font-mono text-slate-700">{order.customerPhone}</span>
                        </div>
                        {order.customerAddress && (
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-slate-500 whitespace-nowrap">ที่อยู่/จัดส่ง:</span>
                                <span className="text-right text-slate-700 text-xs">{order.customerAddress}</span>
                            </div>
                        )}
                        {order.deliveryDate && (
                            <div className="flex justify-between items-center gap-2 pt-0.5">
                                <span className="text-slate-500 whitespace-nowrap">วันที่นัดรับ/ส่ง:</span>
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                                    📅 {format(order.deliveryDate, 'dd MMM yyyy', { locale: th })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Order Items Table */}
                    <div className="py-4">
                        <table className="w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 pb-2">
                                    <th className="pb-2 w-10 text-center font-medium">จำนวน</th>
                                    <th className="pb-2 px-2 text-left font-medium">รายการ</th>
                                    <th className="pb-2 text-right font-medium">รวม</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.items.map((item: any) => (
                                    <tr key={item.id} className="text-slate-700">
                                        <td className="py-2.5 text-center align-top font-semibold text-slate-800">
                                            {item.quantity.toLocaleString('th-TH')}
                                        </td>
                                        <td className="py-2.5 px-2 align-top">
                                            <div className="font-medium text-slate-900 leading-tight">
                                                {item.product?.name || "สินค้าถูกลบ"}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                @{item.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="py-2.5 text-right align-top font-semibold text-slate-900 whitespace-nowrap">
                                            ฿{(item.quantity * item.price).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total & Discount Breakdown */}
                    <div className="pt-3 border-t border-dashed border-slate-300">
                        {(() => {
                            const subtotal = order.items.reduce((s: number, i: any) => s + (i.price * i.quantity), 0);
                            const discount = Math.max(0, subtotal - order.totalAmount);
                            const discountPct = subtotal > 0 && discount > 0 ? Math.round((discount / subtotal) * 100) : 0;

                            return (
                                <>
                                    {discount > 0 && (
                                        <div className="space-y-1 mb-2 text-xs sm:text-sm">
                                            <div className="flex justify-between text-slate-500">
                                                <span>ราคารวมสินค้า (Subtotal):</span>
                                                <span>฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-red-500">
                                                <span>ส่วนลดพิเศษ {discountPct > 0 ? `(${discountPct}%)` : ""} (Discount):</span>
                                                <span>-฿{discount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-base sm:text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                                        <span>ยอดรวมสุทธิ (Total)</span>
                                        <span className="text-xl sm:text-2xl font-extrabold text-blue-600">
                                            ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}

                        {order.note && (
                            <div className="mt-3.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                                <span className="font-semibold block mb-0.5">📝 หมายเหตุ:</span>
                                {order.note}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 pt-4 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-700">
                            ขอบคุณที่อุดหนุนขนมพรีเมียมของเราครับ! 😊
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            Lucky Mooncake • Homemade with Love
                        </p>
                        <div className="mt-3 text-[9px] tracking-widest text-slate-300 font-mono select-none">
                            ||| | ||| || ||| | || |||| | |||
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
