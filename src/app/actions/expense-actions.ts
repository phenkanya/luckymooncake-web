"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addExpense(formData: FormData) {
    const description = formData.get("description") as string;
    const amountStr = formData.get("amount") as string;

    if (!description || !amountStr) {
        throw new Error("Missing required fields");
    }

    const amount = parseFloat(amountStr);

    await prisma.expense.create({
        data: {
            description,
            amount,
        },
    });

    revalidatePath("/expenses");
    revalidatePath("/");
}

export async function updateExpense(formData: FormData) {
    const id = formData.get("id") as string;
    const description = formData.get("description") as string;
    const amountStr = formData.get("amount") as string;

    if (!id || !description || !amountStr) {
        throw new Error("Missing required fields");
    }

    const amount = parseFloat(amountStr);

    await prisma.expense.update({
        where: { id },
        data: {
            description,
            amount,
        },
    });

    revalidatePath("/expenses");
    revalidatePath("/");
}

export async function deleteExpense(id: string) {
    await prisma.expense.delete({
        where: { id }
    });

    revalidatePath("/expenses");
    revalidatePath("/");
}
