"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
    const roundId = formData.get("roundId") as string;
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;
    const deliveryDateStr = formData.get("deliveryDate") as string;
    const note = formData.get("note") as string;
    const paymentStatus = formData.get("paymentStatus") as string;
    const shippingStatus = formData.get("shippingStatus") as string;
    const itemsJson = formData.get("items") as string;

    console.log("--- CREATING ORDER ---");
    console.log("Delivery Date:", deliveryDateStr);
    console.log("Note:", note);

    if (!customerName || !customerPhone || !itemsJson) {
        throw new Error("Missing required fields");
    }

    const items = JSON.parse(itemsJson) as { productId: string, quantity: number, price: number }[];
    if (items.length === 0) {
        throw new Error("Order must contain at least one item");
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // We need to associate with a round. If no roundId provided, grab the first active one.
    let finalRoundId = roundId;
    if (!finalRoundId) {
        const activeRound = await prisma.preorderRound.findFirst({
            where: { isActive: true },
            orderBy: { startDate: 'asc' }
        });
        if (activeRound) {
            finalRoundId = activeRound.id;
        } else {
            throw new Error("No active preorder round found");
        }
    }

    let deliveryDate = null;
    if (deliveryDateStr) {
        deliveryDate = new Date(deliveryDateStr);
    }

    await prisma.order.create({
        data: {
            roundId: finalRoundId,
            customerName,
            customerPhone,
            customerAddress: customerAddress || null,
            deliveryDate,
            note: note || null,
            paymentStatus: paymentStatus || "UNPAID",
            shippingStatus: shippingStatus || "WAITING",
            totalAmount,
            items: {
                create: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        },
    });

    revalidatePath("/orders");
    revalidatePath("/"); // Update dashboard counters
    revalidatePath("/dispatch");
}

export async function updateOrderStatus(orderId: string, paymentStatus: string, shippingStatus: string) {
    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    if (!existingOrder) throw new Error("Order not found");

    // If order is newly marked as SHIPPED, deduct from stock automatically
    if (existingOrder.shippingStatus !== "SHIPPED" && shippingStatus === "SHIPPED" && existingOrder.paymentStatus === "PAID") {
        for (const item of existingOrder.items) {
            if (item.productId) {
                await prisma.stockEntry.create({
                    data: {
                        productId: item.productId,
                        amount: -item.quantity, // Negative amount for deduction
                        note: `ตัดสต็อกอัตโนมัติจากออเดอร์ ${orderId.split('-')[0]}`
                    }
                });
            }
        }
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus, shippingStatus }
    });

    revalidatePath("/orders");
    revalidatePath("/stock");
    revalidatePath("/dispatch");
}

export async function updateOrder(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;
    const deliveryDateStr = formData.get("deliveryDate") as string;
    const note = formData.get("note") as string;
    const paymentStatus = formData.get("paymentStatus") as string;
    const shippingStatus = formData.get("shippingStatus") as string;
    const itemsJson = formData.get("items") as string;

    if (!orderId || !customerName || !customerPhone || !itemsJson) {
        throw new Error("Missing required fields");
    }

    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!existingOrder) throw new Error("Order not found");

    const items = JSON.parse(itemsJson) as { productId: string, quantity: number, price: number }[];
    if (items.length === 0) {
        throw new Error("Order must contain at least one item");
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let deliveryDate = null;
    if (deliveryDateStr) {
        deliveryDate = new Date(deliveryDateStr);
    }

    await prisma.order.update({
        where: { id: orderId },
        data: {
            customerName,
            customerPhone,
            customerAddress: customerAddress || null,
            deliveryDate,
            note: note || null,
            paymentStatus,
            shippingStatus,
            totalAmount,
            items: {
                deleteMany: {}, // Delete old items
                create: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        },
    });

    // If order is newly marked as SHIPPED, deduct from stock automatically
    // (We do this after updating the order so the items are fresh, but we use the new items)
    if (existingOrder.shippingStatus !== "SHIPPED" && shippingStatus === "SHIPPED" && paymentStatus === "PAID") {
        for (const item of items) {
            if (item.productId) {
                await prisma.stockEntry.create({
                    data: {
                        productId: item.productId,
                        amount: -item.quantity, // Negative amount for deduction
                        note: `ตัดสต็อกอัตโนมัติจากออเดอร์ ${orderId.split('-')[0]}`
                    }
                });
            }
        }
    }

    revalidatePath("/orders");
    revalidatePath("/");
    revalidatePath("/dispatch");
}

export async function deleteOrder(orderId: string) {
    await prisma.order.delete({
        where: { id: orderId }
    });
    revalidatePath("/orders");
    revalidatePath("/dispatch");
    revalidatePath("/");
}
