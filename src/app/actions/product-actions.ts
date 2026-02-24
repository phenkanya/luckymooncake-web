"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!name || !priceStr) {
        throw new Error("Missing required fields");
    }

    const price = parseFloat(priceStr);

    await prisma.product.create({
        data: {
            name,
            description,
            price,
            imageUrl: imageUrl || null,
            isActive: true, // Default to active
        },
    });

    revalidatePath("/menus");
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
    await prisma.product.update({
        where: { id },
        data: { isActive: !currentStatus }
    });
    revalidatePath("/menus");
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id }
    });
    revalidatePath("/menus");
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
}
