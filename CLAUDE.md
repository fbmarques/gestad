# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GESTAD** (Sistema de Gestão Acadêmica) is a Laravel 12 + React academic management system using a **Monolithic SPA Architecture**:

### 🚨 **CRITICAL PRODUCTION CONSTRAINTS**:
- **Hospedagem compartilhada** (shared hosting) - NO npm commands available in production
- **React frontend is 95% complete** in `front-end/` directory (minimal changes needed)
- **Only Laravel server runs** in production (`php artisan serve`)
- **Single server architecture** essential for shared hosting deployment

### Key Components:
- **Laravel 12** backend provides RESTful API for academic management
- **React SPA** (pre-built) in `front-end/` handles user interface
- **Academic domain**: students (discentes), teachers (docentes), disciplines, research lines, etc.
- **Build-once, serve-static** approach for frontend assets

## Architecture: Monolithic SPA (Shared Hosting Compatible)

**🏭 PRODUCTION REALITY**: Hospedagem compartilhada means NO Node.js/npm in production environment.

**Fundamental Rule**: There is ONLY ONE SERVER. We run only `php artisan serve`. This single server serves both the compiled React application and the API.

### Request Flow:
1. **Laravel serves COMPILED React** app via `web.php` routes returning `app.blade.php`
2. **Static assets** served from `public/` (built with `npm run build`)
3. React app (loaded in browser) makes API calls to the same domain/port (e.g., `POST /login`, `GET /api/user`)
4. **No CORS issues** - all requests come from the same domain, so CORS configuration is NOT needed

### 🚨 **MANDATORY Workflow for ANY Frontend Changes**:
1. Make changes in `front-end/` directory
2. **ALWAYS run `npm run build`** before testing
3. Test on Laravel server only (`php artisan serve`)
4. **NEVER test on npm dev server** for production validation

## Development Commands

### 🏭 **PRODUCTION Commands (Shared Hosting)**
```bash
# PRODUCTION/DEPLOYMENT: Only this command available
php artisan serve        # Serves both compiled React app AND API

# Build React before deployment (local only)
cd front-end && npm run build
```

### 💻 **DEVELOPMENT Commands (Local Environment)**
```bash
# CRITICAL: Always build React after frontend changes
cd front-end && npm run build

# Test on Laravel server (production simulation)
php artisan serve        # Test environment that matches production

# Development with hot reload (local convenience only)
composer dev             # Runs server, queue, logs, AND vite

# Run tests (MANDATORY before any API completion)
composer test
# OR
php artisan test

# Code formatting
./vendor/bin/pint
```

### ⚡ **Frontend Build Commands (front-end/ directory)**
```bash
cd front-end

# 🚨 REQUIRED after ANY frontend changes
npm run build            # Build for production (ALWAYS needed)

# Development server (local convenience only - NOT for production testing)
npm run dev              # Vite dev server on localhost:8080

# Build variants
npm run build:dev        # Development build

# Linting
npm run lint
```

### 🚨 **CRITICAL WORKFLOW REMINDER**:
```bash
# After implementing any functionality:
1. cd front-end && npm run build
2. php artisan serve
3. Test on Laravel server (NOT npm dev server)
4. Run tests: php artisan test
```

## API Development Standards

### MANDATORY Quality Rules (Golden Rules)

**1. Automated Tests are REQUIRED**: No API task is complete without Feature Tests validating:
- Success response (2xx) with correct JSON structure
- Authorization failures (401 for unauthenticated, 403 for unauthorized)
- Validation failures for invalid data (422)

**2. Manual QA**: Every completed task must be manually verified in the "happy path" to ensure frontend integration works

**3. Security & Validation**:
- Use Form Requests for ALL API input validation
- Use Policies for access control on every endpoint
- Follow PSR-12 standards
- Keep Controllers lean, move business logic to Services

### Backend Implementation Patterns

**Routes**:
- API routes in `routes/api.php` protected by `auth:sanctum` middleware
- Public routes (like `/login`) in `routes/web.php`

**Authentication**: Laravel Sanctum for SPA authentication

**Seeders**: Don't use `Hash::make()` manually if User model uses `hashed` cast - Eloquent handles it automatically

### Frontend Integration Patterns

**API Client**: Use centralized Axios instance in `front-end/src/lib/api.ts`

**CRITICAL CSRF Rule**: For ANY function that modifies data (POST, PUT, PATCH, DELETE), the FIRST line must be:
```javascript
await api.get('/sanctum/csrf-cookie');
```
This is NOT needed for GET requests.

## Architecture Details

### Backend (Laravel 12)
- Standard MVC structure in `app/` directory
- Database migrations for academic entities
- Laravel Sanctum for SPA authentication
- Feature/Unit tests with PHPUnit
- Laravel Pint for PSR-12 formatting

### Frontend (React SPA) - 95% Complete

**🚨 PRODUCTION CONSTRAINT**: Frontend is essentially DONE (95% complete) with minimal changes needed.

- **Location**: `front-end/` directory (pre-built interface)
- **Status**: Nearly complete academic management interface
- **Stack**: Vite + React 18 + TypeScript
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State**: TanStack React Query for server state
- **Routing**: React Router v6 with academic pages structure
- **Forms**: React Hook Form with Zod validation
- **API**: Centralized Axios client with CSRF protection in `front-end/src/lib/api.ts`

#### 🎯 **Frontend Development Philosophy**:
- **Minimal changes required** - interface is essentially complete
- **Focus on API integration** - connect existing UI to Laravel backend
- **Build-first approach** - always compile before testing
- **Shared hosting compatible** - static assets only in production

