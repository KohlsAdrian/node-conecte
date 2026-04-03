# Domínio

O domínio concentra **tipos**, **erros** e **documentos GraphQL** (strings de query), sem lógica de transporte.

Arquivos principais: `src/domain/`.

---

## `session.types.ts`

| Tipo | Propósito |
|------|-----------|
| `CelescSession` | Estado local: `accessToken`, `updatedAt`, opcionalmente `userId`, `partner`, `accessId` extraídos do login. |
| `LoginRequest` | Corpo enviado ao `POST /auth/login`: `username`, `password`, `socialCode` / `socialRedirectUri` vazios para login por credenciais, `channel`, `accessIp`, `deviceId`, `firebaseToken`. |
| `GraphqlPayload<V>` | `{ query, variables?, operationName? }` para repositórios GraphQL. |
| `GraphqlResponse<T>` | Forma mínima da resposta GraphQL: `data?`, `errors?`. |

---

## `auth-login.types.ts`

Tipagem do JSON de sucesso do login Celesc (caminho típico `data.authenticate`):

| Tipo | Propósito |
|------|-----------|
| `CelescLoginTokenBlock` | `accessToken` e metadados de token. |
| `CelescLoginProfile` | Perfil OIDC-like: `email`, `givenName`, `familyName`, `sub`. |
| `CelescLoginSapAccess` | Contexto SAP: `userId`, `partner`, `accessId`, `channel`, mensagens de erro. |
| `CelescAuthenticatePayload` | Junta `login`, `profile`, `sapAccess`, `message`. |
| `CelescLoginResponseBody` | Envelope `{ data?: { authenticate? } }`. |

Usado por `parseCelescLoginSuccess` e `describeCelescLoginFailure` em `services/login-token.util.ts`.

---

## `errors.ts`

| Classe | Quando ocorre |
|--------|----------------|
| `CelescHttpError` | Resposta HTTP não OK ou corpo não JSON em chamadas REST. |
| `CelescGraphqlError` | `errors[]` na resposta GraphQL ou `data` ausente. |
| `AuthenticationRequiredError` | Operação autenticada sem token no `SessionStore`. |

---

## `graphql/operations.ts`

Exporta **constantes de string** com as queries usadas pelo app. Não executa rede — apenas documenta e centraliza o contrato com o schema do portal.

Ver [graphql-endpoints.md](graphql-endpoints.md) para o significado de cada operação e campo.

**Export público:** o pacote re-exporta essas constantes em `src/index.ts` (`export * from "./domain/graphql/operations.js"`).

---

## Front-end (`web/`)

O arquivo `web/src/main.ts` define tipos **locais** espelhando fatias da resposta GraphQL (`RequestTrackingRow`, `ContractsPayload`, etc.). Não fazem parte do pacote Node publicado, mas alinham a UI aos contratos documentados acima.
