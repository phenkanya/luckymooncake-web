"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export function PrintButton() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePdf = async () => {
        const element = document.getElementById("receipt-content");
        if (!element) return;

        setIsGenerating(true);
        try {
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 2,
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            // Explicitly create a Blob and download it to force the correct filename
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
            alert("Error generating PDF: " + (error instanceof Error ? error.message : ""));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
        >
            {isGenerating ? "กำลังสร้าง PDF..." : "Create PDF"}
        </button>
    );
}
