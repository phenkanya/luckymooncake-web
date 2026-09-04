"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ViewOrderDialog } from "@/components/ViewOrderDialog";
import { EditOrderDialog } from "@/components/EditOrderDialog";
import { DeleteOrderButton } from "@/components/DeleteOrderButton";
import { AddOrderDialog } from "@/components/AddOrderDialog";
import { Search, ReceiptText, ArrowUpDown, Filter, RotateCcw, RefreshCw } from "lucide-react";
import { syncAllOrderPrices } from "@/app/actions/order-actions";
import Link from "next/link";

interface OrdersTableProps {
    orders: any[];
    activeProducts: any[];
}

export function OrdersTable({ orders, activeProducts }: OrdersTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("created_desc");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [shippingFilter, setShippingFilter] = useState("ALL");
    const [isSyncing, setIsSyncing] = useState(false);

    async function handleSyncAllPrices() {
        if (!confirm("ต้องการอัปเดตราคาของออเดอร์ทั้งหมด (ที่ยังไม่ชำระเงิน) ให้ตรงกับราคาเมนูปัจจุบันใช่หรือไม่?")) return;
        setIsSyncing(true);
        try {
            const res = await syncAllOrderPrices(false);
            alert(`อัปเดตราคาเรียบร้อยแล้ว (${res.updatedCount} ออเดอร์ที่มีการปรับราคา)`);
        } catch (e) {
            console.error(e);
            alert("เกิดข้อผิดพลาดในการอัปเดตราคา");
        } finally {
            setIsSyncing(false);
        }
    }

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Search text match (Customer name, phone, order ID, note)
            const matchesSearch =
                !searchTerm ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerPhone.includes(searchTerm) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.note && order.note.toLowerCase().includes(searchTerm.toLowerCase()));

            // Payment status match
            const matchesPayment =
                paymentFilter === "ALL" || order.paymentStatus === paymentFilter;

            // Shipping status match
            const matchesShipping =
                shippingFilter === "ALL" || order.shippingStatus === shippingFilter;

            return matchesSearch && matchesPayment && matchesShipping;
        });
    }, [orders, searchTerm, paymentFilter, shippingFilter]);

    // Sort orders
    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            // 1. วันที่รับออเดอร์ (Created At)
            if (sortBy === "created_desc") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortBy === "created_asc") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }

            // 2. วันที่นัดส่ง (Delivery Date)
            if (sortBy === "delivery_asc") {
                if (!a.deliveryDate && !b.deliveryDate) return 0;
                if (!a.deliveryDate) return 1;
                if (!b.deliveryDate) return -1;
                return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
            }
            if (sortBy === "delivery_desc") {
                if (!a.deliveryDate && !b.deliveryDate) return 0;
                if (!a.deliveryDate) return 1;
                if (!b.deliveryDate) return -1;
                return new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime();
            }

            // 3. จำนวนชิ้นรวม (Item Quantity)
            if (sortBy === "qty_desc") {
                const qtyA = a.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                const qtyB = b.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                return qtyB - qtyA;
            }
            if (sortBy === "qty_asc") {
                const qtyA = a.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                const qtyB = b.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                return qtyA - qtyB;
            }

            // 4. ยอดเงินรวม (Total Amount)
            if (sortBy === "amount_desc") {
                return b.totalAmount - a.totalAmount;
            }
            if (sortBy === "amount_asc") {
                return a.totalAmount - b.totalAmount;
            }

            return 0;
        });
    }, [filteredOrders, sortBy]);

    const totalFilteredAmount = useMemo(() => {
        return sortedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    }, [sortedOrders]);

    const totalFilteredQuantity = useMemo(() => {
        return sortedOrders.reduce((sum, order) => {
            return sum + (order.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
        }, 0);
    }, [sortedOrders]);

    const isFiltered = searchTerm !== "" || sortBy !== "created_desc" || paymentFilter !== "ALL" || shippingFilter !== "ALL";

    const handleResetFilters = () => {
        setSearchTerm("");
        setSortBy("created_desc");
        setPaymentFilter("ALL");
        setShippingFilter("ALL");
    };

    return (
        <div className="space-y-6">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">จัดการออเดอร์ (Orders)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        ดูและสร้างออเดอร์ใหม่จากลูกค้า จัดการสถานะการชำระเงินและขนส่ง
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={handleSyncAllPrices}
                        disabled={isSyncing}
                        className="gap-2 shadow-sm text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                        title="อัปเดตราคาขนมในทุกออเดอร์ (ที่ยังไม่จ่าย) ให้ตรงกับราคาเมนูล่าสุด"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                        {isSyncing ? "กำลังปรับราคา..." : "ซิงค์ราคาตามเมนู"}
                    </Button>
                    <AddOrderDialog products={activeProducts} />
                </div>
            </div>

            {/* Filter & Sort Controls Bar */}
            <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาชื่อลูกค้า, เบอร์, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Sort Selector */}
                    <div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                    <SelectValue placeholder="เรียงลำดับ..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_desc">📅 วันที่รับ: ใหม่ล่าสุดก่อน</SelectItem>
                                <SelectItem value="created_asc">📅 วันที่รับ: เก่าสุดก่อน</SelectItem>
                                <SelectItem value="delivery_asc">🚚 วันที่ส่ง: เร็วสุดก่อน</SelectItem>
                                <SelectItem value="delivery_desc">🚚 วันที่ส่ง: ช้าสุดก่อน</SelectItem>
                                <SelectItem value="qty_desc">📦 จำนวนชิ้น: มาก ➔ น้อย</SelectItem>
                                <SelectItem value="qty_asc">📦 จำนวนชิ้น: น้อย ➔ มาก</SelectItem>
                                <SelectItem value="amount_desc">💰 ยอดเงิน: มาก ➔ น้อย</SelectItem>
                                <SelectItem value="amount_asc">💰 ยอดเงิน: น้อย ➔ มาก</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger className="w-full">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                    <SelectValue placeholder="สถานะชำระเงิน" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">สถานะชำระ: ทั้งหมด</SelectItem>
                                <SelectItem value="PAID">ชำระแล้ว</SelectItem>
                                <SelectItem value="UNPAID">รอชำระเงิน</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Shipping Status Filter */}
                    <div>
                        <Select value={shippingFilter} onValueChange={setShippingFilter}>
                            <SelectTrigger className="w-full">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                    <SelectValue placeholder="สถานะจัดส่ง" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">สถานะส่ง: ทั้งหมด</SelectItem>
                                <SelectItem value="WAITING">รอเตรียมของ</SelectItem>
                                <SelectItem value="PREPARING">กำลังเตรียม</SelectItem>
                                <SelectItem value="READY">พร้อมส่ง</SelectItem>
                                <SelectItem value="SHIPPED">จัดส่งแล้ว</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Filter Summary & Reset Button */}
                <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t gap-2">
                    <div className="flex items-center gap-2">
                        <span>พบทั้งหมด <strong className="text-foreground">{sortedOrders.length}</strong> ออเดอร์</span>
                        <span>•</span>
                        <span>รวม <strong className="text-foreground">{totalFilteredQuantity}</strong> ชิ้น</span>
                        <span>•</span>
                        <span>ยอดเงินรวม <strong className="text-emerald-600 dark:text-emerald-400">฿{totalFilteredAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></span>
                    </div>

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="w-3 h-3" /> ล้างตัวกรอง
                        </Button>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>รหัสออเดอร์ / ลูกค้า</TableHead>
                            <TableHead>จำนวน / ยอดรวม</TableHead>
                            <TableHead>วันที่รับออเดอร์</TableHead>
                            <TableHead>นัดรับ/จัดส่ง</TableHead>
                            <TableHead className="text-center">สถานะชำระเงิน</TableHead>
                            <TableHead className="text-center">การจัดส่ง</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    {isFiltered ? "ไม่พบออเดอร์ที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีออเดอร์ในระบบ"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedOrders.map((order) => {
                                const totalQty = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                                const itemsSubtotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
                                const hasDiscount = itemsSubtotal > order.totalAmount && itemsSubtotal > 0;
                                const discountAmount = hasDiscount ? itemsSubtotal - order.totalAmount : 0;
                                const discountPct = hasDiscount ? Math.round((discountAmount / itemsSubtotal) * 100) : 0;

                                const createdDate = new Date(order.createdAt);
                                const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : null;

                                return (
                                    <TableRow key={order.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-xs text-muted-foreground truncate w-40">
                                                ID: {order.id.split('-')[0]} • {order.items?.length || 0} รายการ
                                            </div>
                                            {order.customerPhone && (
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    📞 {order.customerPhone}
                                                </div>
                                            )}
                                            {order.note && (
                                                <div className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 mt-1 truncate max-w-[180px]" title={order.note}>
                                                    📝 {order.note}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                                <span>฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                {hasDiscount && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-semibold dark:bg-red-950 dark:text-red-400">
                                                        ลด {discountPct > 0 ? `${discountPct}%` : `฿${discountAmount.toLocaleString('th-TH')}`}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                รวม {totalQty.toLocaleString('th-TH')} ชิ้น {hasDiscount && <span className="line-through text-muted-foreground/70">(฿{itemsSubtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {createdDate.toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: '2-digit'
                                            })}
                                            <div className="text-[10px] text-muted-foreground">
                                                {createdDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {deliveryDate ? (
                                                <span className="font-medium text-foreground">
                                                    {deliveryDate.toLocaleDateString('th-TH', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                            {order.note && (
                                                <div className="text-xs text-muted-foreground truncate w-32 mt-1" title={order.note}>
                                                    📝 {order.note}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {order.paymentStatus === "PAID" ? (
                                                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">
                                                    ชำระแล้ว
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                                    รอชำระเงิน
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {order.shippingStatus === "WAITING" ? (
                                                <Badge variant="outline" className="bg-muted text-muted-foreground">รอเตรียมของ</Badge>
                                            ) : order.shippingStatus === "PREPARING" ? (
                                                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">กำลังเตรียม</Badge>
                                            ) : order.shippingStatus === "READY" ? (
                                                <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">พร้อมส่ง</Badge>
                                            ) : order.shippingStatus === "SHIPPED" ? (
                                                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">จัดส่งแล้ว</Badge>
                                            ) : (
                                                <Badge variant="outline">{order.shippingStatus}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5 items-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="ดูใบเสร็จ" asChild>
                                                    <Link href={`/orders/${order.id}/receipt`} target="_blank">
                                                        <ReceiptText className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <EditOrderDialog order={order} products={activeProducts} />
                                                <ViewOrderDialog order={order} />
                                                <DeleteOrderButton id={order.id} customerName={order.customerName} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
