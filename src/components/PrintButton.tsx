"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Printer, Download, ArrowLeft, Image as ImageIcon, Share2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PrintButton() {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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

            // Convert to Blob & File for Mobile Web Share API
            const response = await fetch(imgData);
            const blob = await response.blob();
            const file = new File([blob], `receipt-${Date.now()}.png`, { type: "image/png" });

            // If mobile supports Web Share API with files (iOS Safari, Chrome Android)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: "ใบเสร็จ Lucky Mooncake",
                        text: "ใบเสร็จรับเงิน Lucky Mooncake",
                    });
                    setIsGeneratingImage(false);
                    return;
                } catch (shareError: any) {
                    if (shareError.name !== "AbortError") {
                        console.error("Share failed", shareError);
                    }
                }
            }

            // If on computer / desktop: trigger direct download
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
                const a = document.createElement("a");
                a.href = imgData;
                a.download = `receipt-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                // On mobile if share was skipped/not supported, open modal preview
                setPreviewImageUrl(imgData);
            }

        } catch (error) {
            console.error("Error generating image", error);
            alert("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return (
        <>
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
                        title="แชร์รูปเข้า LINE หรือบันทึกลงโทรศัพท์"
                    >
                        <ImageIcon className="w-4 h-4" />
                        {isGeneratingImage ? "กำลังเตรียมรูป..." : "แชร์รูป / LINE"}
                    </button>
                    <button
                        type="button"
                        onClick={handleGeneratePdf}
                        disabled={isGeneratingPdf}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                        title="ดาวน์โหลดเป็นไฟล์ PDF ความยาวพอดีเนื้อหา"
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

            {/* Mobile Image Preview Modal (for instant saving by long-press) */}
            <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base text-emerald-800 flex items-center gap-2">
                            📱 แตะค้างที่รูปภาพเพื่อบันทึก
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            แตะค้างที่รูปสลิปด้านล่าง แล้วเลือก <b>"บันทึกรูปภาพ"</b> หรือ <b>"แชร์ไปที่ LINE"</b> ได้ทันที
                        </DialogDescription>
                    </DialogHeader>

                    {previewImageUrl && (
                        <div className="py-2 flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewImageUrl}
                                alt="ใบเสร็จรับเงิน"
                                className="w-full max-w-[340px] rounded-xl shadow-md border"
                            />
                        </div>
                    )}

                    <div className="pt-2 flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewImageUrl(null)}>
                            ปิดหน้าต่าง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
