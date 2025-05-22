'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-[#202123] border-b border-gray-800/50 fixed top-0 left-0 right-0 z-10">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">AI Chat SAAS</span>
            </Link>
          </div>

          <div className="flex items-center">
            {session ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  {session.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || ''}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[#202123] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          }`}
                        >
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          }`}
                        >
                          Sair
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
                >
                  Registrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 