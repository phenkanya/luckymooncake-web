"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Printer, Download, ArrowLeft, Image as ImageIcon, ReceiptText, Percent } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface ReceiptViewProps {
    order: any;
}

export function ReceiptView({ order }: ReceiptViewProps) {
    // Default to DEPOSIT_50 if the order's payment status is DEPOSIT_50
    const [receiptMode, setReceiptMode] = useState<"FULL" | "DEPOSIT_50">(
        order.paymentStatus === "DEPOSIT_50" ? "DEPOSIT_50" : "FULL"
    );
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleGeneratePdf = async () => {
        const element = document.getElementById("receipt-content");
        if (!element) return;

        setIsGeneratingPdf(true);
        try {
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: "#ffffff",
            });

            const elementWidth = element.offsetWidth || element.scrollWidth || 400;
            const elementHeight = element.offsetHeight || element.scrollHeight || 600;

            const pdfWidthMm = 105; // Standard slip width (105mm)
            const pdfHeightMm = (elementHeight * pdfWidthMm) / elementWidth;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [pdfWidthMm, pdfHeightMm]
            });

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidthMm, pdfHeightMm);

            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const modeLabel = receiptMode === "DEPOSIT_50" ? "deposit50" : "full";
            a.download = `receipt-${order.id.split('-')[0]}-${modeLabel}-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error generating PDF", error);
            alert("เกิดข้อผิดพลาดในการสร้าง PDF: " + (error instanceof Error ? error.message : ""));
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadImage = async () => {
        const element = document.getElementById("receipt-content");
        if (!element) return;

        setIsGeneratingImage(true);
        try {
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: "#ffffff",
            });

            const response = await fetch(imgData);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const modeLabel = receiptMode === "DEPOSIT_50" ? "deposit50" : "full";
            a.download = `receipt-${order.id.split('-')[0]}-${modeLabel}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating image", error);
            alert("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const subtotal = order.items.reduce((s: number, i: any) => s + (i.price * i.quantity), 0);
    const discount = Math.max(0, subtotal - order.totalAmount);
    const discountPct = subtotal > 0 && discount > 0 ? Math.round((discount / subtotal) * 100) : 0;

    const depositAmount = order.totalAmount * 0.5;
    const remainingAmount = order.totalAmount - depositAmount;

    return (
        <div className="w-full flex flex-col items-center">
            {/* Top Toolbar */}
            <div className="w-full max-w-[440px] mb-4 print:hidden space-y-3">
                {/* Back and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> กลับ
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadImage}
                            disabled={isGeneratingImage}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                            title="บันทึกรูปภาพลงเครื่อง"
                        >
                            <ImageIcon className="w-4 h-4" />
                            {isGeneratingImage ? "กำลังบันทึก..." : "บันทึกรูปภาพ"}
                        </button>
                        <button
                            type="button"
                            onClick={handleGeneratePdf}
                            disabled={isGeneratingPdf}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                            title="ดาวน์โหลดเป็นไฟล์ PDF"
                        >
                            <Download className="w-4 h-4" />
                            {isGeneratingPdf ? "กำลังสร้าง..." : "บันทึก PDF"}
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors"
                        >
                            <Printer className="w-4 h-4" /> พิมพ์
                        </button>
                    </div>
                </div>

                {/* Receipt Mode Switcher (Full vs 50% Deposit) */}
                <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex gap-1 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setReceiptMode("FULL")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                            receiptMode === "FULL"
                                ? "bg-white text-slate-900 shadow-sm font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                    >
                        <ReceiptText className="w-4 h-4 text-blue-600" />
                        บิลเต็มจำนวน (100%)
                    </button>
                    <button
                        type="button"
                        onClick={() => setReceiptMode("DEPOSIT_50")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                            receiptMode === "DEPOSIT_50"
                                ? "bg-white text-blue-700 shadow-sm font-semibold border border-blue-200/60"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                    >
                        <Percent className="w-4 h-4 text-blue-600" />
                        บิลมัดจำ 50%
                    </button>
                </div>
            </div>

            {/* Receipt Card */}
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
                            {receiptMode === "DEPOSIT_50" ? "ใบเสร็จรับเงิน (มัดจำ 50%) / Deposit Receipt (50%)" : "ใบเสร็จรับเงิน / Receipt"}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                            <span>ID: #{order.id.split('-')[0].toUpperCase()}</span>
                            <span>{format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: th })} น.</span>
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
                                    📅 {format(new Date(order.deliveryDate), 'dd MMM yyyy', { locale: th })}
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

                    {/* Total & Deposit Breakdown */}
                    <div className="pt-3 border-t border-dashed border-slate-300">
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

                        <div className="flex justify-between items-center text-sm sm:text-base font-bold text-slate-800 pt-1">
                            <span>ยอดรวมทั้งสิ้น (Total)</span>
                            <span className={receiptMode === "DEPOSIT_50" ? "text-base font-bold text-slate-700" : "text-xl sm:text-2xl font-extrabold text-blue-600"}>
                                ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Deposit Breakdown Box (Visible when Deposit 50% is selected) */}
                        {receiptMode === "DEPOSIT_50" && (
                            <div className="mt-3.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between items-center text-emerald-800">
                                    <span className="font-medium flex items-center gap-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                        ยอดมัดจำ 50% (ชำระแล้ว):
                                    </span>
                                    <span className="font-bold text-sm sm:text-base text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/60">
                                        ฿{depositAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-blue-900 pt-1.5 border-t border-blue-200/60">
                                    <span className="font-semibold flex items-center gap-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                        ยอดคงเหลือชำระวันรับของ:
                                    </span>
                                    <span className="font-extrabold text-base sm:text-lg text-blue-700">
                                        ฿{remainingAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {order.note && (
                            <div className="mt-3.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                                <span className="font-semibold block mb-0.5">📝 หมายเหตุ:</span>
                                <div className="whitespace-pre-line leading-relaxed">{order.note}</div>
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
