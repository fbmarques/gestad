# Resumo Técnico do Projeto GESTAD

## Escopo desta leitura

Este resumo foi produzido após leitura:

- de todos os arquivos `.md` do projeto;
- das rotas Laravel;
- dos principais controllers, models, requests, migrations, seeders e testes;
- da aplicação React em `front-end/src`, com foco nas páginas e componentes do fluxo acadêmico.

Artefatos gerados e dependências como `node_modules`, `public/dist` e `public/build` foram inventariados, mas não tratados como fonte primária de entendimento do sistema.

---

## Visão geral do sistema

O projeto é o **GESTAD**, um sistema de gestão acadêmica com foco em pós-graduação, implementado em:

- **Backend:** Laravel 12 + Sanctum
- **Frontend principal:** React 18 + TypeScript + Vite + TanStack Query + shadcn/ui
- **Arquitetura de execução pretendida:** **SPA monolítica servida pelo Laravel**

O domínio principal do sistema gira em torno de:

- usuários com múltiplos papéis (`admin`, `docente`, `discente`);
- vínculos acadêmicos em `academic_bonds`;
- linhas de pesquisa, cursos, agências, revistas e eventos;
- acompanhamento do discente;
- publicações;
- mensagens entre discente, orientador e coorientador;
- dashboards para administração e docentes.

---

## Restrição crítica de infraestrutura

Esse ponto é central para continuar o desenvolvimento:

- o sistema será executado em **hospedagem compartilhada (Hostinger)**;
- nesse ambiente **não há `npm` disponível**;
- portanto, **qualquer alteração de front-end precisa ser compilada localmente antes de subir para o servidor**;
- em produção, o servidor disponível é o **Laravel/PHP**.

Regra prática:

1. alterar o front-end localmente;
2. gerar o build local;
3. enviar os assets compilados junto com o código Laravel para o servidor.

Isso já aparece repetidamente na documentação do projeto e precisa continuar sendo respeitado.

---

## Arquitetura real hoje

### Backend

O backend está relativamente bem estruturado em torno de:

- `routes/api.php` para APIs autenticadas e públicas;
- `routes/web.php` para servir a SPA e controlar acesso por papel;
- controllers separados por domínio;
- `FormRequest` para validação;
- models com relacionamentos principais já mapeados;
- testes de feature cobrindo boa parte das APIs.

### Frontend

O front-end em `front-end/` já tem muita interface pronta e, em vários pontos, já está integrado com a API real.

As áreas mais maduras no módulo discente são:

- `WelcomeSection`
- `BasicInfoSection`
- `LinkPeriodSection`
- `ScholarshipSection`
- `ResearchDefinitionsSection`
- `AcademicRequirementsVerticalSteps`
- `DisciplinesSection`
- `ProductionsSection`
- `EventsSection`

Esses componentes já consomem endpoints reais via `front-end/src/lib/api.ts`.

---

## Modelo de dados principal

### Usuários e papéis

`users` + `roles` + pivot `role_user`

- um usuário pode ter mais de um papel;
- o projeto usa helpers como `isAdmin()`, `isDocente()` e `isDiscente()`.

### Vínculo acadêmico

`academic_bonds` é a tabela central do domínio.

Ela concentra:

- discente;
- orientador;
- coorientador;
- agência de fomento;
- linha de pesquisa;
- nível (`master`, `doctorate`, etc.);
- status do vínculo;
- período (`start_date`, `end_date`);
- definições de pesquisa;
- requisitos acadêmicos.

Esse modelo é a base do módulo discente, da dashboard e do sistema de mensagens.

### Módulos derivados

- `student_courses`: disciplinas do discente
- `publications`: publicações acadêmicas
- `event_participations`: participações em eventos
- `messages` + `message_reads`: conversa entre participantes do vínculo

---

## Backend: o que já existe

### Autenticação

`AuthController` implementa login com token Sanctum.

O front guarda token em `localStorage` e envia no header `Authorization: Bearer`.

### Perfil e seleção de papel

`ProfileController` expõe:

- papéis do usuário;
- perfil básico;
- tema.

### Gestão administrativa

