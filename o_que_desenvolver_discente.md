# O que Desenvolver - Módulo Discente

## 📋 Checklist de Implementação

### 1. Análise Database ✅ (Concluído)
- [x] Verificar estrutura database
- [x] Identificar tabela `academic_bonds` (vínculo acadêmico)
- [x] Identificar relacionamentos:
  - [x] `student_id` → `users` (discente)
  - [x] `advisor_id` → `users` (orientador)
  - [x] `level` (Mestrado/Doutorado)
  - [x] Campo para co-orientador (não existe - pode ser implementado depois)

### 2. Backend - API Development 🔄 (Em andamento)
- [ ] Verificar se existe Model `AcademicBond`
- [ ] Criar Controller `StudentController` com método:
  - [ ] `me()` - retornar dados do discente logado via academic_bonds
- [ ] Criar Form Request para validação se necessário
- [ ] Criar Policy para autorização
- [ ] Adicionar rotas em `routes/api.php`
- [ ] Criar Feature Tests obrigatórios

### 3. Frontend Routes ⏳ (Aguardando)
- [ ] Verificar rota `/discente` em `routes/web.php`
- [ ] Verificar se rota React existe em `front-end/src/App.tsx`

### 4. Frontend Integration ⏳ (Aguardando)
- [ ] Atualizar `front-end/src/lib/api.ts`:
  - [ ] Adicionar interface TypeScript para Student/AcademicBond
  - [ ] Adicionar função para buscar dados do discente logado
- [ ] Atualizar `WelcomeSection.tsx`:
  - [ ] Remover mock data
  - [ ] Integrar com React Query
  - [ ] Buscar dados reais via API
  - [ ] Exibir: nome, modalidade (level), orientador

### 5. Build & Test ⏳ (Aguardando)
- [ ] Executar `cd front-end && npm run build`
- [ ] Testar em `php artisan serve`
- [ ] Executar `php artisan test`
- [ ] Executar `./vendor/bin/pint`

## 📊 Descobertas Database

**Tabela principal: `academic_bonds`**
- `student_id` → FK para `users` (discente)
- `advisor_id` → FK para `users` (orientador)
- `level` → "Mestrado" ou "Doutorado"
- `status` → status do vínculo
- `research_line_id` → linha de pesquisa

**Não existe campo co-orientador** - implementação futura se necessário

## 🚨 Regras Críticas do CLAUDE.md

1. **Frontend é 95% completo** - fazer mudanças mínimas
2. **Sempre executar `npm run build`** antes de testar
3. **Testar apenas no Laravel server** (`php artisan serve`)
4. **Feature Tests são OBRIGATÓRIOS** para todas as APIs
5. **Usar Form Requests** para validação
6. **Usar Policies** para autorização
7. **CSRF obrigatório** para operações de escrita (GET não precisa)
8. **Seguir padrões existentes** do projeto

## 📝 Próximos Passos

1. Verificar se Model AcademicBond existe
2. Criar API endpoint `/api/student/me`
3. Implementar frontend integration
4. Testar e validar

## ✅ Status - CONCLUÍDO COM SUCESSO
- [x] ✅ Análise inicial
- [x] ✅ Verificação database
- [x] ✅ Backend API - StudentController criado com endpoint `/api/student/me`
- [x] ✅ Frontend integration - WelcomeSection conectado com API real
- [x] ✅ Build e testes - npm run build + Feature Tests passando
- [x] ✅ Servidor funcionando - Laravel serve testado e operacional

## 🎯 RESUMO DA IMPLEMENTAÇÃO REALIZADA

### ✅ Backend Implementado:
- **Controller**: `StudentController` com método `me()`
- **API Endpoint**: `GET /api/student/me` (protegido por auth:sanctum)
- **Response**: Dados do discente + modalidade + orientador + linha de pesquisa
- **Feature Tests**: 5 testes cobrindo success (200), auth failure (401), e not found (404)

### ✅ Frontend Integrado:
- **React Route**: `/discente` → `Discente.tsx` page
- **WelcomeSection**: Agora usa dados reais via React Query
- **API Integration**: `getStudentData()` function em `lib/api.ts`
- **Loading/Error States**: Skeleton loading + error handling

### ✅ Database Schema Utilizada:
- **Tabela**: `academic_bonds` (vínculo acadêmico)
- **Campos utilizados**: `student_id`, `advisor_id`, `level`, `status`, `research_line_id`
- **Enum values**: 'graduation', 'master', 'doctorate', 'post-doctorate'

### ✅ Testes e Qualidade:
- **Feature Tests**: 5 testes passando (100% success rate)
- **Laravel Pint**: Código formatado seguindo PSR-12
- **Build**: `npm run build` executado com sucesso
- **Server Test**: Laravel serve funcionando corretamente

## 🚀 COMO USAR

1. **Iniciar servidor**: `php artisan serve`
2. **Acessar módulo**: `/discente` (requer autenticação com role=3)
3. **API**: `GET /api/student/me` retorna dados do discente logado

## 📋 IMPLEMENTAÇÃO FUTURA

Para estender o módulo discente, considerar implementar:
- [ ] Co-orientador (adicionar campo `co_advisor_id` na tabela)
- [ ] Seções restantes do dashboard (BasicInfoSection, etc.)
- [ ] CRUD de disciplinas do discente
- [ ] CRUD de publicações
- [ ] Relatórios de progresso