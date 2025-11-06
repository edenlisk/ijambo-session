import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: any) => void;
}

export function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    class: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.role) {
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        lastLogin: 'Never'
      };
      onAddUser(newUser);
      setFormData({
        name: '',
        email: '',
        role: '',
        class: '',
        status: 'Active'
      });
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      class: '',
      status: 'Active'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Input
              id="class"
              type="text"
              placeholder="Enter class (e.g., SS2A, JS1B)"
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'Active' | 'Inactive') => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Add User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}