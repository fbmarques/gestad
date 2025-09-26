# Plano de Desenvolvimento - CRUD Discentes

## Análise dos Requisitos

### Contexto
- **Discente**: Usuário com role_id = 3
- **Acesso**: URLs `/discentes` e `/discentes-excluidos` acessíveis apenas por roles 1 e 2
- **Frontend**: Já desenvolvido e localizado em:
  - `front-end/src/pages/Discentes.tsx`
  - `front-end/src/pages/DiscentesExcluidos.tsx`

### Regras de Negócio Críticas

1. **Cadastro de Discente**:
   - Salvar na tabela `users` com role_id = 3
   - Inserir registro em `role_user` com role = 3
   - Criar registro em `academic_bonds` com status = 'active'

2. **Academic Bonds Logic**:
   - Mestrado: level = 'master'
   - Doutorado: level = 'doctorate'
   - Status inicial: 'active'
   - Quando status = 'completed' (mestrado), permite upgrade para doutorado
   - Se doutorado, NÃO permite downgrade para mestrado

3. **Transição Mestrado → Doutorado**:
   - Só permitida quando academic_bond de mestrado tem status = 'completed'
   - Criar NOVA linha em academic_bonds para doutorado
   - Manter histórico do mestrado

4. **Display na Table**:
   - Status Mestrado/Doutorado vem de academic_bonds.status
   - Não dos campos mockados no frontend

## Análise do Frontend Existente

### Campos Identificados em Discentes.tsx:
- Nome completo
- Email
- Orientador (Popover com lista de docentes)
- Co-Orientador (opcional)
- Nível de Pós-Graduação (Radio: mestrado/doutorado)
- Status Mestrado (derivado de academic_bonds)
- Status Doutorado (derivado de academic_bonds)

### Mock Data que Precisa ser Substituída:
```typescript
// mockDocentes: precisa vir da API de usuários com role docente
// mockDiscentes: precisa vir da API real
// Campos status: precisam vir de academic_bonds
```

## Componentes Backend Necessários

### 1. **Model Adjustments**
- [x] Verificar/ajustar User model
- [x] Criar/ajustar AcademicBond model
- [x] Definir relationships corretas

### 2. **Migration Verification**
- [x] Verificar se academic_bonds table está correta
- [x] Verificar foreign keys e constraints

### 3. **Controllers**
- [x] `DiscenteController` (CRUD completo) ✅ IMPLEMENTADO
  - [x] `index()` - Lista discentes ativos
  - [x] `store()` - Cria discente + academic_bond
  - [x] `show()` - Exibe discente específico
  - [x] `update()` - Atualiza discente (com lógica de transição)
  - [x] `destroy()` - Soft delete discente
  - [x] `trashed()` - Lista discentes excluídos
  - [x] `restore()` - Restaura discente excluído

### 4. **Form Requests**
- [x] `StoreDiscenteRequest` - Validação para criação ✅ IMPLEMENTADO
- [x] `UpdateDiscenteRequest` - Validação para atualização ✅ IMPLEMENTADO

### 5. **Policies**
- [x] Controle de acesso (roles 1,2) ✅ IMPLEMENTADO via middleware

### 6. **Routes**
- [x] API routes protegidas por auth:sanctum ✅ IMPLEMENTADO
- [x] Web routes para SPA (roles 1,2) ✅ IMPLEMENTADO

### 7. **Services (Business Logic)**
- [x] Lógica de negócio complexa ✅ IMPLEMENTADA no Controller
  - [x] Criação de discente + academic_bond
  - [x] Transição mestrado → doutorado
  - [x] Validação de regras de negócio

### 8. **Feature Tests**
- [x] Teste de criação de discente ✅ 18 TESTES PASSANDO
- [x] Teste de listagem (com authorization)
- [x] Teste de edição
- [x] Teste de transição mestrado → doutorado
- [x] Teste de soft delete/restore
- [x] Teste de authorization (401/403)
- [x] Teste de validation (422)

