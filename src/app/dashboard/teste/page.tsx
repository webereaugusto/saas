'use client';

import Link from 'next/link';

export default function TestePage() {
  return (
    <div className="flex h-screen bg-[#343541] items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-white max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Página de Teste</h1>
        <p className="mb-6">Esta é uma página de teste para verificar o funcionamento das rotas.</p>
        <div className="space-y-3">
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 block text-center">
            Voltar para o Dashboard
          </Link>
          <a href="/dashboard/perfil" className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 block text-center">
            Ir para Perfil (tag a)
          </a>
          <button 
            onClick={() => window.location.href = '/dashboard/perfil'} 
            className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 block text-center w-full"
          >
            Ir para Perfil (redirect)
          </button>
        </div>
      </div>
    </div>
  );
} 