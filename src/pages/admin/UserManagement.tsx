// import React, { useEffect, useState } from 'react';
// import { api } from '@/services/api.ts';
// import {type User, UserRole } from '@/types';
// import { Button } from '../../components/ui/button';
// import { Card, CardContent } from '../../components/ui/card';
// import { Input } from '../../components/ui/input';
// import { Badge } from '../../components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
// import { Users, Search, MoreVertical, Shield, UserCog, UserX, UserCheck } from 'lucide-react';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
//
// export const AdminUserManagement: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [roleFilter, setRoleFilter] = useState<string>('all');
//
//   useEffect(() => {
//     loadUsers();
//   }, []);
//
//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const data = await api.getUsers();
//       setUsers(data);
//     } catch (error) {
//       console.error('Failed to load users:', error);
//       toast.error('Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleUpdateRole = async (userId: number, newRole: string) => {
//     try {
//       await api.updateUserRole(userId, newRole);
//       toast.success('User role updated successfully');
//       loadUsers();
//     } catch (error) {
//       console.error('Failed to update user role:', error);
//       toast.error('Failed to update user role');
//     }
//   };
//
//   const handleToggleActive = async (userId: number) => {
//     try {
//       await api.toggleUserActive(userId);
//       toast.success('User status updated successfully');
//       loadUsers();
//     } catch (error) {
//       console.error('Failed to update user status:', error);
//       toast.error('Failed to update user status');
//     }
//   };
//
//   const getRoleBadgeColor = (role: UserRole) => {
//     switch (role) {
//       case UserRole.ADMIN:
//         return 'bg-red-100 text-red-700';
//       case UserRole.MODERATOR:
//         return 'bg-purple-100 text-purple-700';
//       case UserRole.USER:
//         return 'bg-blue-100 text-blue-700';
//       case UserRole.GUEST:
//         return 'bg-gray-100 text-gray-700';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };
//
//   const filterUsers = (users: User[]) => {
//     let filtered = users;
//
//     if (searchQuery) {
//       const lowerQuery = searchQuery.toLowerCase();
//       filtered = filtered.filter(user =>
//         user.username.toLowerCase().includes(lowerQuery) ||
//         user.email.toLowerCase().includes(lowerQuery) ||
//         user.firstName.toLowerCase().includes(lowerQuery) ||
//         user.lastName.toLowerCase().includes(lowerQuery)
//       );
//     }
//
//     if (roleFilter !== 'all') {
//       filtered = filtered.filter(user => user.role === roleFilter);
//     }
//
//     return filtered;
//   };
//
//   const filteredUsers = filterUsers(users);
//
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }
//
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <h1 className="text-3xl mb-4">User Management</h1>
//
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <Input
//                 type="text"
//                 placeholder="Search users..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Select value={roleFilter} onValueChange={setRoleFilter}>
//               <SelectTrigger className="w-full sm:w-48">
//                 <SelectValue placeholder="Filter by role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Roles</SelectItem>
//                 <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
//                 <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
//                 <SelectItem value={UserRole.USER}>User</SelectItem>
//                 <SelectItem value={UserRole.GUEST}>Guest</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </div>
//
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {filteredUsers.length > 0 ? (
//           <>
//             {/* Desktop Table View */}
//             <div className="hidden md:block">
//               <Card>
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>User</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Role</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Last Login</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {filteredUsers.map(user => (
//                         <TableRow key={user.id}>
//                           <TableCell>
//                             <div>
//                               <p>{user.username}</p>
//                               <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
//                             </div>
//                           </TableCell>
//                           <TableCell>{user.email}</TableCell>
//                           <TableCell>
//                             <Badge className={getRoleBadgeColor(user.role)}>
//                               {user.role}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant={user.active ? 'default' : 'secondary'}>
//                               {user.active ? 'Active' : 'Inactive'}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy') : 'Never'}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="sm">
//                                   <MoreVertical className="w-4 h-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.ADMIN)}>
//                                   <Shield className="w-4 h-4 mr-2" />
//                                   Make Admin
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.MODERATOR)}>
//                                   <UserCog className="w-4 h-4 mr-2" />
//                                   Make Moderator
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.USER)}>
//                                   <Users className="w-4 h-4 mr-2" />
//                                   Make User
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
//                                   {user.active ? (
//                                     <>
//                                       <UserX className="w-4 h-4 mr-2" />
//                                       Deactivate
//                                     </>
//                                   ) : (
//                                     <>
//                                       <UserCheck className="w-4 h-4 mr-2" />
//                                       Activate
//                                     </>
//                                   )}
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </div>
//
//             {/* Mobile Card View */}
//             <div className="md:hidden space-y-4">
//               {filteredUsers.map(user => (
//                 <Card key={user.id}>
//                   <CardContent className="p-4">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <p className="text-sm">{user.username}</p>
//                         <p className="text-xs text-gray-500">{user.firstName} {user.lastName}</p>
//                         <p className="text-xs text-gray-500 mt-1">{user.email}</p>
//                       </div>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="sm">
//                             <MoreVertical className="w-4 h-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.ADMIN)}>
//                             <Shield className="w-4 h-4 mr-2" />
//                             Make Admin
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.MODERATOR)}>
//                             <UserCog className="w-4 h-4 mr-2" />
//                             Make Moderator
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onClick={() => handleUpdateRole(user.id, UserRole.USER)}>
//                             <Users className="w-4 h-4 mr-2" />
//                             Make User
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
//                             {user.active ? (
//                               <>
//                                 <UserX className="w-4 h-4 mr-2" />
//                                 Deactivate
//                               </>
//                             ) : (
//                               <>
//                                 <UserCheck className="w-4 h-4 mr-2" />
//                                 Activate
//                               </>
//                             )}
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <Badge className={getRoleBadgeColor(user.role)}>
//                         {user.role}
//                       </Badge>
//                       <Badge variant={user.active ? 'default' : 'secondary'}>
//                         {user.active ? 'Active' : 'Inactive'}
//                       </Badge>
//                       {user.lastLoginAt && (
//                         <span className="text-xs text-gray-500">
//                           Last login: {format(new Date(user.lastLoginAt), 'MMM dd')}
//                         </span>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </>
//         ) : (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600">No users found</p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState } from 'react';
import { api } from '@/services/api.ts';
import { type User, UserRole } from '@/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Users, Search, MoreVertical, Shield, UserCog, UserX, UserCheck, Plus, Edit, Key, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserFormData {
    email: string;
    firstName: string;
    phoneNumber: string;
    lastName: string;
    username: string;
    role: UserRole;
    password?: string;
}

