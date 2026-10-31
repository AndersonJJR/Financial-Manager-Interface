# FinancialManager Interface — Documentação Técnica

Interface web de gerenciamento financeiro pessoal construída com **Angular 22**, **TypeScript**, **HTML5** e **CSS3 puro** (sem uso de TailwindCSS), seguindo o Design System **Obsidian — High-Contrast Dark ("Precision in Darkness")** e integrada integralmente à API REST **FinancialManager** (`Spring Boot 4.1.2` em `/home/anderson/IdeaProjects/Financial-Manager`).

---

## 1. Visão Geral e Stack Tecnológica

| Item | Especificação |
|---|---|
| Framework Frontend | Angular 22 (Standalone Components, Signals, Reactive Forms, Lazy Loading) |
| Linguagens | HTML5, CSS3 Puro (Custom Properties / Variáveis CSS), TypeScript 6.0 |
| Estilização | CSS Puro baseado no `DESIGN.md` (**Obsidian — High-Contrast Dark**), **sem TailwindCSS** |
| Tipografia e Ícones | `Geist`, `Geist Mono` e `Material Symbols Outlined` |
| Integração Backend | API REST `/api/v1` via `HttpClient` e Proxy Reverso (`proxy.conf.json` -> `http://localhost:8080`) |
| Autenticação | JWT Stateless (`Bearer <token>`) com `authInterceptor`, `authGuard` e `guestGuard` |
| Variáveis Sensíveis | Arquivo `.env` na raiz do projeto sincronizado via `scripts/sync-env.mjs` |
| Testes Automatizados | Vitest (`ng test --watch=false`) — 11 suítes / 22 testes passando |

---

## 2. Design System: Obsidian ("Precision in Darkness")

Reproduzido fielmente a partir dos arquivos `DESIGN.md`, `code.html` e `screen.png` localizados nas quatro pastas de referência (`visao_geral`, `lancamentos`, `novo_lancamento` e `contas`):

- **Paleta de Superfícies (Escala Zinc):**
  - `--background` / `--surface-container-lowest`: `#09090b`
  - `--surface`: `#0c0c0f`
  - `--surface-container-low`: `#0f0f12`
  - `--surface-container`: `#121215`
  - `--surface-container-high`: `#18181b`
  - `--surface-container-highest`: `#1e1e22`
  - `--outline-variant`: `#27272a` (separação estrutural de `1px solid #27272a`)
- **Cores Funcionais e de Acento:**
  - `--primary`: `#a78bfa` (Violeta suave para elementos interativos, foco e destaques)
  - `--primary-container`: `#7c3aed`
  - `--tertiary`: `#34d399` (Verde esmeralda para receitas, estados positivos e confirmações)
  - `--error`: `#ef4444` (Vermelho para despesas, alertas e erros de validação)
  - `--amber-400`: `#fbbf24` (Âmbar para lançamentos e contas a pagar pendentes)
- **Tipografia:**
  - Fonte `Geist` com `letter-spacing: -0.02em` em títulos (`.font-headline`) e `Geist Mono` (`.font-mono`) para valores monetários, datas, percentuais e códigos.

---

## 3. Arquitetura de Pastas e Padrões de Qualidade (SOLID & DRY)