### Key Frontend Pages
Academic management pages including:
- Student management (Discentes/DiscentesExcluidos)
- Teacher management (Docentes/DocentesExcluidos)
- Disciplines (Disciplinas/DisciplinasExcluidas)
- Research lines (LinhasPesquisa)
- Publications (Producoes/ProducoesStatus)
- Reports (Relatorios)
- Administrative dashboard

## Testing Requirements

### Laravel (MANDATORY for ALL API endpoints)
- PHPUnit configuration in `phpunit.xml`
- **Feature tests REQUIRED** in `tests/Feature/` for every API endpoint
- Unit tests in `tests/Unit/` for business logic
- Tests must validate:
  - Success responses (2xx) with correct JSON structure
  - Authentication failures (401/403)
  - Validation failures (422)
- Run with `composer test` or `php artisan test`

### React
- ESLint configuration for code quality
- Run linting with `npm run lint` in `front-end/` directory

## Development Workflow

### API Development (Backend-focused)
1. **Create endpoint**: Define routes in `routes/api.php` or `routes/web.php`
2. **Implement**: Controller (lean) + Service (business logic) + Form Request (validation) + Policy (authorization)
3. **Test**: Write Feature Tests covering all scenarios
4. **QA**: Manual verification of "happy path" with frontend
5. **Format**: Run `./vendor/bin/pint` for PSR-12 compliance

### Frontend Integration
1. **API calls**: Use centralized Axios client from `front-end/src/lib/api.ts`
2. **CSRF protection**: Add `await api.get('/sanctum/csrf-cookie');` before write operations
3. **Authentication**: Leverage Sanctum SPA authentication
4. **Testing**: Manual verification that React frontend works with API

### 🚀 **Deployment (Shared Hosting Environment)**

**🚨 CRITICAL**: No npm/Node.js available in production. All builds must be done locally.

#### Pre-deployment (Local):
```bash
# 1. Build React frontend
cd front-end && npm run build

# 2. Verify build works on Laravel server
php artisan serve

# 3. Run all tests
php artisan test

# 4. Format code
./vendor/bin/pint
```

#### Production Environment:
- **Only PHP/Laravel** available
- **Static React assets** served from `public/` directory
- **Single command**: `php artisan serve` (serves both app and API)
- **No CORS**: Not needed due to monolithic SPA architecture

#### ⚠️ **Frontend Change Protocol**:
Every time ANY frontend functionality is implemented:
1. ✅ Build: `cd front-end && npm run build`
2. ✅ Test on Laravel server: `php artisan serve`
3. ✅ Run tests: `php artisan test`
4. ❌ **NEVER** rely on npm dev server for final validation

## Laravel Boost Integration

**Laravel Boost** is installed and configured in this project, providing AI-enhanced development capabilities:

### Available Commands
```bash
# Start Boost MCP server (for AI integrations)
php artisan boost:mcp

# Reinstall/reconfigure Boost
php artisan boost:install
```

### Features Available
- **15+ specialized tools** for Laravel development
- **17,000+ pieces of vectorized Laravel ecosystem documentation** specific to installed package versions
- **Laravel-maintained AI guidelines** for framework conventions and best practices
- **Database querying**, **Tinker integration**, **documentation search**, and **browser log reading**

### MCP Configuration
- Main config: `.mcp.json` (Claude Code)
- VS Code config: `.vscode/mcp.json`
- Server command: `php artisan boost:mcp`

### Key Boost Guidelines Applied
- Use `php artisan make:` commands for file creation
- Always use Form Requests for validation
- Use Eloquent relationships over raw queries
- Run `vendor/bin/pint --dirty` before finalizing changes
- Create Feature Tests for all API endpoints (PHPUnit required)
- Follow Laravel 12 streamlined structure (no `app/Http/Middleware/`, use `bootstrap/app.php`)

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context
This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.3.25
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- phpunit/phpunit (PHPUNIT) - v11


## Conventions
- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts
- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture
- Stick to existing directory structure - don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling
- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.


=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double check the available parameters.

## URLs
- Whenever you share a project URL with the user you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain / IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation specific for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The 'search-docs' tool is perfect for all Laravel related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel-ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries - package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit"
3. Quoted Phrases (Exact Position) - query="infinite scroll" - Words must be adjacent and in that order
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit"
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms


=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors
- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters.

### Type Declarations
- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments
- Prefer PHPDoc blocks over comments. Never use comments within the code itself unless there is something _very_ complex going on.

## PHPDoc Blocks
- Add useful array shape type definitions for arrays when appropriate.

## Enums
- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.


=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] <name>` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.


=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- No middleware files in `app/Http/Middleware/`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- **No app\Console\Kernel.php** - use `bootstrap/app.php` or `routes/console.php` for console configuration.
- **Commands auto-register** - files in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 11 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.


=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.


=== phpunit/core rules ===

## PHPUnit Core

- This application uses PHPUnit for testing. All tests must be written as PHPUnit classes. Use `php artisan make:test --phpunit <name>` to create a new test.
- If you see a test using "Pest", convert it to PHPUnit.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, ask the user if they would like to also run the entire test suite to make sure everything is still passing.
- Tests should test all of the happy paths, failure paths, and weird paths.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files, these are core to the application.

### Running Tests
- Run the minimal number of tests, using an appropriate filter, before finalizing.
- To run all tests: `php artisan test`.
- To run all tests in a file: `php artisan test tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --filter=testName` (recommended after making a change to a related file).
</laravel-boost-guidelines>