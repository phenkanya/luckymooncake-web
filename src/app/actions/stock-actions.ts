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
