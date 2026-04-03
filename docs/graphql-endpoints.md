# GraphQL — endpoints e dados

O portal Conecte expõe dois pontos GraphQL relevantes para este projeto. Ambos são `POST` com corpo JSON `{ "query": "...", "variables": { ... } }` no mesmo host configurado em `CELESC_BASE_URL` (padrão `https://conecte.celesc.com.br`).

## Endpoints

| Caminho | Uso neste projeto | Autenticação típica |
|---------|-------------------|---------------------|
| **`/graphql`** | Dados “SAP” / back-office: contratos, protocolos de solicitação | `Authorization: Bearer <accessToken>` do `POST /auth/login`, mais cabeçalhos que espelham o browser (`Origin`, opcional `Cookie`, `User-Agent`, `execution-requester: GRPB`) |
| **`/cms/graphql`** | Conteúdo Strapi: navbars, rodapés, tipos de UC, flags de manutenção | Neste app: **sem** Bearer SAP (o Strapi rejeita o token opaco do login); usa `execution-requester: GRPB` e cabeçalhos de browser quando configurados |

Variáveis comuns nas operações SAP incluem `channelCode` (ex.: `ZAW` via `CELESC_CHANNEL`) e `target: "sap"` conforme o schema esperado pelo gateway.

---

## Operações SAP (`/graphql`)

Definidas em `src/domain/graphql/operations.ts` e executadas por `SapGraphqlRepository`.

### `GetAllRequestTrackings`

**Propósito:** listar solicitações de serviço (religação, segunda via, etc.) para filtro por instalação/parceiro.

**Variável principal:** `requestTrackingInput: RequestTrackingInput!`

| Campo de entrada (uso no código) | Significado |
|-----------------------------------|-------------|
| `channel` | Canal (ex. `WEB`) |
| `partner` | Identificador do parceiro SAP / titular na sessão |
| `installation` | Número da instalação |

**Campos retornados (`requestTrackings[]`):**

| Campo | Uso na UI |
|-------|-----------|
| `protocol` | Número do protocolo; chave para detalhes |
| `nameProtocol` | Nome do tipo de serviço (ex. “Segunda via”) |
| `status` | Situação resumida (ex. “Concluído”) |
| `createdDate` / `finishedDate` | Abertura e previsão (formato da API; a UI normaliza para exibição) |
| `description` | Texto descritivo |
| `formatting` | Classe visual de status (ex. `success`, `neutral`) |

`message` e `error` vêm no envelope da operação para mensagens ou erros de negócio.

### `GetRequestTrackingStatus`

**Propósito:** detalhe de um protocolo — timeline (`tabStatus`) e dados de contato/endereço quando disponíveis.

**Variável principal:** `requestTrackingStatusInput: RequestTrackingStatusInput!`

| Campo | Significado |
|-------|-------------|
| `channel` | Canal |
| `protocol` | Protocolo a consultar |

**Destaques em `requestTrackingStatus[]`:**

| Campo | Propósito |
|-------|-----------|
| `tabStatus[]` | Etapas do andamento: `nameService`, `statusStep`, `descriptionStep`, `statusDatetime`, `sequencial`, etc. |
| `email`, `telephone`, `cellphone`, `taxnum`, `address` | Dados cadastrais retornados pela consulta |
| `resultMessage` / `resultCode` | Feedback do sistema |

### `SapAllContracts` (`allContracts`)

**Propósito:** unidades consumidoras / contratos ligados ao `partner` (e filtros opcionais).

**Variáveis:** `partner` (obrigatório), `profileType`, `installation`, `owner`, `zipCode` (opcionais).

**Campos em `contracts[]` (uso na UI):**

| Campo | Propósito |
|-------|-----------|
| `installation`, `contract`, `contractAccount` | Identificadores técnicos |
| `name`, `denomination` | Titular / denominação exibida no cartão |
| `street`, `houseNum`, `postCode`, `city1`, `region`, `complement`, `referencePoint` | Endereço formatado |
| `alert` | Avisos da distribuidora |
| `status` | Situação do contrato |
| `tarifType` | Tipo tarifário |

---

## Operações CMS (`/cms/graphql`)

Executadas por `CmsGraphqlRepository` (sem Bearer SAP).

### `CmsNavbars`

**Propósito:** configuração de navbar por canal (`channelCode`, ex. `WEB`): menus, notificações, botão de login.

### `CmsUnitSelectionPage`

**Propósito:** metadados de página Strapi para fluxo de seleção de unidade (`pageName` padrão `unit-selection-individuals-global`): título, subtítulo, rótulos.

### `CmsConsumerUnitTypes`

**Propósito:** lista de tipos de unidade consumidora (`code`, `name`, `icon`).

### `CmsFooters`

**Propósito:** rodapé por `channelCode` e `profileType` (ex. `GRPB`): menus, links sociais, copyright.

### `CmsLayoutBundle` (recomendado para shell)

**Propósito:** uma única requisição com `navbars`, `footers`, `schedulingConfigs` e `consumerUnitTypes`.

**`schedulingConfigs` (campos usados na UI):**

| Campo | Propósito |
|-------|-----------|
| `isMaintenanceMode` | Banner de manutenção no dashboard |
| `allowUnverifiedUsersCreation`, `hasFacebookEnabled`, etc. | Paridade com app oficial (não todos usados na UI demo) |
| `latestAndroidAppVersion` / `latestIosAppVersion` | Versões de app divulgadas pelo CMS |

### `CmsSchedulingConfigs`

**Propósito:** apenas `schedulingConfigs` (subconjunto do bundle).

---

## API HTTP local (dev)

O `dev-server` expõe JSON REST que por baixo chama essas operações. Consulte `src/dev-server.ts` para rotas como:

- `GET /api/contracts` → `allContracts`
- `GET /api/request-trackings` → `getAllRequestTrackings`
- `GET /api/request-tracking-status?protocol=` → `getRequestTrackingStatus`
- `GET /api/cms/layout` → `CmsLayoutBundle`
- Outras rotas espelham métodos do `CelescClient`

Todas exigem sessão autenticada no servidor de dev, exceto health check e login.
