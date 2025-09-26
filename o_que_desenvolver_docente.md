# Desenvolvimento CRUD Docentes - Plano de Implementação

## 📋 Requisitos Analisados

### Frontend Existente
- **Docentes.tsx**: Interface completa com mock data, precisa integração com API
- **DocentesExcluidos.tsx**: Gerenciamento de docentes soft-deleted
- **URLs**: `/docentes` e `/docentes-excluidos`

### Regras de Negócio
- **Docente = User com role_id = 2**
- **Admin toggle**: Docentes podem ter role adicional de admin (role_id = 1)
- **Linha de Pesquisa**: Relacionamento obrigatório com ResearchLine
- **Soft Delete**: Funcionalidade de exclusão/recuperação

## 🏗️ Passos de Implementação

### 1. Backend - Models e Migrations
- [x] Verificar modelo User existente
- [x] Verificar modelo ResearchLine existente
- [x] Ajustar User model para suporte a múltiplas roles (docente + admin)
- [x] Criar/ajustar migrations para suporte a docentes (já existiam)

### 2. Backend - Controllers e Routes
- [x] Criar DocenteController com métodos CRUD
- [x] Implementar endpoints:
  - `GET /api/docentes` (index)
  - `POST /api/docentes` (store)
  - `PUT /api/docentes/{id}` (update)
  - `DELETE /api/docentes/{id}` (soft delete)
  - `GET /api/docentes-trashed` (soft deleted)
  - `POST /api/docentes/{id}/restore` (restore)
  - `GET /api/research-lines-dropdown` (para dropdown)

### 3. Backend - Form Requests e Policies
- [x] Criar StoreDocenteRequest (validação cadastro)
- [x] Criar UpdateDocenteRequest (validação edição)
- [x] ~~Criar DocentePolicy (autorização)~~ **Implementado direto no Controller**

### 4. Backend - Services
- [x] ~~Criar DocenteService para lógica de negócio~~ **Implementado direto no Controller**
- [x] Implementar lógica de múltiplas roles (docente + admin)

### 5. Frontend - Ajustes Necessários
- [ ] **PENDENTE**: Adicionar toggle de admin no formulário de cadastro
- [ ] **PENDENTE**: Adicionar toggle de admin no formulário de edição
- [ ] **PENDENTE**: Adicionar coluna "Adm" na tabela entre "Linha de Pesquisa" e "Edt"
- [ ] **PENDENTE**: Integrar com API real (remover mock data)
- [x] Atualizar lib/api.ts com funções de docentes

### 6. Frontend - Rotas React e Laravel
- [ ] **PENDENTE**: Adicionar rotas em App.tsx
- [x] Adicionar rotas em routes/web.php com middleware auth.roles:1,2

### 7. Testes
- [x] Feature tests para todos os endpoints
- [x] Testes de autorização (roles 1,2)
- [x] Testes de validação
- [x] Testes de soft delete/restore

### 8. Integração e Build
- [x] Executar `npm run build`
- [x] Testar em `php artisan serve`
- [x] Executar `php artisan test`
- [x] Executar `./vendor/bin/pint`

## 🎯 Funcionalidades Específicas

### Admin Toggle
- **Campo**: `is_admin` (boolean virtual calculado pelas roles)
- **Cadastro**: Toggle switch para adicionar role_id=1 além da role_id=2
- **Edição**: Toggle switch para gerenciar role_id=1
- **Tabela**: Coluna "Adm" com ícone de usuário se for admin

### Integração com Research Lines
- **Endpoint**: `/api/research-lines` para popular dropdown
- **Relacionamento**: User belongsTo ResearchLine
- **Campo**: `research_line_id` na tabela users

### Soft Delete
- **Laravel**: SoftDeletes trait no User model
- **Endpoints**: `/api/docentes/trashed` e `/api/docentes/{id}/restore`
- **Frontend**: DocentesExcluidos.tsx já implementado

## ⚠️ Pontos de Atenção (CLAUDE.md)

1. **Sempre executar `npm run build` após mudanças frontend**
2. **Testar apenas no Laravel server (`php artisan serve`)**
3. **CSRF token obrigatório**: `await api.get('/sanctum/csrf-cookie')` antes de POST/PUT/DELETE
4. **Testes obrigatórios** para todos os endpoints
5. **Form Requests** para toda validação
6. **Policies** para toda autorização
7. **PSR-12** com `./vendor/bin/pint`
8. **Rotas em AMBOS**: `routes/web.php` E `App.tsx`

## 🔄 Workflow Obrigatório
1. Implementar backend
2. Executar testes backend
3. Ajustar frontend (remover mock data)
4. `cd front-end && npm run build`
5. `php artisan serve`
6. Testar integração completa
7. `php artisan test`
8. `./vendor/bin/pint`