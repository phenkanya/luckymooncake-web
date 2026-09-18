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
    const totalItems = Object.values(itemSummary).reduce((s, i) => s + i.quantity, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                    {title} <span className="text-sm font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{dateTitle}</span>
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    ออเดอร์ {orders.length} รายการ (รวม {totalItems.toLocaleString('th-TH')} ชิ้น)
                </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left side: Item Summary to prepare */}
                <div className="md:col-span-1 border bg-card rounded-xl p-6 shadow-sm flex flex-col h-fit">
                    <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
                        <span>รายการขนมที่ต้องเตรียม</span>
                        <span className="text-xs font-normal text-muted-foreground">{Object.keys(itemSummary).length} ชนิด</span>
                    </h3>
                    {Object.keys(itemSummary).length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-6">ไม่มีรายการที่ต้องเตรียมในรอบนี้</div>
                    ) : (
                        <ul className="space-y-3 divide-y">
                            {Object.values(itemSummary).map((item, idx) => (
                                <li key={idx} className="flex justify-between pt-3 first:pt-0">
                                    <span className="font-medium text-sm">{item.name}</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs border border-emerald-200">
                                        {item.quantity.toLocaleString('th-TH')} ชิ้น
                                    </span>
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
                                <TableHead className="text-center w-32">สถานะ</TableHead>
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
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{order.customerName}</span>
                                                {order.paymentStatus === "PAID" ? (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
                                                        จ่ายแล้ว
                                                    </span>
                                                ) : order.paymentStatus === "DEPOSIT_50" ? (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium border border-blue-200">
                                                        มัดจำ 50%
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium border border-amber-200">
                                                        รอชำระ
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">โทร: {order.customerPhone}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-[220px]" title={order.customerAddress}>
                                                ที่อยู่: {order.customerAddress || "-"}
                                            </div>
                                            {order.note && (
                                                <div className="text-xs mt-2 bg-yellow-50 text-yellow-800 p-1.5 rounded border border-yellow-100 whitespace-pre-line leading-snug">
                                                    📝 {order.note}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ul className="text-sm space-y-1">
                                                {order.items.map((item: any) => (
                                                    <li key={item.id} className="flex justify-between max-w-[200px]">
                                                        <span className="text-muted-foreground">{item.product?.name || "สินค้าถูกลบ"}</span>
                                                        <span className="font-medium">x{item.quantity.toLocaleString('th-TH')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-center pt-5">
                                            {order.shippingStatus === "READY" ? (
                                                <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">พร้อมส่ง</Badge>
                                            ) : order.shippingStatus === "PREPARING" ? (
                                                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">กำลังเตรียม</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">รอเตรียม</Badge>
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
    // 1. ดึงออเดอร์ทั้งหมดที่ยังไม่จัดส่ง และมีการระบุวันที่จัดส่ง
    const activeOrders = await prisma.order.findMany({
        where: {
            shippingStatus: {
                not: "SHIPPED"
            },
            deliveryDate: {
                not: null
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

    // 2. คำนวณวันตามเวลาประเทศไทย (Asia/Bangkok) เพื่อป้องกันปัญหา Timezone บน Serverless
    const getThaiDateString = (d: Date | string) => {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(d));
    };

    const now = new Date();
    const thaiNowStr = getThaiDateString(now);
    
    // สร้าง Date object สำหรับวันต่างๆ
    const [year, month, day] = thaiNowStr.split('-').map(Number);
    const today = new Date(year, month - 1, day);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const in2Days = new Date(today);
    in2Days.setDate(in2Days.getDate() + 2);

    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    const todayStr = getThaiDateString(today);
    const tomorrowStr = getThaiDateString(tomorrow);
    const in2DaysStr = getThaiDateString(in2Days);
    const in3DaysStr = getThaiDateString(in3Days);

    // Split orders into 4 target sections + future section
    // 1. วันนี้ (ออเดอร์ที่ deliveryDate <= วันนี้)
    const todayOrders = activeOrders.filter((o: any) =>
        o.deliveryDate && getThaiDateString(o.deliveryDate) <= todayStr
    );

    // 2. พรุ่งนี้ (+1 วัน)
    const tomorrowOrders = activeOrders.filter((o: any) =>
        o.deliveryDate && getThaiDateString(o.deliveryDate) === tomorrowStr
    );

    // 3. อีก 2 วัน (+2 วัน)
    const in2DaysOrders = activeOrders.filter((o: any) =>
        o.deliveryDate && getThaiDateString(o.deliveryDate) === in2DaysStr
    );

    // 4. อีก 3 วัน (+3 วัน)
    const in3DaysOrders = activeOrders.filter((o: any) =>
        o.deliveryDate && getThaiDateString(o.deliveryDate) === in3DaysStr
    );

    // 5. วันต่อๆ ไป (หลังจาก 3 วัน)
    const futureOrders = activeOrders.filter((o: any) =>
        o.deliveryDate && getThaiDateString(o.deliveryDate) > in3DaysStr
    );

    const dispatchSections = [
        {
            title: "จัดส่งวันนี้",
            date: today,
            orders: todayOrders,
        },
        {
            title: "จัดส่งพรุ่งนี้",
            date: tomorrow,
            orders: tomorrowOrders,
        },
        {
            title: "จัดส่งอีก 2 วัน",
            date: in2Days,
            orders: in2DaysOrders,
        },
        {
            title: "จัดส่งอีก 3 วัน",
            date: in3Days,
            orders: in3DaysOrders,
        }
    ];

    if (futureOrders.length > 0) {
        const after3Days = new Date(today);
        after3Days.setDate(after3Days.getDate() + 4);
        dispatchSections.push({
            title: "จัดส่งล่วงหน้า (หลังจาก 3 วัน)",
            date: after3Days,
            orders: futureOrders,
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">สรุปยอดจัดส่งประจำวัน</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        ข้อมูลออเดอร์และรายการขนมที่ต้องเตรียมแพ็คสำหรับรอบจัดส่งล่วงหน้า (คำนวณตามเวลาไทย)
                    </p>
                </div>
            </div>

            {dispatchSections.map((section, idx) => (
                <div key={idx} className="space-y-8">
                    {idx > 0 && <hr className="border-dashed" />}
                    <DispatchSection
                        title={section.title}
                        dateTitle={format(section.date, 'dd MMMM yyyy (EEEE)', { locale: th })}
                        orders={section.orders}
                    />
                </div>
            ))}
        </div>
    );
}
