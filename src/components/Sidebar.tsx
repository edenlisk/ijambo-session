import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">SA</span>
          </div>
          <span className="text-gray-900">SchoolAdmin</span>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-3">
            Administration
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeItem === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}