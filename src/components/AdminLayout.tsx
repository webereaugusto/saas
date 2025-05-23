'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Usuários', href: '/admin/users', icon: UserIcon },
    { name: 'Chats', href: '/admin/chats', icon: ChatBubbleLeftRightIcon },
    { name: 'Configurações', href: '/admin/settings', icon: Cog6ToothIcon },
    { name: 'Voltar ao Chat', href: '/dashboard', icon: HomeIcon },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-[#343541]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#202123]">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          {/* Sidebar content */}
          <div className="flex-1 h-0 overflow-y-auto">
            <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-[#202123]">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                    group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }
                      mr-4 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex p-4 bg-[#202123]">
            <button
              onClick={() => signOut()}
              className="flex-shrink-0 group block w-full"
            >
              <div className="flex items-center">
                <div>
                  <ArrowLeftOnRectangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">Sair</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-[#202123]">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-[#202123]">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }
                        mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex p-4 bg-[#202123]">
              <button
                onClick={() => signOut()}
                className="flex-shrink-0 group block w-full"
              >
                <div className="flex items-center">
                  <div>
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Sair</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-300 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 