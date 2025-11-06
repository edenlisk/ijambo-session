import React, { useState } from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { StatCard } from './StatCard';
import { TransactionTable } from './TransactionTable';
import { toast } from 'sonner';

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

const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'PAY2024E2214',
    student: { name: 'Adaego Boniface', id: 'STU/2021/001' },
    amount: '₦51,000',
    type: 'School Fees',
    paymentMethod: 'Bank Transfer',
    date: '2024-01-20',
    status: 'completed'
  },
  {
    id: '2',
    transactionId: 'PAY2467HMEC19',
    student: { name: 'Tunuka Bakara', id: 'STU/2021/003' },
    amount: '₦12,000',
    type: 'Uniform',
    paymentMethod: 'Card',
    date: '2024-01-19',
    status: 'pending'
  },
  {
    id: '3',
    transactionId: 'PAY2467HMEC16',
    student: { name: 'Grace Chibora', id: 'STU/2021/003' },
    amount: '₦9,500',
    type: 'Books',
    paymentMethod: 'USSD',
    date: '2024-01-18',
    status: 'completed'
  },
  {
    id: '4',
    transactionId: 'PAY2467HMEC17',
    student: { name: 'Yusuf Ibrahim', id: 'STU/2021/004' },
    amount: '₦12,000',
    type: 'School Fees',
    paymentMethod: 'Bank Transfer',
    date: '2024-01-17',
    status: 'failed'
  },
  {
    id: '5',
    transactionId: 'PAY2467HMEC18',
    student: { name: 'Adaego Chioma', id: 'STU/2021/002' },
    amount: '₦45,000',
    type: 'Excursion',
    paymentMethod: 'Card',
    date: '2024-01-16',
    status: 'completed'
  },
  {
    id: '6',
    transactionId: 'PAY2024E2219',
    student: { name: 'Emeka Adaokwu', id: 'STU/2021/006' },
    amount: '₦25,000',
    type: 'House fees',
    paymentMethod: 'Bank Transfer',
    date: '2024-01-13',
    status: 'pending'
  }
];

export function PaymentManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');

  const handleRefresh = () => {
    toast.success('Payment data refreshed successfully!');
  };

  const handleExportReport = () => {
    toast.success('Payment report exported successfully!');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleReceiptAction = (transaction: Transaction) => {
    toast.success(`Receipt generated for ${transaction.student.name}`);
  };

  const handleVerifyAction = (transaction: Transaction) => {
    toast.info(`Verifying payment for ${transaction.student.name}...`);
  };

  const handleRetryAction = (transaction: Transaction) => {
    toast.info(`Retrying payment for ${transaction.student.name}...`);
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex-1 bg-gray-50 h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl text-gray-900 mb-2">Payment Management</h1>
            <p className="text-gray-600">Monitor tuition transactions and payment collections</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="border-gray-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleExportReport}
              variant="outline"
              className="border-gray-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Collected"
            value="₦151,500"
            subtitle="This week"
            valueColor="text-green-600"
          />
          <StatCard
            title="Pending Amount"
            value="₦37,000"
            subtitle="This week pending"
            valueColor="text-orange-600"
          />
          <StatCard
            title="Failed Payments"
            value="₦45,000"
            subtitle="Failed Payments"
            valueColor="text-red-600"
          />
          <StatCard
            title="Total Transactions"
            value="6"
            subtitle="All time"
          />
          <StatCard
            title="Completed Today"
            value="3"
            subtitle="All time"
            trend={{ value: "2% drop", isPositive: false }}
          />
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg text-gray-900 mb-2">Transaction History</h2>
            <p className="text-gray-600">Manage payment optionally transaction logs</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by student ID, or transaction..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school fees">School Fees</SelectItem>
                <SelectItem value="uniform">Uniform</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="excursion">Excursion</SelectItem>
                <SelectItem value="house fees">House Fees</SelectItem>
              </SelectContent>
            </Select>

            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Table */}
          <div className="flex-1">
            <TransactionTable 
              transactions={filteredTransactions}
              onReceiptAction={handleReceiptAction}
              onVerifyAction={handleVerifyAction}
              onRetryAction={handleRetryAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}