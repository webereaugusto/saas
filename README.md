# AI Chat SAAS

Uma aplicação SAAS de chat com inteligência artificial usando a API da OpenAI.

## Tecnologias Utilizadas

- Next.js 14 com App Router
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- OpenAI API

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/aicrud?schema=public"
NEXTAUTH_SECRET="seu-secret-muito-seguro"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sua-chave-api-aqui"
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- Autenticação de usuários
- Chat em tempo real com IA
- Dashboard para gerenciar conversas
- Interface responsiva e moderna
- Proteção de rotas

## Estrutura do Projeto

- `/src/app` - Rotas e páginas da aplicação
- `/src/components` - Componentes reutilizáveis
- `/src/providers` - Providers da aplicação
- `/prisma` - Schema e migrações do banco de dados
- `/public` - Arquivos estáticos

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
