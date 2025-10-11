import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useAccounting } from "@/hooks/useAccounting";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Accounting = () => {
  const { transactions, isLoading, createTransaction } = useAccounting();

  const income = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const profit = income - expenses;

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <Breadcrumbs />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Accounting</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Track income and expenses</p>
          </div>
          <AddTransactionDialog onAdd={createTransaction} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Income"
            value={`Rs ${income.toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Expenses"
            value={`Rs ${expenses.toLocaleString()}`}
            icon={TrendingDown}
          />
          <StatCard
            title="Net Profit"
            value={`Rs ${profit.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No transactions yet. Add your first transaction!
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "Income" ? "default" : "destructive"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>Rs {Number(transaction.amount).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Accounting;
