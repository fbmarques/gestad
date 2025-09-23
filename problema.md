# Problema Central: Desconexão Front-end (React/Vite) e Back-end (Laravel)

Este documento resume a complexa série de problemas que impediram a comunicação e o funcionamento adequado da aplicação GESTAD, apesar das correções individuais em diversas partes do código. O problema central residia na **desconexão entre o processo de build do front-end e o mecanismo de servir assets do Laravel**, agravado por configurações incorretas e um bug de autenticação.

## 1. O Problema Inicial (e a Falsa Pista do Cache)

Inicialmente, o front-end utilizava chamadas de API simuladas. Após a correção para chamadas reais, o sistema ainda não funcionava. A suspeita inicial recaiu sobre o cache do navegador, mas testes em abas anônimas e a ausência de logs no console do navegador provaram que o código do front-end corrigido **simplesmente não estava sendo executado**.

## 2. A Verdadeira Causa Raiz: Configuração Incorreta do Build do Vite

O problema fundamental era uma incompatibilidade na forma como o Vite (no front-end) gerava os arquivos compilados e onde o Laravel esperava encontrá-los.

*   **Diretório de Saída Incorreto:** O `front-end/vite.config.ts` estava configurado para gerar os assets em `front-end/dist`, enquanto o Laravel (via diretiva `@vite` em `resources/views/app.blade.php`) esperava encontrá-los em `public/build`. Isso significava que todas as compilações do front-end eram "invisíveis" para o Laravel.
*   **Caminho do Manifest Incorreto:** Mesmo após corrigir o `outDir` no `vite.config.ts`, o Vite, em versões mais recentes, gerava o arquivo `manifest.json` dentro de um subdiretório `.vite` (`public/build/.vite/manifest.json`), enquanto o Laravel esperava o `manifest.json` diretamente em `public/build/manifest.json`.

## 3. Complicações Adicionais e Descobertas

Durante a investigação, outros problemas foram identificados e corrigidos, que contribuíram para a complexidade do diagnóstico:

*   **Chamada de Endpoint Incorreta:** O front-end estava chamando `POST /login` em vez de `POST /api/login`. Como as rotas de API do Laravel são prefixadas com `/api`, a requisição não chegava ao `AuthController` correto, sendo interceptada pela rota "catch-all" do `web.php`.
*   **Duas Configurações Vite Concorrentes:** Existiam dois arquivos `vite.config` (`vite.config.js` na raiz para o Laravel e `front-end/vite.config.ts` para o front-end). O comando `npm run build` estava sendo executado do diretório `front-end/`, usando a configuração errada, que não integrava corretamente com o Laravel.
*   **Problemas de Resolução de Dependências:** Ao tentar compilar da raiz (o local correto), as dependências do React não eram encontradas, pois estavam apenas no `package.json` do subdiretório `front-end/`. Isso exigiu a consolidação de todas as dependências no `package.json` da raiz.
*   **Bug de Hash Duplo na Senha:** Um erro no `UserSeeder.php` fazia com que as senhas fossem hasheadas duas vezes no banco de dados (uma vez manualmente no seeder e outra automaticamente pelo cast `hashed` do modelo `User`), impedindo a autenticação correta mesmo com credenciais válidas.
*   **Logs Ausentes:** A ausência de logs no servidor foi a principal dificuldade de diagnóstico, pois impedia a visibilidade do que estava acontecendo no back-end.

## 4. A Solução Final

A solução envolveu uma série de correções coordenadas:

1.  **Unificação de Dependências:** Todas as dependências do front-end foram movidas para o `package.json` da raiz do projeto, e `npm install --legacy-peer-deps` foi executado na raiz.
2.  **Configuração Correta do Vite (Raiz):** O `vite.config.js` da raiz foi configurado para:
    *   Usar o `laravel-vite-plugin`.
    *   Definir o `input` correto (`front-end/src/main.tsx`).
    *   Definir o `outDir` para `../public/build`.
    *   Definir `manifest: 'manifest.json'` para garantir que o arquivo `manifest.json` fosse gerado diretamente em `public/build`.
    *   Adicionar a configuração `resolve.alias` para que `@/` fosse corretamente mapeado para `front-end/src`.
3.  **Correção do Endpoint no Front-end:** A chamada de login no `LoginForm.tsx` foi alterada para `POST /api/login`.
4.  **Correção do Seeder de Usuários:** O `UserSeeder.php` foi modificado para não hashear a senha manualmente, permitindo que o cast `hashed` do modelo `User` fizesse o trabalho corretamente.
5.  **Limpeza de Caches:** Caches do Laravel foram limpos (`php artisan cache:clear`, `config:clear`, etc.), e o banco de dados foi resetado e semeado (`php artisan migrate:fresh --seed`).

Com essas correções, a comunicação entre front-end e back-end foi restabelecida, e a aplicação agora deve funcionar conforme o esperado.

## 5. Estado Atual Aplicado (set/2025)

- Node.js 20.19.x em uso (requisito do Vite 7).
- Build único na raiz Laravel:
  - `vite.config.js` com `input: ['front-end/src/main.tsx']`, `base: '/build/'` e alias `@ -> front-end/src`.
  - `postcss.config.js` na raiz apontando para `front-end/tailwind.config.ts`.
  - Tailwind CSS 3.4.x + PostCSS 8.x padronizados na raiz.
  - `front-end/tailwind.config.ts` usa caminhos absolutos no `content` para `src/**/*` e `resources/views/**/*.blade.php`.
- Blade (`welcome.blade.php`/`app.blade.php`): `@viteReactRefresh` e `@vite(['front-end/src/main.tsx'])`.
- Build gera `public/build/manifest.json` com CSS materializado (ex.: `assets/main-*.css`).

## 6. Checklist para não quebrar novamente

1. Executar sempre na raiz do projeto:
   - Dev: `npm run dev` e `php artisan serve`.
   - Build: `npm run build`.
2. Não criar/usar `vite.config.*` dentro de `front-end/`.
3. Não mover `postcss.config.js` nem `front-end/tailwind.config.ts`.
4. Novos componentes devem ficar em `front-end/src/` (senão ajustar `content`).
5. Manter versões: Node 20+, Tailwind 3.4.x, PostCSS 8.x.
6. Se o CSS “sumir”, verificar:
   - `public/build/manifest.json` contém `assets/main-*.css`.
   - `vite.config.js` tem apenas `front-end/src/main.tsx` no `input`.
   - `front-end/tailwind.config.ts` `content` cobre `src/**/*` e `resources/views/**/*`.
   - Rodar `npm run build` e forçar refresh (Ctrl+F5).

## 7. Endpoints e Seeds (observações)

- Endpoints do front-end devem usar o prefixo `/api` (ex.: `POST /api/login`).
- No `UserSeeder.php`, não hashear manualmente a senha quando o Model já usa cast `hashed`.
