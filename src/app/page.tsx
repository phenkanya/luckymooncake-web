import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, DollarSign, ShoppingBag, TrendingUp, Wallet, Banknote, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Top10SnacksChart } from "@/components/Top10SnacksChart";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [orders, productsCount, stockEntries, expenses] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    }),
    prisma.product.count(),
    prisma.stockEntry.count(),
    prisma.expense.findMany()
  ]);

  const totalExpenses = expenses.reduce((sum: any, exp: any) => sum + exp.amount, 0);
  const totalOrders = orders.length;

  // Calculate top 10 snacks
  const itemSummary: Record<string, { name: string, quantity: number }> = {};

  orders.forEach((order: any) => {
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

  // Calculate total revenue and profit from paid orders
  let totalSales = 0;
  let totalCost = 0;

  orders.forEach((order: any) => {
    if (order.paymentStatus === 'PAID') {
      totalSales += order.totalAmount;

      // Calculate cost for this order
      order.items?.forEach((item: any) => {
        const itemCost = item.product?.cost || 0;
        totalCost += (itemCost * item.quantity);
      });
    }
  });

  const totalProfit = totalSales - totalCost - totalExpenses;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
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
            <div className="text-2xl font-bold text-primary">฿{totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
            <div className="text-2xl font-bold">+{totalOrders.toLocaleString('th-TH')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              รอตรวจสอบและจัดส่ง
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">กำไรสุทธิ (Profit)</CardTitle>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">฿{totalProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ยอดขายหักต้นทุนและรายจ่ายแล้ว
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">รายจ่ายส่วนกลาง</CardTitle>
            <Wallet className="w-4 h-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">฿{totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              จากหน้าจัดการรายจ่าย
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Recent Orders Section */}
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
        <Card className="col-span-3 lg:col-span-3 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>ออเดอร์ล่าสุด (Recent)</CardTitle>
              <CardDescription>5 รายการสั่งซื้อล่าสุด</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
              <Link href="/orders">
                ดูทั้งหมด <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">ไม่มีออเดอร์ในระบบ</div>
            ) : (
              <div className="divide-y space-y-3">
                {recentOrders.map((order: any) => {
                  const totalQty = order.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
                  return (
                    <div key={order.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                      <div className="min-w-0 pr-2">
                        <div className="font-medium truncate">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {totalQty.toLocaleString('th-TH')} ชิ้น • {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {order.paymentStatus === "PAID" ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">จ่ายแล้ว</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium border border-amber-200">รอชำระ</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