Já existem CRUDs e testes para:

- linhas de pesquisa;
- cursos;
- agências;
- revistas;
- eventos;
- docentes;
- discentes.

### Módulo discente

`StudentController` concentra a API de autoatendimento do discente:

- dados do discente logado;
- período de vínculo;
- bolsa;
- definições de pesquisa;
- requisitos acadêmicos;
- disciplinas;
- publicações;
- participações em eventos.

Esse controller é hoje uma das peças mais importantes do projeto.

### Dashboard

`App\Http\Controllers\Api\DashboardController` já implementa:

- dashboard administrativa;
- dashboard do docente.

Os dados vêm do banco e incluem:

- discentes ativos;
- disciplinas ofertadas;
- defesas;
- publicações;
- distribuição acadêmica;
- publicações por Qualis;
- situação de bolsas;
- eventos;
- top docentes/revistas;
- alertas;
- percentual de definições de pesquisa preenchidas.

### Mensagens

`MessageController` já trabalha com a noção correta de conversa por `academic_bond_id`, permitindo conversa em grupo entre:

- discente;
- orientador;
- coorientador.

Também já existe `message_reads` para leitura por usuário.

---

## Frontend: estado atual

### Organização

O front está em `front-end/`, separado do backend, mas consumido pelo Laravel.

Pontos relevantes:

- `front-end/src/lib/api.ts` é o cliente central de API;
- usa React Query para leitura/mutação;
- em operações de escrita, o padrão é chamar `/sanctum/csrf-cookie` antes;
- há uso extensivo de componentes shadcn/ui.

### Páginas principais

Existem páginas para:

- login;
- seleção de perfil;
- administrativo;
- docente;
- discente;
- cadastros administrativos;
- produções;
- status de produções;
- chat.

### Módulo discente

O módulo discente é o trecho mais avançado do front.

Ele já está muito mais perto de produção do que de protótipo:

- vários mocks foram removidos;
- há persistência real;
- existem toasts, validações e autosave;
- o comportamento visual já está alinhado com regras de negócio discutidas na documentação.

---

## Testes e qualidade

Há uma boa base de **Feature Tests** cobrindo:

- autenticação;
- middleware de papéis;
- CRUDs administrativos;
- dashboard;
- módulo discente;
- publicações;
- disciplinas;
- eventos;
- mensagens;
- bolsa;
- requisitos acadêmicos;
- definições de pesquisa;
- período de vínculo.

Isso é um ativo importante do projeto, porque o backend já tem uma malha de regressão razoável para continuar a implementação com segurança.

---

## Seeders: situação atual

O projeto possui seeders ricos para:

- papéis;
- agências;
- cursos;
- linhas de pesquisa;
- vínculos acadêmicos;
- publicações;
- participações em eventos;
- periódicos importados por CSV.

Mas há uma nuance importante:

- em `DatabaseSeeder.php`, vários seeders relevantes estão **comentados**, inclusive `CourseSeeder`, `EventSeeder`, `AcademicBondSeeder`, `PublicationSeeder` e `EventParticipationSeeder`;
- além disso, em `UserSeeder.php`, a criação de docentes e discentes também está **comentada em bloco**.

Ou seja:

- a estrutura para um ambiente de testes/demo mais completo existe;
- mas o seeding padrão atual **não popula o sistema inteiro**.

Se a intenção é ter uma base de demonstração mais realista, esse é um ponto importante para retomada.

---

## Nuances importantes para continuar o desenvolvimento

### 1. Ambiguidade de build do front-end

Hoje existem **duas configurações de build**:

- `vite.config.js` na raiz gera build em `public/build` e é o que conversa com o Blade `@vite`;
- `front-end/vite.config.ts` gera build em `public/dist`.

Isso indica duas abordagens coexistindo:

- integração Laravel Vite;
- build estático do front separado.

Como o Blade `resources/views/app.blade.php` usa:

- `@viteReactRefresh`
- `@vite(['front-end/src/main.tsx'])`

o caminho **mais coerente com a aplicação rodando no Laravel** hoje é `public/build`, não `public/dist`.