```text
src/
├── environments/
│   └── environment.ts                         # Gerado a partir do .env na raiz
├── app/
│   ├── core/                                  # Camada de domínio, segurança e infraestrutura
│   │   ├── config/
│   │   │   ├── app-config.interface.ts        # Contrato de configuração
│   │   │   └── app-config.token.ts            # InjectionToken (DIP - SOLID)
│   │   ├── guards/
│   │   │   ├── auth.guard.ts                  # Proteção de rotas autenticadas
│   │   │   └── guest.guard.ts                 # Redirecionamento de usuários já logados
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts            # Injeção automática de Authorization: Bearer <JWT>
│   │   │   └── error.interceptor.ts           # Tratamento centralizado de ApiErrorResponse
│   │   ├── models/                            # Contratos idênticos aos DTOs Java do backend
│   │   │   ├── api-error.model.ts
│   │   │   ├── auth.model.ts
│   │   │   ├── categoria.model.ts
│   │   │   ├── conta.model.ts
│   │   │   └── transacao.model.ts
│   │   ├── services/                          # Serviços de responsabilidade única (SRP - SOLID)
│   │   │   ├── auth.service.ts
│   │   │   ├── categoria.service.ts
│   │   │   ├── conta.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── periodo.service.ts
│   │   │   ├── storage.service.ts
│   │   │   └── transacao.service.ts
│   │   └── validators/
│   │       └── financial.validators.ts        # Validadores reativos espelhados com o backend
│   ├── shared/                                # Componentes visuais, pipes e utilitários DRY
│   │   ├── components/
│   │   │   ├── header/                        # Barra superior com seletor de competência e perfil
│   │   │   ├── main-layout/                   # Shell principal (Sidebar + Header + RouterOutlet + Toast)
│   │   │   ├── sidebar/                       # Menu lateral fixo Obsidian
│   │   │   └── toast/                         # Notificações flutuantes de feedback
│   │   ├── pipes/
│   │   │   ├── brl-currency.pipe.ts           # Formatação BRL (default, RECEITA, DESPESA, signed, compact)
│   │   │   └── date-br.pipe.ts                # Formatação ISO (YYYY-MM-DD) para DD/MM/YYYY
│   │   └── utils/
│   │       ├── domain-labels.util.ts          # Mapeamento DRY de ícones e rótulos de enums
│   │       └── parcelamento-calculator.util.ts# Cálculo de parcelas, resíduos de centavos e datas
│   └── features/                              # Módulos funcionais carregados sob demanda (Lazy Loading)
│       ├── auth/pages/auth-page/
│       ├── visao-geral/pages/visao-geral-page/
│       ├── lancamentos/pages/lancamentos-page/
│       ├── novo-lancamento/pages/novo-lancamento-page/
│       ├── contas/pages/contas-page/
│       ├── categorias/pages/categorias-page/
│       └── perfil/pages/perfil-page/
```

