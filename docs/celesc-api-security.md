# Superfície de API do portal Conecte — o que torna este cliente possível

Este documento descreve **observações técnicas** sobre como o site oficial se comunica com o backend e por que um aplicativo como este consegue reutilizar os mesmos fluxos **com credenciais válidas do usuário**. Não é um guia de exploração: o objetivo é transparência para desenvolvedores, segurança e privacidade.

## Contexto

O portal Conecte é uma **SPA** que fala com APIs JSON no mesmo domínio (`REST` para auth, `GraphQL` para dados). Esse desenho é comum: o browser não é o único cliente teoricamente capaz de chamar essas URLs — qualquer processo HTTPS pode enviar o mesmo formato de requisição.

Este repositório **não contém chaves secretas da Celesc** nem contorna autenticação sem usuário e senha (ou token já emitido após login legítimo). O que ele faz é **replicar contratos HTTP** descobertos a partir do comportamento do site (e documentados aqui e no código).

---

## Fatores que “habilitam” um cliente não-browser

### 1. API alinhada ao front-end (sem API pública separada endurecida)

Os dados de contratos e protocolos chegam pelo mesmo **`POST /graphql`** que o navegador usa. Não há, no escopo deste projeto, um segundo canal exclusivo para parceiros com assinatura de app, mTLS ou device binding que impeça um script de usar o token de sessão normal.

**Implicação:** quem possui um token Bearer válido (após login) pode consultar os mesmos campos que o site, dentro das regras do schema/resolvers no servidor.

### 2. CMS GraphQL acessível sem o Bearer SAP

No código, `CmsGraphqlRepository` envia requisições a **`/cms/graphql` com `sendBearer: false`**, porque o token opaco retornado pelo `/auth/login` provoca **“Invalid token.”** no Strapi quando enviado como Bearer.

Isso indica que o CMS é tratado como camada de **conteúdo/configuração** com regras de autenticação **diferentes** do gateway SAP — em muitos casos, consultas espelham o que um visitante ou sessão mínima já receberia.

**Implicação:** parte do “shell” do aplicativo (textos, menus, flags como `isMaintenanceMode`) é obtida por um endpoint que **não depende do mesmo mecanismo de Bearer** que protege dados contratuais.

### 3. Expectativa de cabeçalhos “tipo browser”

O projeto replica `Origin`, `User-Agent` e opcionalmente `Cookie` (`CELESC_LOGIN_COOKIE`) porque **WAFs, balanceadores e cookies de sessão** às vezes diferenciam clientes “estranhos”. Isso não é bypass de autorização: são **condições de ambiente** para o login e as consultas serem aceitas como no Safari/Chrome.

**Implicação:** a superfície não é apenas “JSON + Bearer”, mas um **perfil de requisição** semelhante ao do site — o que torna viável automatizar o fluxo com as mesmas credenciais.

### 4. Contrato GraphQL estável e previsível

As operações (`allContracts`, `getAllRequestTrackings`, etc.) seguem **nomes e variáveis** estáveis o suficiente para serem copiados em um cliente TypeScript. Isso é característico de APIs consumidas por um front único; não há ofuscação forte do schema para clientes não oficiais.

### 5. Token opaco em memória (não cookies httpOnly exclusivos para todas as chamadas)

O fluxo documentado no código usa **`Authorization: Bearer`** com o valor vindo de `data.authenticate.login.accessToken`. Se o modelo de ameaça da Celesc pressupunha que apenas JavaScript do domínio controlado acessaria esse token, qualquer código com o mesmo token (incluindo este app) tem **paridade de acesso** às operações SAP GraphQL.

---

## O que **não** é afirmado aqui

- Não se afirma que exista **IDOR** genérico (acesso a dados de terceiros sem credenciais).
- Não se afirma **falha de autenticação** no servidor — o login continua sendo necessário.
- O servidor de demo local (`dev-server`) tem seus **próprios riscos** (sessão única em memória, proxy de credenciais); isso é responsabilidade deste repositório, não da Celesc.

---

## Recomendações do ponto de vista de segurança (para provedores)

Medidas que reduziriam abuso e clarificariam o modelo de ameaça (lista conceitual, sem exigência de implementação neste repo):

1. **Documentar API oficial** com termos de uso e limites de taxa.
2. **Device attestation / binding** ou refresh rotativo mais rígido para tokens de consumidor, se o risco de automação não desejada for alto.
3. **Separar** claramente endpoints públicos de CMS e dados sensíveis, com políticas explícitas.
4. **Monitorar** padrões de cliente (`User-Agent`, geo, frequência) e sinais de credential stuffing — independentemente de “vulnerabilidade”, é hardening operacional.

---

## Uso responsável deste repositório

Use apenas com **sua própria conta**, respeitando os termos do portal. Para alterações de contrato, pagamentos e suporte, use sempre os **canais oficiais** da Celesc.
