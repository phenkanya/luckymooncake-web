import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const dynamic = 'force-dynamic';

function getItemSummary(orders: any[]) {
    const itemSummary: Record<string, { name: string, quantity: number }> = {};
    orders.forEach((order) => {
        order.items.forEach((item: any) => {
            const productId = item.productId || "deleted";
            const productName = item.product?.name || "สินค้าถูกลบ";

            if (itemSummary[productId]) {
                itemSummary[productId].quantity += item.quantity;
            } else {
                itemSummary[productId] = {
                    name: productName,
                    quantity: item.quantity
                };
            }
        });
    });
    return itemSummary;
}

function DispatchSection({ title, dateTitle, orders }: { title: string, dateTitle: string, orders: any[] }) {
    const itemSummary = getItemSummary(orders);
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                {title} <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{dateTitle}</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left side: Item Summary to prepare */}
                <div className="md:col-span-1 border bg-card rounded-xl p-6 shadow-sm flex flex-col h-fit">
                    <h3 className="font-semibold text-lg mb-4">รายการขนมที่ต้องเตรียม</h3>
                    {Object.keys(itemSummary).length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-6">ไม่มีรายการที่ต้องเตรียมในรอบนี้</div>
                    ) : (
                        <ul className="space-y-3 divide-y">
                            {Object.values(itemSummary).map((item, idx) => (
                                <li key={idx} className="flex justify-between pt-3 first:pt-0">
                                    <span className="font-medium text-sm">{item.name}</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">{item.quantity} ชิ้น</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Right side: Detailed Orders List */}
                <div className="md:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden h-fit">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>ข้อมูลลูกค้า</TableHead>
                                <TableHead>รายการในกล่อง</TableHead>
                                <TableHead className="text-center w-32">สถานะการส่ง</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                        ไม่มีออเดอร์ในรอบนี้
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order: any) => (
                                    <TableRow key={order.id} className="hover:bg-muted/30 align-top">
                                        <TableCell>
                                            <div className="font-bold">{order.customerName}</div>
                                            <div className="text-xs text-muted-foreground mt-1">โทร: {order.customerPhone}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-[200px]" title={order.customerAddress}>
                                                ที่อยู่: {order.customerAddress || "-"}
                                            </div>
                                            {order.note && (
                                                <div className="text-xs mt-2 bg-yellow-50 text-yellow-800 p-1 rounded border border-yellow-100 line-clamp-2">
                                                    📝 {order.note}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ul className="text-sm space-y-1">
                                                {order.items.map((item: any) => (
                                                    <li key={item.id} className="flex justify-between max-w-[200px]">
                                                        <span className="text-muted-foreground">{item.product?.name || "สินค้าถูกลบ"}</span>
                                                        <span className="font-medium">x{item.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-center pt-5">
                                            {order.shippingStatus === "READY" ? (
                                                <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">พร้อมส่ง</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">กำลังเตรียม</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default async function DispatchPage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Consider orders that are PAID or READY and have some dispatch relevance
    const activeOrders = await prisma.order.findMany({
        where: {
            paymentStatus: "PAID",
            shippingStatus: {
                in: ["WAITING", "PREPARING", "READY"]
            }
        },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            round: true
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log("--- DEBUG DISPATCH DATES ---");
    activeOrders.forEach(o => {
        console.log(`Order ${o.id.split('-')[0]} - deliveryDate from DB:`, o.deliveryDate);
    });
    console.log("Today:", today);
    console.log("Tomorrow:", tomorrow);

    // Helper to strip time from a date for pure date comparisons
    const isSameOrBeforeDate = (date1: Date, date2: Date) => {
        const d1 = new Date(date1);
        d1.setHours(0, 0, 0, 0);
        return d1.getTime() <= date2.getTime();
    };

    const isSameDate = (date1: Date, date2: Date) => {
        const d1 = new Date(date1);
        d1.setHours(0, 0, 0, 0);
        return d1.getTime() === date2.getTime();
    };

    // Split orders into Today and Tomorrow
    // Today includes orders that have deliveryDate <= today OR missing deliveryDate
    const todayOrders = activeOrders.filter((o: any) =>
        !o.deliveryDate || isSameOrBeforeDate(o.deliveryDate, today)
    );

    // Tomorrow includes orders exactly on tomorrow's date
    const tomorrowOrders = activeOrders.filter((o: any) =>
        o.deliveryDate && isSameDate(o.deliveryDate, tomorrow)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">สรุปยอดจัดส่งประจำวัน</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        ข้อมูลออเดอร์และรายการขนมที่ต้องเตรียมแพ็คสำหรับรอบจัดส่ง
                    </p>
                </div>
            </div>

            <DispatchSection
                title="จัดส่งวันนี้"
                dateTitle={format(today, 'dd MMMM yyyy', { locale: th })}
                orders={todayOrders}
            />

            <hr className="border-dashed" />

            <DispatchSection
                title="เตรียมจัดส่งพรุ่งนี้"
                dateTitle={format(tomorrow, 'dd MMMM yyyy', { locale: th })}
                orders={tomorrowOrders}
            />
        </div>
    );
}