### Aplicação dos Princípios SOLID e DRY
- **SRP (Single Responsibility Principle):** Cada serviço (`AuthService`, `ContaService`, `CategoriaService`, `TransacaoService`, `PeriodoService`, `StorageService`, `NotificationService`) possui uma única responsabilidade bem definida.
- **OCP (Open/Closed Principle):** Validadores em `FinancialValidators` e pipes (`BrlCurrencyPipe`) são extensíveis por parâmetros e modos sem necessidade de alterar os componentes consumidores.
- **LSP & ISP (Interface Segregation Principle):** Contratos segregados por contexto (`TransacaoRequest`, `DespesaParceladaRequest`, `TransacaoRecorrenteRequest`, `TransacaoFiltro`, `ResumoMensalResponse`).
- **DIP (Dependency Inversion Principle):** Componentes e serviços dependem do token de injeção `APP_CONFIG` em vez de referenciar variáveis globais acopladas.
- **DRY (Don't Repeat Yourself):** Formatação de moedas (`BrlCurrencyPipe`), datas (`DateBrPipe`), metadados de enums (`domain-labels.util.ts`), extração de erros (`error.interceptor.ts`) e cálculo de cronograma de parcelas (`parcelamento-calculator.util.ts`) são centralizados e reutilizados em toda a aplicação.

---

## 4. Variáveis de Ambiente (`.env`)

Todos os dados sensíveis e parâmetros de conexão ficam armazenados no arquivo `.env` na raiz do projeto (ignorado pelo Git via `.gitignore`, com `.env.example` versionado como referência):

```env
API_BASE_URL=/api/v1
BACKEND_TARGET_URL=http://localhost:8080
JWT_STORAGE_KEY=fm_obsidian_jwt_token
USER_STORAGE_KEY=fm_obsidian_user_profile
JWT_ISSUER=financial-manager-api
JWT_SECRET_HINT=IsSlKOtqJoyZspRVl6CWflJ66w6ewIjqwOq38NlWeAS9BMpqy0B5kEZmZYYsrBJL
HTTP_TIMEOUT_MS=15000
DEFAULT_LOCALE=pt-BR
DEFAULT_CURRENCY=BRL
```

O script `scripts/sync-env.mjs` é executado automaticamente nos hooks `prestart`, `prebuild` e `pretest` do `package.json`, gerando `src/environments/environment.ts` e `proxy.conf.json`.

---

## 5. Mapeamento Idêntico de Campos (Frontend ↔ Backend)

Nenhum dado mockado é utilizado nos componentes da aplicação. Todos os campos seguem **exatamente a mesma nomenclatura** dos `record` DTOs e Enums do backend Spring Boot:

| Domínio | DTO / Enum Backend | Campos Mapeados no Frontend |
|---|---|---|
| **Autenticação** | `LoginRequest`, `CadastroUsuarioRequest`, `TokenResponse`, `UsuarioResponse`, `RoleUsuario` | `nome`, `email`, `senha`, `token`, `tipo`, `expiraEm`, `usuario` (`id`, `nome`, `email`, `role`, `ativo`, `criadoEm`) |
| **Contas** | `ContaRequest`, `ContaResponse`, `TipoConta` | `id`, `nome`, `instituicao`, `tipo` (`CONTA_CORRENTE`, `POUPANCA`, `CARTEIRA`, `CORRETORA`, `CARTAO_CREDITO`), `saldoInicial`, `ativa`, `criadoEm`, `atualizadoEm` |
| **Categorias** | `CategoriaRequest`, `CategoriaResponse` | `id`, `nome`, `descricao`, `corHex`, `tipo` (`RECEITA`, `DESPESA`), `ativa`, `criadoEm`, `atualizadoEm` |
| **Transação Única** | `TransacaoRequest`, `TransacaoResponse` | `descricao`, `valor`, `dataCompetencia`, `dataPagamento`, `tipo`, `status` (`PENDENTE`, `EFETIVADA`, `CANCELADA`), `contaId`, `categoriaId`, `observacao` |
| **Compra Parcelada** | `DespesaParceladaRequest`, `ParcelamentoResponse` | `descricao`, `valorInformado`, `modoValor` (`VALOR_TOTAL`, `VALOR_PARCELA`), `totalParcelas`, `periodicidade`, `dataPrimeiraParcela`, `primeiraParcelaPaga`, `contaId`, `categoriaId`, `observacao` |
| **Recorrente** | `TransacaoRecorrenteRequest`, `ParcelamentoResponse` | `descricao`, `valor`, `tipo`, `periodicidade`, `dataInicio`, `quantidadeOcorrencias`, `primeiraOcorrenciaEfetivada`, `contaId`, `categoriaId`, `observacao` |
| **Resumo Mensal** | `ResumoMensalResponse`, `GastoPorCategoriaDto` | `ano`, `mes`, `totalEntradasRealizadas`, `totalEntradasPrevistas`, `totalSaidasPagas`, `totalSaidasPrevistas`, `totalSaidasConsolidado`, `saldoLiquidoRealizado`, `saldoLiquidoPrevisto`, `gastosPorCategoria` (`categoriaId`, `categoriaNome`, `corHex`, `valorNominal`, `percentual`, `quantidadeTransacoes`) |
| **Erros da API** | `ApiErrorResponse`, `ErroValidacaoCampo` | `type`, `title`, `status`, `detail`, `instance`, `timestamp`, `errors` (`campo`, `mensagem`) |

---

## 6. Validações Simétricas (Front-end e Back-end)

As regras de validação de Bean Validation e os validadores de domínio do backend (`ValidadorTransacao` e `ValidadorDespesaParcelada`) foram espelhados no frontend em `FinancialValidators` e nos formulários reativos:

1. **Conta (`ContaRequest`):** `nome` obrigatório entre 2 e 100 caracteres; `instituicao` até 100 caracteres; `tipo` obrigatório.
2. **Categoria (`CategoriaRequest`):** `nome` obrigatório entre 2 e 100 caracteres; `descricao` até 250 caracteres; `corHex` validado pela regex `^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`; `tipo` obrigatório (`RECEITA` ou `DESPESA`).
3. **Compatibilidade Categoria × Tipo (`ValidadorCompatibilidadeTipoCategoria`):** Nos formulários de lançamento e edição, o seletor de categorias exibe apenas categorias ativas cujo `tipo` coincide com o `TipoTransacao` selecionado (e no modo `PARCELADA` força `DESPESA`, conforme regra da API).
4. **Status de Conta e Categoria (`ValidadorPropriedadeEStatusContaCategoria`):** Apenas contas e categorias com `ativa = true` podem receber novos lançamentos.
5. **Valor Mínimo de Parcelamento (`ValidadorValorMinimoParcelamento`):** Exige entre 2 e 240 parcelas e verifica se o valor resultante de cada parcela é de no mínimo `R$ 0,01` (absorvendo resíduos de centavos na 1ª parcela quando `modoValor = VALOR_TOTAL`).
6. **Consistência de Pagamento (`ValidadorConsistenciaStatusPagamento`):** Impede que lançamentos com status `CANCELADA` possuam `dataPagamento` preenchida.

---

## 7. Telas Reproduzidas e Funcionalidades

1. **Visão Geral (`/visao-geral` — `todo/visao_geral`):**
   - Barra de navegação mensal (`Mês anterior` / `Próximo mês`) sincronizada globalmente via `PeriodoService`.
   - 4 cartões consolidados (`Receitas`, `Despesas`, `Saldo Realizado`, `Saldo Projetado`) alimentados por `GET /api/v1/transacoes/resumo-mensal`.
   - Gráfico Donut SVG dinâmico e barra de concentração orçamentária por categoria (`gastosPorCategoria`).
   - Lista dos últimos lançamentos do mês (`GET /api/v1/transacoes`) e botão de exportação rápida de extrato (`GET /api/v1/transacoes/exportar`).
2. **Lançamentos (`/lancamentos` — `todo/lancamentos`):**
   - Cartões de métricas filtradas (`Receitas Filtradas`, `Despesas Filtradas`, `Saldo do Período`, `Contas a Pagar Pendentes`).
   - Barra de **Filtros Estruturados** (`Competência`, `Tipo`, `Status`, `Conta / Cartão`, `Categoria`) e botão `Limpar filtros`.
   - Tabela de transações com badges de status, modalidade, conta, categoria e ações rápidas:
     - **Efetivar (`PATCH /api/v1/transacoes/{id}/efetivar`)** através do modal interativo com seleção da data de pagamento.
     - **Ver grupo (`GET /api/v1/transacoes/grupos/{grupoId}`)** e cancelamento em lote de parcelas futuras pendentes (`DELETE /api/v1/transacoes/grupos/{grupoId}/pendentes`).
     - **Detalhes / Editar (`PUT /api/v1/transacoes/{id}`)** e **Excluir (`DELETE /api/v1/transacoes/{id}`)**.
   - Menu dropdown para exportar extrato em `.csv` ou `.json`.
3. **Novo Lançamento (`/novo-lancamento` — `todo/novo_lancamento`):**
   - Seletor de modalidade (`Única`, `Parcelada`, `Recorrente`) integrado a `POST /transacoes`, `POST /transacoes/parceladas` e `POST /transacoes/recorrentes`.
   - Painel lateral sticky **Prévia do Parcelamento** com cálculo em tempo real do total consolidado, barra de progresso paga vs. a vencer, absorção de resíduos de centavos na 1ª parcela e cronograma de vencimentos.
4. **Contas (`/contas` — `todo/contas`):**
   - Banner arquitetural sobre apuração de saldo, filtros por chip (`Todas as contas`, `Ativas`, `Inativas`) e indicador de `Base inicial consolidada`.
   - Grid de cartões de contas ativas e inativas (com aviso de bloqueio de novos lançamentos em contas inativas).
   - Modal de criação/edição (`POST /api/v1/contas`, `PUT /api/v1/contas/{id}`), inativação lógica (`DELETE /api/v1/contas/{id}`) e reativação (`PUT /api/v1/contas/{id}` com `ativa: true`).
   - Card educativo inferior com fluxograma de apuração do Saldo Real.

---

## 8. Como Executar e Testar

```bash
# 1. Sincronizar variáveis do arquivo .env e iniciar o servidor de desenvolvimento (http://localhost:4200)
npm start

# 2. Gerar build de produção otimizado
npm run build

# 3. Executar suíte de testes unitários e de integração (Vitest)
npx ng test --watch=false
```
