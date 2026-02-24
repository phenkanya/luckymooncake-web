import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Top10SnacksChart } from "@/components/Top10SnacksChart";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [orders, productsCount, stockEntries] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      }
    }),
    prisma.product.count(),
    prisma.stockEntry.count(),
  ]);

  const totalOrders = orders.length;

  // Calculate top 10 snacks
  const itemSummary: Record<string, { name: string, quantity: number }> = {};

  orders.forEach((order: any) => {
    // Only count items from PAID orders to reflect actual sales, 
    // or you can remove this condition to count all placed orders.
    // Let's count all to match "จำนวนขนมที่สั่ง" (ordered amount).
    order.items?.forEach((item: any) => {
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

  const top10Snacks = Object.values(itemSummary)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Calculate metrics
  const totalSales = orders
    .filter((o: any) => o.paymentStatus === "PAID")
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o: any) => o.paymentStatus !== "PAID").length;

  // A simple sum of all shipped/ready to give an idea of out process
  const completedOrders = orders.filter((o: any) => o.shippingStatus === "SHIPPED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            ยินดีต้อนรับสู่ระบบจัดการพรีออเดอร์ Lucky Mooncake (ลัคกี้ มูนเค้ก)
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">ยอดขายรวม (Paid)</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              จากออเดอร์ที่ชำระเงินแล้ว
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">ออเดอร์ทั้งหมด</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              รอตรวจสอบและจัดส่ง
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">เมนูขนมในระบบ</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount} เมนู</div>
            <p className="text-xs text-muted-foreground mt-1">
              สินค้าทั้งหมดที่เปิดขาย
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">ความเคลื่อนไหวสต็อก</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockEntries} รายการ</div>
            <p className="text-xs text-muted-foreground mt-1">
              ประวัติการนำเข้า-ออก
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>10 อันดับขนมขายดี (Top 10)</CardTitle>
            <CardDescription>เรียงตามจำนวนชิ้นที่ถูกสั่งซื้อทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <Top10SnacksChart data={top10Snacks} />
          </CardContent>
        </Card>
        <Card className="col-span-3 lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>ออเดอร์รอดำเนินการ (Recent)</CardTitle>
            <CardDescription>ที่ต้องตรวจสอบสลิป</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">ไม่มีออเดอร์ใหม่</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
