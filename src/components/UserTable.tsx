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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  class: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserTable({ users, onEditUser, onViewUser, onResetPassword, onDeleteUser }: UserTableProps) {
  const handleAction = (action: string, user: User) => {
    switch (action) {
      case 'edit':
        onEditUser(user);
        break;
      case 'view':
        onViewUser(user);
        break;
      case 'reset':
        onResetPassword(user);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
          onDeleteUser(user.id);
        }
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Name</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Role</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Class</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Last Login</th>
              <th className="text-left py-3 px-4 text-xs uppercase text-gray-500 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="text-gray-900">{user.name}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-600">{user.email}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-900">{user.role}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-900">{user.class}</div>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant={user.status === 'Active' ? 'default' : 'secondary'}
                    className={user.status === 'Active' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-600">{user.lastLogin}</div>
                </td>
                <td className="py-4 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('edit', user)}>
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('view', user)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('reset', user)}>
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleAction('delete', user)}
                      >
                        Delete User
                      </DropdownMenuItem>
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