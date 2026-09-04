"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PrintButton() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleGeneratePdf = async () => {
        const element = document.getElementById("receipt-content");
        if (!element) return;

        setIsGenerating(true);
        try {
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "receipt.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error generating PDF", error);
            alert("เกิดข้อผิดพลาดในการสร้าง PDF: " + (error instanceof Error ? error.message : ""));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> กลับ
            </Link>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors"
                >
                    <Printer className="w-4 h-4" /> พิมพ์
                </button>
                <button
                    type="button"
                    onClick={handleGeneratePdf}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    {isGenerating ? "กำลังสร้าง..." : "บันทึก PDF"}
                </button>
            </div>
        </div>
    );
}
