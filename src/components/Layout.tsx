import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { NotificationBell } from './NotificationBell';
import { 
  Home, BookOpen, ClipboardList, Users, Menu, X, 
  LogOut, GraduationCap, Settings, User, Plus, HelpCircle, BarChart3, FileText 
} from 'lucide-react';
import { UserRole } from '../types';

export const Layout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER, UserRole.GUEST] },
    { path: '/topics', label: 'Topics', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER, UserRole.GUEST] },
    { path: '/quizzes', label: 'Quizzes', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER, UserRole.GUEST] },
    { path: '/moderator/topics', label: 'Manage Topics', icon: Settings, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { path: '/moderator/resources', label: 'Manage Resources', icon: FileText, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { path: '/moderator/quizzes', label: 'Manage Quizzes', icon: Plus, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { path: '/moderator/questions', label: 'Question Bank', icon: HelpCircle, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { path: '/admin/users', label: 'User Management', icon: Users, roles: [UserRole.ADMIN] },
    { path: '/admin/analytics', label: 'Quiz Analytics', icon: BarChart3, roles: [UserRole.ADMIN] },
    { path: '/admin/quiz-results', label: 'Quiz Results', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  ];

  const visibleNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        onClick={() => {
          navigate(item.path);
          onClick?.();
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          active 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm">Quiz Platform</h2>
                        <p className="text-xs text-gray-500">{user?.firstName}</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {visibleNavItems.map(item => (
                      <NavLink key={item.path} item={item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                  </nav>
                  <div className="p-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block">Quiz Platform</span>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <div className="flex flex-col items-start">
                <span className="text-xs">{user?.firstName} {user?.lastName}</span>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {user?.role}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar + Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] sticky top-[57px]">
          <nav className="p-4 space-y-1">
            {visibleNavItems.map(item => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {visibleNavItems.slice(0, 4).map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs truncate max-w-full px-1">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add padding to bottom of content for mobile nav */}
      <div className="md:hidden h-16"></div>
    </div>
  );
};