## API Endpoints Necessários

### Discentes Ativos
```
GET    /api/discentes           - Lista discentes ativos
POST   /api/discentes           - Cria novo discente
GET    /api/discentes/{id}      - Exibe discente específico
PUT    /api/discentes/{id}      - Atualiza discente
DELETE /api/discentes/{id}      - Soft delete discente
```

### Discentes Excluídos
```
GET    /api/discentes/trashed   - Lista discentes excluídos
POST   /api/discentes/{id}/restore - Restaura discente
```

### Dados Auxiliares
```
GET    /api/docentes/for-selection - Lista docentes para seleção
```

## Integração Frontend

### Alterações Necessárias em front-end/src/lib/api.ts:
```typescript
// Interfaces
interface Discente {
  id: number;
  name: string;
  email: string;
  advisor_id: number;
  advisor_name: string;
  co_advisor_id?: number;
  co_advisor_name?: string;
  master_status: 'active' | 'completed' | 'inactive' | 'suspended';
  doctorate_status: 'active' | 'completed' | 'inactive' | 'suspended';
  deleted_at?: string;
}

interface Docente {
  id: number;
  name: string;
}

// API Functions
export const discenteApi = {
  getAll: () => api.get<Discente[]>('/api/discentes'),
  getTrashed: () => api.get<Discente[]>('/api/discentes/trashed'),
  create: (data: CreateDiscenteData) => api.post('/api/discentes', data),
  update: (id: number, data: UpdateDiscenteData) => api.put(`/api/discentes/${id}`, data),
  delete: (id: number) => api.delete(`/api/discentes/${id}`),
  restore: (id: number) => api.post(`/api/discentes/${id}/restore`),
}

export const docenteApi = {
  getForSelection: () => api.get<Docente[]>('/api/docentes/for-selection'),
}
```

### Alterações em Discentes.tsx:
- [x] Substituir mockDocentes por useQuery(docenteApi.getForSelection) ✅ IMPLEMENTADO
- [x] Substituir mockDiscentes por useQuery(discenteApi.getAll) ✅ IMPLEMENTADO
- [x] Implementar mutations para CRUD operations ✅ IMPLEMENTADO
- [x] Mapear campos mock para campos reais da API ✅ IMPLEMENTADO
- [x] Adicionar CSRF protection em operações de escrita ✅ IMPLEMENTADO

### Alterações em DiscentesExcluidos.tsx:
- [x] Substituir mock por useQuery(discenteApi.getTrashed) ✅ IMPLEMENTADO
- [x] Implementar mutation para restore ✅ IMPLEMENTADO
- [x] Mapear campos corretamente ✅ IMPLEMENTADO

## Routes Web Necessárias

```php
// routes/web.php - Para SPA routing
Route::get('/discentes', fn() => view('app'))->middleware('auth.roles:1,2');
Route::get('/discentes-excluidos', fn() => view('app'))->middleware('auth.roles:1,2');
```

## Database Schema Verification

### Verificar academic_bonds table:
- [x] student_id (foreign key to users.id)
- [x] advisor_id (foreign key to users.id)
- [x] level ('master' | 'doctorate')
- [x] status ('active' | 'inactive' | 'completed' | 'suspended')
- [x] start_date, end_date, title, description

## Sequência de Desenvolvimento

### Fase 1: Backend Foundation ✅ COMPLETO
1. [x] Verificar/criar Models com relationships
2. [x] Criar Controller base
3. [x] Criar Form Requests
4. [x] Criar Policy
5. [x] Definir routes API

### Fase 2: Business Logic ✅ COMPLETO
1. [x] Implementar lógica no DiscenteController
2. [x] Lógica de criação (user + role_user + academic_bond)
3. [x] Lógica de transição mestrado → doutorado
4. [x] CRUD operations completas

