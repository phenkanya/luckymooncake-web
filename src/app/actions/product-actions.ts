"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function ensureSortOrderColumn() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;`);
    } catch (error) {
        console.error("Column check error:", error);
    }
}

export async function addProduct(formData: FormData) {
    await ensureSortOrderColumn();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!name || !priceStr) {
        throw new Error("Missing required fields");
    }

    const price = parseFloat(priceStr);

    let maxSortOrder = 0;
    try {
        const existingProducts: any[] = await (prisma.product.findMany as any)();
        maxSortOrder = existingProducts.reduce((max: number, p: any) => Math.max(max, p.sortOrder || 0), 0);
    } catch (e) {
        // Ignored
    }

    await (prisma.product.create as any)({
        data: {
            name,
            description,
            price,
            sortOrder: maxSortOrder + 1,
            imageUrl: imageUrl || null,
            isActive: true, // Default to active
        },
    });

    revalidatePath("/menus");
    revalidatePath("/orders");
    revalidatePath("/stock");
    revalidatePath("/dispatch");
    revalidatePath("/");
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
    await prisma.product.update({
        where: { id },
        data: { isActive: !currentStatus }
    });
    revalidatePath("/menus");
    revalidatePath("/orders");
    revalidatePath("/stock");
    revalidatePath("/dispatch");
    revalidatePath("/");
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id }
    });
    revalidatePath("/menus");
    revalidatePath("/orders");
    revalidatePath("/stock");
    revalidatePath("/dispatch");
    revalidatePath("/");
}

export async function updateProduct(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!id || !name || !priceStr) {
        throw new Error("Missing required fields");
    }

    const price = parseFloat(priceStr);

    await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            imageUrl: imageUrl || null,
        },
    });

    revalidatePath("/menus");
    revalidatePath("/orders");
    revalidatePath("/stock");
    revalidatePath("/dispatch");
    revalidatePath("/");
}

export async function moveProductOrder(id: string, direction: "up" | "down") {
    await ensureSortOrderColumn();

    let products: any[] = [];
    try {
        products = await (prisma.product.findMany as any)({
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'asc' }
            ]
        });
    } catch (e) {
        products = await prisma.product.findMany({
            orderBy: { createdAt: 'asc' }
        });
    }

    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
        const temp = products[index];
        products[index] = products[index - 1];
        products[index - 1] = temp;
    } else if (direction === "down" && index < products.length - 1) {
        const temp = products[index];
        products[index] = products[index + 1];
        products[index + 1] = temp;
    }

    // Save updated positions
    for (let i = 0; i < products.length; i++) {
        try {
            await (prisma.product.update as any)({
                where: { id: products[i].id },
                data: { sortOrder: i }
            });
        } catch (err) {
            await prisma.$executeRawUnsafe(
                `UPDATE "Product" SET "sortOrder" = $1 WHERE "id" = $2`,
                i,
                products[i].id
            );
        }
    }

    revalidatePath("/menus");
    revalidatePath("/orders");
    revalidatePath("/stock");
    revalidatePath("/dispatch");
    revalidatePath("/");
}