Isso precisa ser tratado com cuidado no deploy para Hostinger, senão o time pode compilar num lugar e o servidor tentar servir de outro.

### 2. Restrições de hospedagem compartilhada

Como não haverá `npm` no servidor:

- o pipeline correto precisa ser **compilar localmente e publicar assets prontos**;
- não dá para depender de build no servidor;
- qualquer documentação operacional futura deve ser explícita sobre isso.

### 3. Conflitos/duplicidades de rota no React

Em `front-end/src/App.tsx` existem rotas duplicadas e conflitantes, por exemplo:

- `/docente` apontando tanto para `Docente` quanto para `Docentes`;
- `/discente` apontando tanto para `Discente` quanto para `Discentes`.

Isso é um ponto de atenção real para navegação e manutenção.

### 4. Indício de quebra de compilação no módulo discente

Em `front-end/src/pages/Discente.tsx` existe um caractere solto:

- `?            <AcademicRequirementsVerticalSteps />`

Isso aparenta ser erro de edição e pode quebrar a compilação do front.

### 5. Mensagens: implementação em transição

O controller de mensagens já usa conversa por vínculo acadêmico e leitura individual, o que é o modelo correto para orientador/coorientador/discente.

Mas ainda existe um resquício mais antigo em `getUnreadCount()` usando:

- `recipient_id`
- `unread()`

Esse trecho parece legado em relação ao modelo novo com `message_reads`.

### 6. Dashboard usa anos fixos para eventos

No dashboard, os eventos são agregados por anos fixos:

- 2022, 2023, 2024, 2025

Isso funciona para dados atuais do projeto, mas não é uma regra temporal robusta para o futuro.

### 7. Banco e front já foram moldados por regras específicas do usuário

A documentação e o código mostram que várias decisões já foram tomadas a partir de requisitos muito específicos:

- campos sempre visíveis mesmo sem valor;
- tradução de status para português;
- “Trabalho concluído” tratado como fluxo de saída de tela;
- diferença entre papel ativo admin e docente;
- produção com status `P`, `D`, `I`;
- conversa compartilhada entre orientador, coorientador e discente.

Ou seja, a continuação do projeto deve respeitar o comportamento já combinado, não só a estrutura técnica.

---

## Estado funcional por área

### Mais avançado

- autenticação;
- seleção por papel;
- CRUDs administrativos;
- dashboard;
- módulo discente;
- publicações do discente;
- participações em eventos;
- disciplinas do discente;
- bolsa;
- requisitos acadêmicos;
- definições de pesquisa;
- mensagens.

### Pontos que pedem saneamento antes de evoluir muito

- estratégia única de build/deploy;
- limpeza de rotas conflitantes no front;
- verificação de componentes com erro de sintaxe;
- alinhamento final do sistema de mensagens e contador de não lidas;
- revisão do `DatabaseSeeder` para popular ambiente de desenvolvimento completo.

---

## Recomendação prática para continuar a implementação

Ao seguir com novas tarefas, a abordagem mais segura é:

1. continuar usando `StudentController` e `front-end/src/lib/api.ts` como eixo dos fluxos do discente;
2. manter o padrão já estabelecido de `FormRequest` + testes de feature;
3. validar sempre se a mudança afeta papel ativo (`admin` x `docente` x `discente`);
4. antes de qualquer deploy, gerar o build localmente;
5. padronizar definitivamente se o deploy servirá assets de `public/build` ou `public/dist`.

---

## Conclusão

O projeto já tem uma base sólida e não está em estágio inicial. O cenário mais realista é:

- **backend Laravel relativamente maduro**;
- **front React majoritariamente pronto nas telas principais**;
- **módulo discente bastante adiantado**;
- **boas regras de negócio já traduzidas em código**;
- **restrição operacional forte de hospedagem compartilhada**, que impacta diretamente qualquer alteração de front-end.

O principal cuidado daqui para frente não é “começar do zero”, e sim **continuar sem quebrar os padrões já estabelecidos**, principalmente:

- build local antes de publicar;
- integração monolítica Laravel + SPA;
- testes de feature para API;
- respeito ao comportamento definido nas documentações e telas já implementadas.
