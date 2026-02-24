import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { DeleteExpenseButton } from "@/components/DeleteExpenseButton";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const expenses = await prisma.expense.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">รายจ่าย (Expenses)</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        บันทึกและจัดการค่าใช้จ่ายส่วนกลาง เช่น ค่ากล่อง ค่าแพ็กเกจ วัตถุดิบ
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">รวมรายจ่ายทั้งหมด</p>
                        <p className="text-xl font-bold text-red-500">฿{totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <AddExpenseDialog />
                </div>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[150px]">วันที่</TableHead>
                            <TableHead>รายการ</TableHead>
                            <TableHead className="text-right">จำนวนเงิน (บาท)</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    ยังไม่มีข้อมูลรายจ่ายในระบบ กรุณากด "เพิ่มรายจ่ายใหม่"
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow key={expense.id} className="hover:bg-muted/30">
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(expense.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                                    </TableCell>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell className="text-right font-medium text-red-500 dark:text-red-400">
                                        ฿{expense.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditExpenseDialog expense={expense} />
                                            <DeleteExpenseButton id={expense.id} description={expense.description} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