### Fase 3: Testing ✅ COMPLETO
1. [x] Feature Tests completos (18 testes)
2. [x] Test de authorization
3. [x] Test de validation
4. [x] Test de business rules

### Fase 4: Frontend Integration ✅ COMPLETO
1. [x] Atualizar lib/api.ts
2. [x] Substituir mock data em Discentes.tsx
3. [x] Substituir mock data em DiscentesExcluidos.tsx
4. [x] Build e test no Laravel server

### Fase 5: Final Testing ✅ COMPLETO
1. [x] npm run build
2. [x] php artisan serve (rodando na porta 8002)
3. [x] Teste manual "happy path"
4. [x] php artisan test (18 testes passando)
5. [x] ./vendor/bin/pint (código formatado)

## Critérios de Sucesso

✅ **Backend**:
- Todas as rotas API funcionando
- Authorization correta (roles 1,2)
- Business logic implementada (transições)
- Tests passando (100% coverage dos cenários)

✅ **Frontend Integration**:
- Mock data substituída por API calls
- CRUD operations funcionando
- Campos mapeados corretamente
- Build funcionando no Laravel server

✅ **Quality Assurance**:
- PSR-12 compliance (pint)
- Feature Tests abrangentes
- Manual QA "happy path"
- Sem console errors no frontend

## Arquivos que Serão Criados/Modificados

### Novos Arquivos: ✅ CRIADOS
- [x] `app/Http/Controllers/DiscenteController.php`
- [x] `app/Http/Requests/StoreDiscenteRequest.php`
- [x] `app/Http/Requests/UpdateDiscenteRequest.php`
- [x] `app/Models/AcademicBond.php`
- [x] `database/migrations/2025_09_10_173328_create_academic_bonds_table.php`
- [x] `database/factories/AcademicBondFactory.php`
- [x] `database/factories/ResearchLineFactory.php`
- [x] `tests/Feature/DiscenteTest.php`

### Arquivos Modificados: ✅ ATUALIZADOS
- [x] `app/Models/User.php` (relationships acadêmicos)
- [x] `routes/api.php` (rotas de discentes)
- [x] `routes/web.php` (rotas SPA)
- [x] `front-end/src/lib/api.ts` (APIs de discentes)
- [x] `front-end/src/pages/Discentes.tsx` (integração completa)
- [x] `front-end/src/pages/DiscentesExcluidos.tsx` (integração completa)
- [x] `front-end/src/App.tsx` (rotas do React)

---

**IMPORTANTE**: Seguir rigorosamente o padrão estabelecido no CLAUDE.md:
- ✅ Build primeiro: `cd front-end && npm run build`
- ✅ Test no Laravel server: `php artisan serve`
- ✅ Feature Tests obrigatórios
- ✅ Form Requests para validação
- ✅ CSRF protection no frontend
- ✅ Pint compliance

---

## 🎯 STATUS FINAL DO PROJETO

### ✅ **PROJETO COMPLETADO COM SUCESSO** - Data: 26/09/2025

**Todas as funcionalidades implementadas e testadas:**

1. **Backend Laravel 12**: CRUD completo para discentes com regras de negócio complexas
2. **Academic Bonds System**: Sistema de progressão mestrado → doutorado implementado
3. **Testes Automatizados**: 18 testes PHPUnit passando (100% coverage dos cenários)
4. **Frontend React**: Integração completa com APIs, substituição de mock data
5. **Autenticação**: Controle de acesso por roles (1,2) implementado
6. **Build & Deploy**: Frontend compilado e servidor Laravel rodando

**Servidor rodando em**: `http://127.0.0.1:8002`
**Testes**: 18/18 passando ✅
**Code Quality**: PSR-12 compliant ✅
**Frontend**: Build compilado e integrado ✅

### 🚀 **Pronto para Produção**
O sistema está completamente funcional e pronto para deploy em hospedagem compartilhada conforme especificado no CLAUDE.md.