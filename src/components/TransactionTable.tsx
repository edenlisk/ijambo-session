import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Transaction {
  id: string;
  transactionId: string;
  student: {
    name: string;
    id: string;
  };
  amount: string;
  type: string;
  paymentMethod: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionTableProps {
  transactions: Transaction[];
  onReceiptAction: (transaction: Transaction) => void;
  onVerifyAction: (transaction: Transaction) => void;
  onRetryAction: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onReceiptAction, onVerifyAction, onRetryAction }: TransactionTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-gray-900 text-white">completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAction = (action: string, transaction: Transaction) => {
    switch (action) {
      case 'receipt':
        onReceiptAction(transaction);
        break;
      case 'verify':
        onVerifyAction(transaction);
        break;
      case 'retry':
        onRetryAction(transaction);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Transaction ID</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Student</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Amount</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Type</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Payment Method</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Date</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="text-gray-900">{transaction.transactionId}</div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="text-gray-900">{transaction.student.name}</div>
                    <div className="text-gray-500 text-sm">{transaction.student.id}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-900">{transaction.amount}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-900">{transaction.type}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-900">{transaction.paymentMethod}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-600">{transaction.date}</div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="py-4 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {transaction.status === 'completed' && (
                        <DropdownMenuItem onClick={() => handleAction('receipt', transaction)}>
                          Receipt
                        </DropdownMenuItem>
                      )}
                      {transaction.status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleAction('verify', transaction)}>
                          Verify
                        </DropdownMenuItem>
                      )}
                      {transaction.status === 'failed' && (
                        <DropdownMenuItem onClick={() => handleAction('retry', transaction)}>
                          Retry
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}