"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Printer, Download, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export function PrintButton() {
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
            // Render high-resolution image of the receipt content
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: "#ffffff",
            });

            // Calculate exact dimensions so the PDF height fits the content perfectly
            const elementWidth = element.offsetWidth || element.scrollWidth || 400;
            const elementHeight = element.offsetHeight || element.scrollHeight || 600;

            const pdfWidthMm = 105; // Standard slip width (105mm)
            const pdfHeightMm = (elementHeight * pdfWidthMm) / elementWidth;

            // Create custom-sized PDF matching exact receipt content length
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
            a.download = `receipt-${Date.now()}.pdf`;
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

            const a = document.createElement("a");
            a.href = imgData;
            a.download = `receipt-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error generating image", error);
            alert("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
        } finally {
            setIsGeneratingImage(false);
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

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isGeneratingImage}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                    title="บันทึกเป็นรูปภาพสำหรับส่งให้ลูกค้าใน LINE / แชท"
                >
                    <ImageIcon className="w-4 h-4" />
                    {isGeneratingImage ? "กำลังเซฟรูป..." : "บันทึกรูป (LINE)"}
                </button>
                <button
                    type="button"
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                    title="ดาวน์โหลดเป็นไฟล์ PDF ความยาวพอดีเนื้อหา"
                >
                    <Download className="w-4 h-4" />
                    {isGeneratingPdf ? "กำลังสร้าง..." : "บันทึก PDF"}
                </button>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors"
                >
                    <Printer className="w-4 h-4" /> พิมพ์
                </button>
            </div>
        </div>
    );
}
