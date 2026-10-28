# Regra de Sincronização Obrigatória: GitHub & Vercel

Após efetuar qualquer alteração, implementação ou correção solicitada pelo utilizador no projeto Social Media Manager:
1. Compilar o projeto com `npm run build` para garantir integridade.
2. Efetuar `git add`, `git commit` com mensagem descritiva e `git push origin main` para o repositório GitHub.
3. Efetuar deploy de produção no Vercel com `npx vercel deploy --prod --yes` (ou confirmar a sincronização automática via webhook do GitHub).
4. Fornecer ao utilizador a confirmação do commit no GitHub e o link de produção ativo no Vercel.
