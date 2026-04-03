# Serviços

## `CelescClient`

**Arquivo:** `src/services/celesc-client.ts`

**Papel:** *composition root* — instancia configuração, store de sessão, repositórios e o gerenciador de sessão, e expõe métodos de alto nível para CLI, API de dev e consumidores da biblioteca.

### Componentes internos

| Membro | Tipo | Função |
|--------|------|--------|
| `sessionStore` | `InMemorySessionStore` | Token e metadados em memória. |
| `config` | `CelescConfig` | `loadCelescConfig()` — URL, canal, cookies opcionais, User-Agent. |
| `authRepository` | `AuthRepository` | Login/logout REST. |
| `sessionManager` | `CelescSessionManager` | Orquestra estratégia de login e hidratação por env. |
| `sap` | `SapGraphqlRepository` | GraphQL SAP. |
| `cms` | `CmsGraphqlRepository` | GraphQL CMS. |

### Construtor

- Se **não** houver `CELESC_USERNAME` + `CELESC_PASSWORD`, chama `hydrateFromEnvironment()` para carregar `CELESC_ACCESS_TOKEN` — evita que um token velho bloqueie login por senha.

### Autenticação

- `signInFromEnv()` — login com usuário/senha do `.env`.
- `signInWithPassword(username, password)` — login explícito.
- `signOut()` — `POST /auth/logout` + limpeza local.

### Dados (mapeamento → operação GraphQL)

| Método | Operação / observação |
|--------|------------------------|
| `getAllRequestTrackings(input)` | `GET_ALL_REQUEST_TRACKINGS` + variáveis `channelCode`, `target: "sap"`, `requestTrackingInput`. |
| `getRequestTrackingStatus(input)` | `GET_REQUEST_TRACKING_STATUS`. |
| `getAllContracts(input)` | `SAP_ALL_CONTRACTS` com `partner`, `profileType`, etc. |
| `getNavbars`, `getUnitSelectionPage`, `getConsumerUnitTypes` | Queries CMS individuais. |
| `getCmsLayoutBundle` | `CMS_LAYOUT_BUNDLE` (uma ida ao CMS). |
| `getFooters`, `getSchedulingConfigs` | CMS auxiliares. |

### Tipos exportados

- `RequestTrackingInput`, `RequestTrackingStatusInput`, `AllContractsInput` — alinhados às variáveis GraphQL usadas nas operações.

---

## `login-token.util.ts`

**Arquivo:** `src/services/login-token.util.ts`

**Papel:** parsing defensivo de respostas de login e normalização de tokens vindos de cópia manual (DevTools, `.env`).

| Função | Propósito |
|--------|-----------|
| `normalizeAccessTokenFromEnv(raw)` | Remove prefixo `Bearer ` acidental. |
| `pickCelescAuthLoginAccessToken(payload)` | Lê `data.authenticate.login.accessToken`. |
| `parseCelescLoginSuccess(payload)` | Retorna `ParsedCelescLogin` com token e, se existirem, `userId`, `partner`, `accessId`. |
| `describeCelescLoginFailure(payload)` | Mensagem amigável a partir de `authenticate.message` / `error`. |
| `pickAccessToken(payload)` | Fallback genérico com chaves comuns (`token`, `access_token`, etc.) para payloads não padronizados. |

Exportado também em `src/index.ts` para uso externo.
