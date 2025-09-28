# 📋 Padrões de Desenvolvimento - Página /discente

Este documento serve como guia para manter consistência no desenvolvimento de funcionalidades para a página `/discente`, baseado na implementação bem-sucedida do `BasicInfoSection.tsx`.

## 🎯 **Arquitetura Implementada**

### **Padrão Geral de Integração Frontend-Backend**
```
Frontend (React) ←→ API Laravel ←→ Database (SQLite)
     ↓                    ↓              ↓
- React Query        - Controllers    - Migrations
- TypeScript         - FormRequests   - Models
- Validação Client   - Policies       - Seeders
- Auto-save          - Validation     - Tests
```

## 🔧 **1. Backend (Laravel) - Padrão Obrigatório**

### **1.1 Model Updates**
```php
// app/Models/User.php
protected $fillable = [
    'name',
    'email',
    'password',
    'registration',        // ✅ Novo campo adicionado
    'lattes_url',         // ✅ Novo campo adicionado
    'orcid',              // ✅ Novo campo adicionado
    'research_line_id',
    'observation',
    'theme',
];
```

### **1.2 FormRequest (OBRIGATÓRIO)**
```bash
php artisan make:request UpdateUserBasicInfoRequest --no-interaction
```

```php
// app/Http/Requests/UpdateUserBasicInfoRequest.php
public function authorize(): bool
{
    return auth()->check() && auth()->user()->isDiscente();
}

public function rules(): array
{
    return [
        'registration' => ['nullable', 'string', 'max:10', 'regex:/^\d{1,10}$/'],
        'lattes_url' => ['nullable', 'url', 'regex:/^http:\/\/lattes\.cnpq\.br\/\d+$/'],
        'orcid' => ['nullable', 'string', 'regex:/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/'],
    ];
}

public function messages(): array
{
    return [
        'registration.regex' => 'A matrícula deve conter apenas números e ter no máximo 10 dígitos.',
        'lattes_url.regex' => 'O link do Lattes deve seguir o padrão: http://lattes.cnpq.br/NÚMEROS',
        'orcid.regex' => 'O ORCID deve seguir o padrão: 0000-0000-0000-0000',
    ];
}
```

### **1.3 Controller Method Pattern**
```php
// app/Http/Controllers/DiscenteController.php
public function updateBasicInfo(UpdateUserBasicInfoRequest $request): JsonResponse
{
    $user = auth()->user();

    if (! $user) {
        return response()->json(['error' => 'Não autenticado.'], 401);
    }

    if (! $user->isDiscente()) {
        return response()->json(['error' => 'Acesso negado. Apenas discentes podem atualizar suas informações básicas.'], 403);
    }

    // Update only the fields that were provided
    $fieldsToUpdate = [];

    if ($request->has('registration')) {
        $fieldsToUpdate['registration'] = $request->registration;
    }

    if ($request->has('lattes_url')) {
        $fieldsToUpdate['lattes_url'] = $request->lattes_url;
    }

    if ($request->has('orcid')) {
        $fieldsToUpdate['orcid'] = $request->orcid;
    }

    if (! empty($fieldsToUpdate)) {
        $user->update($fieldsToUpdate);
    }

    return response()->json([
        'message' => 'Informações básicas atualizadas com sucesso.',
        'user' => [
            'registration' => $user->registration,
            'lattes_url' => $user->lattes_url,
            'orcid' => $user->orcid,
        ],
    ]);
}
```

### **1.4 Routes Pattern**
```php
// routes/api.php (dentro do middleware auth:sanctum)
Route::patch('/discente/basic-info', [DiscenteController::class, 'updateBasicInfo']);

// routes/web.php (permitir acesso a discentes)
Route::get('/discente', function () {
    $user = auth()->user();
    $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2, 3])->exists();

    if (! $hasAccess) {
        return response()->json(['error' => 'Acesso negado.'], 403);
    }

    return view('app');
});
```

### **1.5 ProfileController Updates**
```php
// app/Http/Controllers/ProfileController.php
public function getUserProfile(Request $request): JsonResponse
{
    $user = $request->user();

    return response()->json([
        'success' => true,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'theme' => $user->theme,
            'registration' => $user->registration,      // ✅ Adicionar
            'lattes_url' => $user->lattes_url,         // ✅ Adicionar
            'orcid' => $user->orcid,                   // ✅ Adicionar
        ],
    ]);
}
```

## 🎨 **2. Frontend (React) - Padrão Obrigatório**

### **2.1 API Types & Functions**
```typescript
// front-end/src/lib/api.ts

// 1. Atualizar UserProfile interface
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    theme: boolean;
    registration?: string;    // ✅ Adicionar
    lattes_url?: string;     // ✅ Adicionar
    orcid?: string;          // ✅ Adicionar
}

// 2. Criar interfaces específicas
export interface UserBasicInfo {
    registration?: string;
    lattes_url?: string;
    orcid?: string;
}

export interface UpdateUserBasicInfoResponse {
    message: string;
    user: {
        registration?: string;
        lattes_url?: string;
        orcid?: string;
    };
}

// 3. Criar função API
export const updateUserBasicInfo = async (data: UserBasicInfo): Promise<UpdateUserBasicInfoResponse> => {
    await api.get('/sanctum/csrf-cookie');  // ✅ OBRIGATÓRIO para operações de escrita
    const response = await api.patch<UpdateUserBasicInfoResponse>('/api/discente/basic-info', data);
    return response.data;
};
```

