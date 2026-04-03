# Repositórios

A camada de repositório isola HTTP (`fetch`) contra o host Celesc. Hierarquia (do mais genérico ao específico):

```
BaseCelescRepository
  └── AuthenticatedCelescRepository
        └── GraphqlRepository
              ├── SapGraphqlRepository   → POST /graphql
              └── CmsGraphqlRepository → POST /cms/graphql
AuthRepository extends BaseCelescRepository → POST /auth/login, /auth/logout
```

Arquivos em `src/repositories/` e `src/repositories/abstract/`.

---

## `BaseCelescRepository`

**Arquivo:** `abstract/base-celesc.repository.ts`

**Responsabilidade:** montar URLs absolutas a partir de `CelescConfig.baseUrl` e enviar `POST` JSON com `Accept` / `Content-Type` adequados.

**Métodos:**

- `resolveUrl(path)` — concatena base + path.
- `postJson(path, body, headers?)` — retorna JSON parseado; lança `CelescHttpError` se status não OK ou corpo não JSON.

**Uso:** base para qualquer endpoint REST do portal que não precise do token na mesma abstração (ex.: login).

---

## `AuthenticatedCelescRepository`

**Arquivo:** `abstract/authenticated-celesc.repository.ts`

**Responsabilidade:** anexar `Authorization: Bearer <token>` e `execution-requester: GRPB` às requisições, lendo o token de um `SessionStore`.

**Métodos:**

- `requireToken()` — obtém access token ou lança `AuthenticationRequiredError`.
- `postJsonAuthorized(path, body, extraHeaders?)` — `postJson` com Bearer.

**Uso:** base para chamadas que exigem sessão SAP (GraphQL principal).

---

## `GraphqlRepository`

**Arquivo:** `abstract/graphql.repository.abstract.ts`

**Responsabilidade:** executar GraphQL genérico: monta corpo `{ query, variables, operationName? }`, aplica cabeçalhos “browser-like” (`Origin`, `Cookie` opcional via env, `User-Agent`).

**Opção `sendBearer`:**

- `true` (padrão): usa `postJsonAuthorized` — fluxo SAP com token.
- `false`: usa `postJson` sem Bearer — fluxo CMS Strapi.

**Método principal:**

- `execute(payload)` — retorna `data`; se `errors[]` presente, lança `CelescGraphqlError`; se `data` ausente, erro explícito.

---

## `SapGraphqlRepository`

**Arquivo:** `sap-graphql.repository.ts`

**Path:** `/graphql`

**Responsabilidade:** GraphQL do backend que atende contratos e rastreamento de solicitações, com Bearer do login.

---

## `CmsGraphqlRepository`

**Arquivo:** `cms-graphql.repository.ts`

**Path:** `/cms/graphql`

**Responsabilidade:** GraphQL Strapi (conteúdo, layout, configurações). Construído com `sendBearer: false` porque o token opaco do `/auth/login` não é aceito como Bearer neste endpoint — o comportamento espelha o carregamento público ou semi-público do CMS no site.

---

## `AuthRepository`

**Arquivo:** `auth.repository.ts`

**Responsabilidade:** autenticação REST JSON do portal.

**Endpoints:**

| Método | Path | Descrição |
|--------|------|-----------|
| `login(body, options?)` | `POST /auth/login` | Corpo no formato `LoginRequest` (e-mail, senha, canal, `deviceId`, etc.). Headers opcionais: `Cookie` (`CELESC_LOGIN_COOKIE`), `Referer`, `User-Agent`. Resposta inclui `data.authenticate.login.accessToken`. |
| `logout(accessToken, options?)` | `POST /auth/logout` | Invalida sessão no servidor; usa Bearer e Referer de área logada. |

**Tipos:** `LoginResponse`, opções `LoginRequestOptions` / `LogoutRequestOptions` para sobrescrever Referer.

---

## Relação com o restante do sistema

- `CelescSessionManager` usa `AuthRepository` para popular `SessionStore`.
- `SapGraphqlRepository` e `CmsGraphqlRepository` leem o mesmo `SessionStore` para SAP; o CMS não envia o Bearer mesmo com sessão válida.
