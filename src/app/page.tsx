import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#343541] min-h-screen flex flex-col">
      <div className="relative isolate px-6 pt-14 lg:px-8 flex-grow flex items-center">
        <div className="mx-auto max-w-2xl py-20 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Chat com Inteligência Artificial
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Converse com uma IA avançada, tire suas dúvidas e explore novas ideias.
              Uma experiência única de interação com inteligência artificial.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
              >
                Começar agora
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-white"
              >
                Já tenho uma conta <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