interface ResetPasswordData {
    newPassword: string;
    confirmPassword: string;
}

export const AdminUserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form states
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        phoneNumber: '',
        role: UserRole.USER,
        password: ''
    });

    const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordData>({
        newPassword: '',
        confirmPassword: ''
    });

    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [statusFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            let data: User[];

            if (statusFilter === 'active') {
                data = await api.get('/api/users/active');
            } else if (statusFilter === 'inactive') {
                data = await api.get('/api/users/inactive');
            } else {
                data = await api.get('/api/users');
            }

            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadUsers();
            return;
        }

        try {
            setLoading(true);
            const activeOnly = statusFilter === 'active';
            const data = await api.get(`/api/users/search?keyword=${encodeURIComponent(searchQuery)}&activeOnly=${activeOnly}`);
            setUsers(data);
        } catch (error) {
            console.error('Failed to search users:', error);
            toast.error('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.firstName || !formData.lastName || !formData.username || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setFormLoading(true);
            console.log(formData);
            await api.post('/api/users', formData);
            toast.success('User created successfully');
            setCreateModalOpen(false);
            resetForm();
            loadUsers();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            const message = error.response?.data?.message || 'Failed to create user';
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser || !formData.email || !formData.firstName || !formData.lastName) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setFormLoading(true);
            await api.put(`/api/users/${selectedUser.id}`, {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role
            });
            toast.success('User updated successfully');
            setEditModalOpen(false);
            resetForm();
            loadUsers();
        } catch (error: any) {
            console.error('Failed to update user:', error);
            const message = error.response?.data?.message || 'Failed to update user';
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = async (userId: number, currentStatus: boolean) => {
        try {
            const endpoint = currentStatus
                ? `/api/users/${userId}/deactivate`
                : `/api/users/${userId}/activate`;

            await api.patch(endpoint);
            toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            loadUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) return;

        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (resetPasswordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setFormLoading(true);
            await api.post(`/api/users/${selectedUser.id}/reset-password`, {
                newPassword: resetPasswordData.newPassword
            });
            toast.success('Password reset successfully');
            setResetPasswordModalOpen(false);
            setResetPasswordData({ newPassword: '', confirmPassword: '' });
            setSelectedUser(null);
        } catch (error: any) {
            console.error('Failed to reset password:', error);
            const message = error.response?.data?.message || 'Failed to reset password';
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            role: user.role
        });
        setEditModalOpen(true);
    };

    const openResetPasswordModal = (user: User) => {
        setSelectedUser(user);
        setResetPasswordModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            firstName: '',
            lastName: '',
            username: '',
            role: UserRole.USER,
            phoneNumber: '',
            password: ''
        });
        setSelectedUser(null);
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'bg-red-100 text-red-700';
            case UserRole.MODERATOR:
                return 'bg-purple-100 text-purple-700';
            case UserRole.USER:
                return 'bg-blue-100 text-blue-700';
            case UserRole.GUEST:
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const filterUsers = (users: User[]) => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        return filtered;
    };

    const filteredUsers = filterUsers(users);

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
                        <Button onClick={() => setCreateModalOpen(true)} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Create User
                        </Button>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, username, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} variant="secondary" className="flex-1 sm:flex-none">
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <Label className="text-xs mb-2 block">Role</Label>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                            <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                                            <SelectItem value={UserRole.USER}>User</SelectItem>
                                            <SelectItem value={UserRole.GUEST}>Guest</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs mb-2 block">Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="active">Active Only</SelectItem>
                                            <SelectItem value="inactive">Inactive Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setRoleFilter('all');
                                            setStatusFilter('all');
                                            setSearchQuery('');
                                            loadUsers();
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredUsers.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Login</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{user.username}</p>
                                                            <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getRoleBadgeColor(user.role)}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.active ? 'default' : 'secondary'}>
                                                            {user.active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm') : 'Never'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openResetPasswordModal(user)}>
                                                                    <Key className="w-4 h-4 mr-2" />
                                                                    Reset Password
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.active)}>
                                                                    {user.active ? (
                                                                        <>
                                                                            <UserX className="w-4 h-4 mr-2" />
                                                                            Deactivate
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <UserCheck className="w-4 h-4 mr-2" />
                                                                            Activate
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredUsers.map(user => (
                                <Card key={user.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="font-medium">{user.username}</p>
                                                <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
                                                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openResetPasswordModal(user)}>
                                                        <Key className="w-4 h-4 mr-2" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.active)}>
                                                        {user.active ? (
                                                            <>
                                                                <UserX className="w-4 h-4 mr-2" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-4 h-4 mr-2" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={getRoleBadgeColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                            <Badge variant={user.active ? 'default' : 'secondary'}>
                                                {user.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {user.lastLoginAt && (
                                                <span className="text-xs text-gray-500">
                          Last login: {format(new Date(user.lastLoginAt), 'MMM dd')}
                        </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No users found</p>
                            {searchQuery && (
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearchQuery('');
                                        loadUsers();
                                    }}
                                    className="mt-2"
                                >
                                    Clear search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create User Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Add a new user to the system. All fields are required.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number *</Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UserRole.USER}>User</SelectItem>
                                        <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                        <SelectItem value={UserRole.GUEST}>Guest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateModalOpen(false);
                                    resetForm();
                                }}
                                disabled={formLoading}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                                {formLoading ? 'Creating...' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information. Username cannot be changed.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-firstName">First Name *</Label>
                                    <Input
                                        id="edit-firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lastName">Last Name *</Label>
                                    <Input
                                        id="edit-lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-username">Username</Label>
                                <Input
                                    id="edit-username"
                                    value={formData.username}
                                    disabled
                                    className="bg-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email *</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role *</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UserRole.USER}>User</SelectItem>
                                        <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                        <SelectItem value={UserRole.GUEST}>Guest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditModalOpen(false);
                                    resetForm();
                                }}
                                disabled={formLoading}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                                {formLoading ? 'Updating...' : 'Update User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reset Password Modal */}
            <Dialog open={resetPasswordModalOpen} onOpenChange={setResetPasswordModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for {selectedUser?.username}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password *</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={resetPasswordData.newPassword}
                                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password *</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={resetPasswordData.confirmPassword}
                                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setResetPasswordModalOpen(false);
                                    setResetPasswordData({ newPassword: '', confirmPassword: '' });
                                    setSelectedUser(null);
                                }}
                                disabled={formLoading}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                                {formLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};