### **2.2 Component Pattern**
```typescript
// front-end/src/components/discente/BasicInfoSection.tsx
import { useState, useEffect } from "react";
import { updateUserBasicInfo, getUserProfile, UserBasicInfo } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export const BasicInfoSection = () => {
    // 1. State management
    const [formData, setFormData] = useState({
        registration: "",
        lattes_url: "",
        orcid: ""
    });

    // 2. Load initial data
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userProfile = await getUserProfile();
                setFormData({
                    registration: userProfile.registration || "",
                    lattes_url: userProfile.lattes_url || "",
                    orcid: userProfile.orcid || ""
                });
            } catch (error) {
                console.error("Failed to load user profile:", error);
            }
        };
        loadUserData();
    }, []);

    // 3. Mutation setup
    const updateBasicInfoMutation = useMutation({
        mutationFn: (data: UserBasicInfo) => updateUserBasicInfo(data),
        onSuccess: () => {
            toast({ title: "Sucesso", description: "Informação salva automaticamente" });
        },
        onError: (error: any) => {
            // Handle validation errors from backend
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                // Show specific validation error
            } else {
                toast({ title: "Erro", description: "Falha ao salvar informação", variant: "destructive" });
            }
        }
    });

    // 4. Auto-save on blur
    const handleFieldBlur = async (field: string) => {
        const currentValue = formData[field as keyof typeof formData];

        if (!currentValue) return;

        // Client-side validations
        if (field === "lattes_url" && !isValidLattesURL(currentValue)) {
            toast({ title: "Erro", description: "URL do Lattes inválida", variant: "destructive" });
            return;
        }

        // Save to API
        const updateData: UserBasicInfo = { [field]: currentValue };
        updateBasicInfoMutation.mutate(updateData);
    };

    // 5. Validation functions
    const isValidLattesURL = (url: string) => {
        const lattesPattern = /^http:\/\/lattes\.cnpq\.br\/\d+$/;
        return lattesPattern.test(url);
    };

    // ... resto do componente
};
```

## 🧪 **3. Testing Pattern (OBRIGATÓRIO)**

### **3.1 Feature Test Structure**
```php
// tests/Feature/UpdateUserBasicInfoTest.php
class UpdateUserBasicInfoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles for testing
        Role::factory()->create(['id' => 1, 'name' => 'admin']);
        Role::factory()->create(['id' => 2, 'name' => 'docente']);
        Role::factory()->create(['id' => 3, 'name' => 'discente']);
    }

    // ✅ OBRIGATÓRIO: Test success scenario
    public function test_discente_can_update_basic_info_successfully(): void
    {
        $discente = User::factory()->create();
        $discente->roles()->attach(3);

        $response = $this->actingAs($discente, 'sanctum')
            ->patchJson('/api/discente/basic-info', [
                'registration' => '1234567890',
                'lattes_url' => 'http://lattes.cnpq.br/1234567890123456',
                'orcid' => '0000-0001-2345-6789',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Informações básicas atualizadas com sucesso.']);

        $this->assertDatabaseHas('users', [
            'id' => $discente->id,
            'registration' => '1234567890',
        ]);
    }

    // ✅ OBRIGATÓRIO: Test authentication
    public function test_unauthenticated_user_cannot_update_basic_info(): void
    {
        $response = $this->patchJson('/api/discente/basic-info', ['registration' => '123']);
        $response->assertStatus(401);
    }

    // ✅ OBRIGATÓRIO: Test authorization
    public function test_non_discente_user_cannot_update_basic_info(): void
    {
        $docente = User::factory()->create();
        $docente->roles()->attach(2);

        $response = $this->actingAs($docente, 'sanctum')
            ->patchJson('/api/discente/basic-info', ['registration' => '123']);

        $response->assertStatus(403);
    }

    // ✅ OBRIGATÓRIO: Test validations for each field
    public function test_validation_fails_for_invalid_registration(): void
    public function test_validation_fails_for_invalid_lattes_url(): void
    public function test_validation_fails_for_invalid_orcid(): void
}
```

## 🚨 **4. Erros Comuns e Como Evitar**

### **4.1 Banco de Dados Travado (SQLite Lock)**
**❌ Problema**: Multiple Laravel servers accessing same SQLite file
**✅ Solução**:
- Always stop previous servers before starting new ones
- Close database management tools before testing
- Use `php artisan serve` only once per session

### **4.2 CSRF Token Missing**
**❌ Problema**: API calls failing with 419 error
**✅ Solução**:
```typescript
// SEMPRE adicionar antes de operações de escrita (POST, PUT, PATCH, DELETE)
await api.get('/sanctum/csrf-cookie');
const response = await api.patch('/api/endpoint', data);
```

