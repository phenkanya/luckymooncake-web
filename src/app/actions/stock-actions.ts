"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStockEntry(formData: FormData) {
    const productId = formData.get("productId") as string;
    const amountStr = formData.get("amount") as string;
    const type = formData.get("type") as string; // 'in' or 'out'
    const note = formData.get("note") as string;

    if (!productId || !amountStr || !type) {
        throw new Error("Missing required fields");
    }

    let amount = parseInt(amountStr, 10);
    if (type === "out") {
        amount = -Math.abs(amount); // Ensure it's negative for 'out'
    } else {
        amount = Math.abs(amount); // Ensure it's positive for 'in'
    }

    await prisma.stockEntry.create({
        data: {
            productId,
            amount,
            note: note || null,
        },
    });

    revalidatePath("/stock");
    revalidatePath("/"); // Update dashboard counters too
}

export async function clearAllStock(note?: string) {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { stock: true }
    });

    for (const product of products) {
        const currentStock = (product.stock || []).reduce((sum, entry) => sum + entry.amount, 0);
        if (currentStock !== 0) {
            await prisma.stockEntry.create({
                data: {
                    productId: product.id,
                    amount: -currentStock, // Offset to zero
                    note: note || "ล้างสต็อกเป็น 0 (รีเซ็ตสต็อกทั้งหมด)",
                }
            });
        }
    }

    revalidatePath("/stock");
    revalidatePath("/");
}

export async function clearProductStock(productId: string, note?: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { stock: true }
    });

    if (!product) throw new Error("Product not found");

    const currentStock = (product.stock || []).reduce((sum, entry) => sum + entry.amount, 0);
    if (currentStock !== 0) {
        await prisma.stockEntry.create({
            data: {
                productId: product.id,
                amount: -currentStock,
                note: note || `ล้างสต็อก ${product.name} เป็น 0`,
            }
        });
    }

    revalidatePath("/stock");
    revalidatePath("/");
}
