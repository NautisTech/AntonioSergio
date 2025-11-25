# API Modules - Refactoring Status

This directory contains API integration modules for the Nautis CEO application.

## ⚠️ Current Status: REFACTORING IN PROGRESS

We are restructuring all API modules to follow the new architecture defined in `/guidelines/API_STRUCTURE.md`.

### ✅ Completed Modules (Following New Structure)

- **auth** - Authentication and authorization
- **tenants** - Tenant configuration and public settings
- **users** - User management with full CRUD, permissions, and company assignments
- **user-profiles** - User profiles/groups with permission and user management
- **permissions** - Permission management (read-only) with helper hooks
- **companies** - Company management with CRUD, contacts, and addresses (15 endpoints)
- **clients** - Client management with CRUD, contacts, addresses, and blocking (17 endpoints)
- **employees** - Employee/HR management with CRUD, contacts, addresses, benefits, and documents (26 endpoints)

### 🚧 Stub Modules (Temporary Placeholders)

All temporary stub modules have been removed. New modules will be implemented directly following the new structure.

### 📋 TODO List

1. **Phase 1: Core Modules** (Priority: High)
   - [x] users - User management
   - [x] groups - User groups/roles (implemented as user-profiles)
   - [x] permissions - Permission management
   - [x] companies - Company management

2. **Phase 2: Business Entities** (Priority: High)
   - [x] clientes - Client management
   - [x] funcionarios - Employee management
   - [x] fornecedores - Supplier management
   - [x] produtos - Product management

3. **Phase 3: Operations** (Priority: Medium)
   - [ ] encomendas - Sales orders
   - [ ] orcamentos - Quotes
   - [ ] leads - Lead management

4. **Phase 4: Support** (Priority: Medium)
   - [ ] suporte - Support tickets
   - [ ] equipamentos - Equipment management
   - [ ] intervencoes - Interventions
   - [ ] intervencoes-custos - Intervention costs

5. **Phase 5: Content** (Priority: Low)
   - [ ] conteudos - Content management
   - [ ] formacoes - Training/courses

6. **Phase 6: Communication** (Priority: Low)
   - [x] email - Email integration
   - [ ] forum - Forum management
   - [ ] social - Social features
   - [ ] comentarios - Comments

7. **Phase 7: Configuration** (Priority: Low)
   - [ ] configuracoes - Tenant settings
   - [ ] configuracoes-gerais - Global settings
   - [ ] modulos - Module management

8. **Phase 8: Utilities** (Priority: Low)
   - [ ] uploads - File upload management

### 🎯 Refactoring Guidelines

When refactoring a module, follow these steps:

1. Read `/guidelines/API_STRUCTURE.md` for the standard structure
2. Examine the backend API controller in `/ceo_api/src/modules/{module}/`
3. Create proper TypeScript types in `types.ts`
4. Implement API service class in `api.ts`
5. Create React Query hooks in `hooks.ts`
6. Export everything in `index.ts`
7. Update components using the old API to use new hooks
8. Test thoroughly
9. Mark module as ✅ completed in this README

### 📚 Reference Implementation

See `/src/libs/api/auth/` and `/src/libs/api/tenants/` for reference implementations following the new structure.

---

**Last Updated:** 2025-11-17
**Refactoring Started:** 2025-11-17
**Completed Modules:** 8/29 (28%)