### **4.3 Frontend Build Issues**
**❌ Problema**: Changes not reflecting in browser
**✅ Solução**:
```bash
# SEMPRE fazer build após mudanças no frontend
cd front-end && npm run build
# Testar no servidor Laravel, não no npm dev server
php artisan serve
```

### **4.4 FormRequest Authorization**
**❌ Problema**: Tests expecting custom error message but getting generic 403
**✅ Solução**:
```php
// Test should expect Laravel's default unauthorized message
$response->assertStatus(403)
    ->assertJson(['message' => 'This action is unauthorized.']);
```

### **4.5 Route Access Control**
**❌ Problema**: Route accessible by wrong user roles
**✅ Solução**:
```php
// web.php - Allow discentes (role 3) to access /discente
Route::get('/discente', function () {
    $user = auth()->user();
    $hasAccess = $user && $user->roles()->whereIn('role_id', [1, 2, 3])->exists(); // Include role 3

    if (! $hasAccess) {
        return response()->json(['error' => 'Acesso negado.'], 403);
    }
    return view('app');
});
```

## 🔄 **5. Development Workflow (Ordem Obrigatória)**

### **5.1 Backend Development**
1. ✅ Update Model (`$fillable` array)
2. ✅ Create FormRequest with validation rules
3. ✅ Add method to Controller
4. ✅ Add API route to `routes/api.php`
5. ✅ Update web route in `routes/web.php` if needed
6. ✅ Update ProfileController if new fields needed in user profile
7. ✅ Create Feature Tests (minimum 5 tests)
8. ✅ Run tests: `php artisan test tests/Feature/YourTest.php`

### **5.2 Frontend Development**
1. ✅ Add TypeScript interfaces to `lib/api.ts`
2. ✅ Create API function with CSRF protection
3. ✅ Update component with React Query integration
4. ✅ Implement auto-save with onBlur handlers
5. ✅ Add client-side validation
6. ✅ Handle error responses from backend
7. ✅ Build frontend: `cd front-end && npm run build`

### **5.3 Integration Testing**
1. ✅ Start Laravel server: `php artisan serve`
2. ✅ Test happy path manually in browser
3. ✅ Test validation errors
4. ✅ Test authentication/authorization
5. ✅ Run backend tests: `php artisan test`
6. ✅ Format code: `./vendor/bin/pint --dirty`

### **5.4 Git Workflow**
1. ✅ Check status: `git status`
2. ✅ Add relevant files: `git add file1 file2...`
3. ✅ Commit with descriptive message
4. ✅ Push to remote: `git push`

## 📋 **6. Checklist de Implementação**

### **Backend Checklist**
- [ ] Model atualizado com novos campos no `$fillable`
- [ ] FormRequest criado com `authorize()` e `rules()`
- [ ] Método adicionado ao Controller apropriado
- [ ] Rota API adicionada em `routes/api.php`
- [ ] Rota web atualizada se necessário
- [ ] ProfileController atualizado se novos campos no perfil
- [ ] Feature Tests criados (mínimo 5 cenários)
- [ ] Todos os testes passando

### **Frontend Checklist**
- [ ] Interfaces TypeScript definidas em `lib/api.ts`
- [ ] Função API criada com proteção CSRF
- [ ] UserProfile interface atualizada se necessário
- [ ] Componente integrado com React Query
- [ ] Auto-save implementado com onBlur
- [ ] Validação client-side implementada
- [ ] Tratamento de erros do backend
- [ ] Build do frontend executado
- [ ] Teste manual no navegador funcionando

### **Quality Assurance Checklist**
- [ ] Tests unitários/feature passando
- [ ] Validação de campos funcionando
- [ ] Auto-save funcionando
- [ ] Mensagens de erro apropriadas
- [ ] Carregamento de dados existentes
- [ ] Formatação de código (Pint)
- [ ] Commit e push realizados

## 🎯 **7. Padrões de Nomenclatura**

### **Arquivos e Classes**
- FormRequest: `Update{Entity}{Section}Request`
- Test: `Update{Entity}{Section}Test`
- API Function: `update{Entity}{Section}`
- Interface: `{Entity}{Section}Info`

### **Rotas**
- API: `/api/{entity-singular}/{action}`
- Web: `/{entity-singular}` (permitir acesso conforme roles)

### **Métodos Controller**
- Update: `update{Section}Info`
- Get: `get{Section}Info`

## 📝 **8. Exemplo de Commit Message**
```
feat: Implementar salvamento automático de [funcionalidade]

- Adicionar campos [campo1, campo2] ao [Entity] model
- Criar FormRequest [RequestName] com validações específicas
- Implementar endpoint [METHOD] [route] no [Controller]
- Integrar [Component] com API real usando React Query
- Adicionar [funcionalidade específica]
- Criar testes Feature abrangentes (X testes, Y assertions)

Campos implementados:
- [Campo 1]: [validação/formato]
- [Campo 2]: [validação/formato]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**Este documento deve ser seguido rigorosamente para manter consistência e qualidade no desenvolvimento da página /discente e funcionalidades similares.**