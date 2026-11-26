# 🎁 Amigo secreto

Sorteio de amigo secreto para a família. Cada pessoa recebe um link só dela; nem o organizador vê quem tirou quem.

Next.js + Supabase (acesso só pelo servidor). Participantes não têm login nem pagamento.

## Rodar local

1. Supabase → projeto `amigo-secreto` → Project Settings → API Keys → copie a **Secret key** (`sb_secret_…`).
2. Cole em `.env.local` em `SUPABASE_SERVICE_ROLE_KEY=` (a `SUPABASE_URL` já está).
3. Escolha uma senha para o admin e cole em `ADMIN_PASSWORD=` (use algo longo e único).
4. `npm install && npm run dev` → http://localhost:3000

O schema está em `supabase/schema.sql` (já aplicado no projeto).

## Deploy na Vercel

```bash
npx vercel            # primeira vez: vincula o projeto
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add ADMIN_PASSWORD
npx vercel --prod
```

A secret key nunca vai para o navegador: só é lida em Server Actions e páginas de servidor.

## Admin (`/admin`)

Painel só para você, protegido pela senha `ADMIN_PASSWORD` (sem ela definida, o `/admin` fica desligado).

- Lista todos os grupos (sorteado ou não, quantas pessoas, quantas já abriram).
- Em cada grupo: abrir ou copiar o link do painel do organizador, editar nome, valor, data e recado, e excluir o grupo (apaga participantes e sorteio).
- Não mostra quem tirou quem, mas o painel do organizador lista os links dos participantes.
- Sessão por cookie assinado (httpOnly, 7 dias). Trocar a senha desconecta todo mundo.

## Como funciona

- `/admin/novo` cria o grupo (mín. 3 pessoas). Só o admin cria; `/` leva para o `/admin`.
- No painel: sortear, copiar link / enviar por WhatsApp, ver quem já abriu. Clicar em um participante mostra se a lista foi preenchida e o que tem nela.
- `/p/<token>`: a pessoa preenche o que quer e o que não quer ganhar (obrigatório) e só revela quem tirou depois que todos do grupo terminarem a lista. Dá para editar depois. Cada item pode ter um link de loja.
- Refazer o sorteio só é possível enquanto ninguém abriu o link.
- O painel `/g/<token>` é identificado só pelo link; o admin encontra todos em `/admin`.

## Testes

`npm test` (sorteio: ninguém tira a si mesmo, todos são tirados uma vez, com 3, 4 e 50 pessoas).
