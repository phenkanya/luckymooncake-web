import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // Clean up existing data securely
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.stockEntry.deleteMany()
    await prisma.preorderRound.deleteMany()
    await prisma.product.deleteMany()

    // 1. Create Preorder Round
    const round1 = await prisma.preorderRound.create({
        data: {
            name: "รอบไหว้พระจันทร์ ฮั่วเซ่งฮง 2026",
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            deliveryDate: new Date(new Date().setDate(new Date().getDate() + 15)),
            isActive: true,
        }
    })

    // 2. Create Products
    const p1 = await prisma.product.create({
        data: {
            name: "ขนมไหว้พระจันทร์ไส้ทุเรียนไข่คู่",
            description: "สูตรดั้งเดิม แป้งบาง ไส้เนียน หอมทุเรียนหมอนทอง",
            price: 159,
            isActive: true,
        }
    })

    const p2 = await prisma.product.create({
        data: {
            name: "ขนมไหว้พระจันทร์ไส้โหงวยิ้ง",
            description: "ธัญพืช 5 ชนิด กรุบกรอบ หอมน้ำมันงา",
            price: 139,
            isActive: true,
        }
    })

    const p3 = await prisma.product.create({
        data: {
            name: "ขนมเปี๊ยะลาวาไข่เค็ม (กล่อง 4 ชิ้น)",
            description: "ขนมเปี๊ยะแป้งนุ่ม ไส้ลาวาไข่เค็มเยิ้มๆ ทานคู่กับชา",
            price: 250,
            isActive: true,
        }
    })

    // 3. Create Stock Entries (Initial Stock)
    await prisma.stockEntry.createMany({
        data: [
            { productId: p1.id, amount: 100, note: "นำเข้าล็อตแรก" },
            { productId: p2.id, amount: 50, note: "นำเข้าล็อตแรก" },
            { productId: p3.id, amount: 200, note: "เปี๊ยะลาวาพร้อมส่ง" },
        ]
    })

    // 4. Create Mock Orders
    const order1 = await prisma.order.create({
        data: {
            roundId: round1.id,
            customerName: "คุณสมหญิง ใจดี",
            customerPhone: "081-234-5678",
            customerAddress: "123 หมู่บ้านสุขสันต์ ถนนลาดพร้าว กทม. 10230",
            paymentStatus: "PAID",
            shippingStatus: "WAITING",
            totalAmount: 159 * 2 + 139, // 2x ทุเรียน, 1x โหงวยิ้ง
            items: {
                create: [
                    { productId: p1.id, quantity: 2, price: 159 },
                    { productId: p2.id, quantity: 1, price: 139 },
                ]
            }
        }
    })

    const order2 = await prisma.order.create({
        data: {
            roundId: round1.id,
            customerName: "ทดสอบ รอจ่าย",
            customerPhone: "099-999-9999",
            paymentStatus: "UNPAID",
            shippingStatus: "WAITING",
            totalAmount: 250 * 5,
            items: {
                create: [
                    { productId: p3.id, quantity: 5, price: 250 },
                ]
            }
        }
    })

    const order3 = await prisma.order.create({
        data: {
            roundId: round1.id,
            customerName: "พี่แจ็ค คนจริง",
            customerPhone: "088-777-6666",
            customerAddress: "คอนโดหรู ใจกลางเมือง สีลม",
            paymentStatus: "PAID",
            shippingStatus: "READY",
            totalAmount: 159 * 4,
            items: {
                create: [
                    { productId: p1.id, quantity: 4, price: 159 },
                ]
            }
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
