import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { UserTable } from './UserTable';
import { AddUserModal } from './AddUserModal';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  class: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Adaego Johnson',
    email: 'adaego.john@schooladmin.org',
    role: 'Teacher',
    class: 'SS2A',
    status: 'Active',
    lastLogin: '2 hours ago'
  },
  {
    id: '2',
    name: 'Okonma Chibuor',
    email: 'okonma.chibuor@schooladmin.org',
    role: 'Student',
    class: 'SS1B',
    status: 'Active',
    lastLogin: '1 day ago'
  },
  {
    id: '3',
    name: 'Kemi Adebola',
    email: 'kemi.adebola@schooladmin.org',
    role: 'Admin',
    class: '-',
    status: 'Active',
    lastLogin: '10 minutes ago'
  },
  {
    id: '4',
    name: 'Emeka Nwosu',
    email: 'emeka.nwosu@schooladmin.org',
    role: 'Teacher',
    class: 'JS2C',
    status: 'Inactive',
    lastLogin: '1 week ago'
  },
  {
    id: '5',
    name: 'Fatima Bello',
    email: 'fatima.bello@schooladmin.org',
    role: 'Student',
    class: 'SS2A',
    status: 'Active',
    lastLogin: '3 hours ago'
  },
  {
    id: '6',
    name: 'Tunde Bakare',
    email: 'tunde.bakare@schooladmin.org',
    role: 'Admin',
    class: 'JS1B',
    status: 'Active',
    lastLogin: '2 days ago'
  },
  {
    id: '7',
    name: 'Grace Okoro',
    email: 'grace.okoro@schooladmin.org',
    role: 'Teacher',
    class: 'JS1A',
    status: 'Active',
    lastLogin: '4 hours ago'
  },
  {
    id: '8',
    name: 'Yusuf Ibrahim',
    email: 'yusuf.ibrahim@schooladmin.org',
    role: 'Student',
    class: 'SS2C',
    status: 'Active',
    lastLogin: '6 hours ago'
  }
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddNewUser = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    toast.success(`${newUser.name} has been added successfully!`);
  };

  const handleEditUser = (user: User) => {
    toast.info(`Edit functionality for ${user.name} will be implemented.`);
  };

  const handleViewUser = (user: User) => {
    toast.info(`Viewing details for ${user.name}.`);
  };

  const handleResetPassword = (user: User) => {
    toast.success(`Password reset email sent to ${user.email}.`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (user) {
      toast.success(`${user.name} has been deleted successfully.`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex-1 bg-gray-50 h-full flex flex-col">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage students, teachers, and administrative staff</p>
          </div>
          <Button 
            onClick={handleAddNewUser}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* User Directory Section - Full Height */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg text-gray-900 mb-2">User Directory</h2>
            <p className="text-gray-600">Search and filter system users ({filteredUsers.length} users)</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Table - Takes remaining space */}
          <div className="flex-1">
            <UserTable 
              users={filteredUsers}
              onEditUser={handleEditUser}
              onViewUser={handleViewUser}
              onResetPassword={handleResetPassword}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAddUser={handleAddUser}
      />
    </div>
  );
}