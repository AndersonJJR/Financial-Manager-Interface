# Notas do Autor

Este é um projeto Java com Spring Boot, para fins de Estudo.
Por meio deste projeto pude testar, aprimorar e rever alguns conceitos conhecidos.

## Como conduzi esse projeto?

Primeiramente separei as minhas responsabilidades e as responsabilidades da IA.

### O que foram as minhas responsabilidades?

- Pensar o que seria o sistema criado.
- Realizar a coleta de requisitos deste sistema, o que ele deveria cumprir.
- Seguindo a modelagem de software, separar entre requisitos funcionais e não funcionais.
- Detalhar para a IA em seu processo operacional de geração de código, que deva seguir padrões de qualidade de software e arquitetura de pastas. Como testes, DRY (Don't repeat yourself) e SOLID.
- Após a geração, realizar uma verificação rápida no código gerado.
- Acompanhar variáveis de ambiente e não deixar chaves sensíveis expostas.
- Realizar testes de interface, validando se tudo está atuando conforme requisitado, tanto as funcionalidades básicas quanto as regras de negócio.

### O que ficou responsável pela IA?

Gerar código, corrigir seus bugs e documentar tanto as funcionalidades quanto os bugs. Os bugs servem para entender o erro e evitá-lo em aplicações futuras.

## Ferramentas de IA que utilizei nesse projeto

- **Orca** → Uma ADE (Agent Development Enviroment), no qual auxilia na orquestração de múltiplas IAs.
- **Antigravity CLI** → Devido a ter o plano PRO para estudantes, possuo uma gama maior de ferramentas de IA e modelos. Mas consome tokens que só serão atualizados semanalmente.
- **Opencode CLI** → A fim de economizar nos tokens, separei tarefas muitos simples para os modelos chineses de IA, como DeepSeek 4.1 Flash Free e GLM 5.3 Free. Ambos modelos gratuitos, mas com contexto máximo de 200k tokens no momento que realizei esse código.
- **Google Stitch** → Ferramenta do ecossistema da Google para design de interfaces, podendo exportar para o Figma. Gosto bastante dessa ferramenta para design.

## Meu fluxo de trabalho

1. Realizar a modelagem deste sistema
2. Gerar um back-end com atributos sólidos e de qualidade
3. Validar
4. Gerar as telas no Stitch
5. Importar os arquivos das telas no código
6. Gerar e implementar as telas e suas funcionalidades, seguindo o back-end como base
7. Testes e Validações
8. Correções e Finalização da documentação
9. Gerar o dockerfile dos projetos e o docker-compose
10. Testes finais
11. Fim

## Notas finais

Com o passar do tempo pude me abrir mais com a IA e deixa-la tomar mais espaço como ferramenta operacional, enquanto pude me dedicar mais à parte de arquitetura e estudo. Mas para isso solidifiquei minha base, fiz muitos projetos que ficaram inacabados, repetição e compreensão de código para que possa entender o fluxo de desenvolvimento dela, isso em questões de Java com Spring Boot.

---

# FinancialManager Interface

Interface web de gerenciamento financeiro pessoal de alta precisão construída com **Angular 22**, desenvolvida para consumir a API REST **FinancialManager** (Spring Boot 4.1.2). O projeto foi concebido seguindo o Design System **Obsidian — High-Contrast Dark ("Precision in Darkness")**, com foco em usabilidade semântica, desempenho e conformidade integral com regras de negócios bancárias e contábeis.

<div align="center">

![Status](https://img.shields.io/badge/Status-Concluído-34d399?style=for-the-badge&logo=checkmarx&logoColor=white)
![Finalidade](https://img.shields.io/badge/Finalidade-Estudo-a78bfa?style=for-the-badge&logo=gitbook&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-22.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3_Puro-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

</div>

---

## 🎯 Funcionalidades Principais

A interface concentra todo o ciclo de vida da gestão financeira pessoal, conectada diretamente à API REST sem dados mockados:

### 1. 📊 Visão Geral e Dashboard Analítico (`/visao-geral`)
- **Métricas Consolidadas em Tempo Real:** 4 cartões com acompanhamento comparativo entre Receitas Realizadas vs. Previstas, Despesas Pagas vs. Previstas, Saldo Realizado e Saldo Projetado.
- **Gráfico Donut SVG Dinâmico:** Visualização trigonométrica da divisão orçamentária de gastos por categoria (`gastosPorCategoria`).
- **Navegação Temporal Centralizada:** Seletor de competência global sincronizado reativamente com `PeriodoService` (`Mês anterior` / `Próximo mês`).
- **Extrato Rápido:** Tabela resumida das transações mais recentes do mês com link para exportação instantânea.

### 2. 💸 Central de Lançamentos com Filtros Estruturados (`/lancamentos`)
- **Filtros Preservados:** Filtragem em tempo real por intervalo personalizado de datas (Data Inicial e Data Final com isolamento reativo via `untracked()`), Tipo (`Receita`/`Despesa`), Status (`Efetivada`/`Pendente`/`Cancelada`), Conta/Cartão e Categoria.
- **Ações Operacionais Rápidas:**
  - **Efetivação de Pagamentos:** Modal dinâmico para seleção da data de liquidação (`PATCH /api/v1/transacoes/{id}/efetivar`).
  - **Gestão de Grupos e Parcelamentos:** Visualização de todas as parcelas vinculadas e cancelamento em lote das parcelas futuras pendentes (`DELETE /api/v1/transacoes/grupos/{grupoId}/pendentes`).
  - **Edição e Exclusão:** Atualização completa (`PUT`) e remoção segura (`DELETE`).
- **Exportação de Dados:** Download de extratos filtrados nos formatos `.csv` e `.json`.

### 3. ➕ Lançamentos Multi-modalidade (`/novo-lancamento`)
- **Modos Suportados:**
  - **Única:** Receitas ou despesas pontuais.
  - **Parcelada:** Exclusiva para despesas, com opção de cálculo por `Valor Total` ou `Valor por Parcela`, número de parcelas (2 a 240) e opção de 1ª parcela já quitada.
  - **Recorrente:** Transações fixas periódicas (mensal, semanal, etc.) com definição do número de ocorrências.
- **Painel Lateral Sticky de Prévia:**
  - Cálculo instantâneo do montante consolidado e barra de progresso visual de valores pagos vs. pendentes.
  - Cronograma antecipado de vencimentos com **absorção de resíduos de centavos** na 1ª parcela para divisões com dízima.
- **Compatibilidade Dinâmica:** Ajuste automático e re-registro de validadores de parcelas ao alternar entre modalidades, eliminando erros silenciosos.

### 4. 🏦 Gestão de Contas e Cartões (`/contas`)
- **Multi-tipo de Ativos:** Cadastro e administração de contas bancárias, contas poupança, carteiras físicas, corretoras de investimento e cartões de crédito (`CONTA_CORRENTE`, `POUPANCA`, `CARTEIRA`, `CORRETORA`, `CARTAO_CREDITO`).
- **Cálculo do Saldo Real:**
  $$\text{Saldo Real} = \text{Saldo Inicial} + \sum \text{Receitas Efetivadas} - \sum \text{Despesas Pagas}$$
- **Controle de Ativação:** Filtros por chips (`Todas`, `Ativas`, `Inativas`) com soma da base inicial consolidada e bloqueio operacional de novos lançamentos para contas desativadas.
- **Modal de CRUD:** Criação, edição in-place, inativação lógica e reativação.

### 5. 🏷️ Classificação Orçamentária por Categorias (`/categorias`)
- **Mapeamento Estrito de Domínio:** Categorias vinculadas obrigatoriamente ao tipo (`RECEITA` ou `DESPESA`), impedindo lançamentos de despesas em categorias de receitas e vice-versa.
- **Paleta de Cores Hexadecimais:** Integração bidirecional entre seletor de cor nativo (`<input type="color">`) e campo de texto formatado (`#RRGGBB`).
- **Filtros e Contadores Reativos:** Navegação por chips com contagem dinâmica calculada via signals: `Todas`, `Despesas` e `Receitas`.
- **Inativação e Reativação:** Controle de disponibilidade sem perda do histórico de transações.

### 6. 🔐 Autenticação Segura e Gestão de Perfil (`/login`, `/cadastro`, `/perfil`)
- **Telas Dedicadas de Onboarding e Login:**
  - Login com validação reativa e alternância de visibilidade de senha.
  - Cadastro com validação em tempo real de critérios de senha (`Mínimo 6 caracteres` e conferência de confirmação de senha).
- **Proteção do JWT:** `authInterceptor` que restringe o anexo do token `Bearer` exclusivamente a requisições internas, com auto-logout em caso de HTTP 401.
- **Tela de Perfil:**
  - Painel de credenciais, papel de autorização (`ROLE_USER` / `ROLE_ADMIN`) e status de sessão.
  - Edição in-place do Nome Completo com validação de 2 a 120 caracteres integrada ao backend (`PUT /api/v1/auth/me`).
  - Sincronização reativa de perfil, contas e categorias via `forkJoin`.

---

## 🎨 Design System: Obsidian ("Precision in Darkness")

- **CSS3 Puro:** Construído sem utilitários externos (como TailwindCSS), empregando variáveis CSS nativas (`var(--...)`) e semântica pura.
- **Paleta Zinc de Alto Contraste:** Do preto profundo (`#09090b`) a superfícies de elevação com bordas ultrafinas (`1px solid #27272a`).
- **Acentos Semânticos:** `#34d399` (Verde para receitas e saldos positivos), `#ef4444` (Vermelho para despesas e alertas), `#a78bfa` (Violeta para foco e ações) e `#fbbf24` (Âmbar para pendências).
- **Tipografia:** `Geist` com tracking negativo para cabeçalhos e `Geist Mono` para tabelas, moedas e datas.

---

## 🧪 Qualidade de Código e Testes Automatizados

O projeto conta com suíte completa de testes unitários e de integração utilizando **Vitest**:

- **14 arquivos de suíte** de testes.
- **44 testes automatizados** aprovados cobrindo serviços, interceptors, formulários reativos, validadores customizados, utilitários de parcelamento e componentes de página.
- Princípios **SOLID** e **DRY** aplicados em toda a estrutura de injeção de dependência e reutilização de regras.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 22 ou superior)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (opcional, para ambiente containerizado)

### 1. Executando Localmente

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento com proxy para a API
npm start
```
A aplicação estará disponível em `http://localhost:4200`.

### 2. Executando os Testes Automatizados

```bash
# Executar a suíte de testes Vitest
npm test

# Ou diretamente pelo CLI do Angular
npx ng test --watch=false
```

### 3. Compilando para Produção

```bash
npm run build
```
Os arquivos otimizados serão gerados em `dist/Financial-Manager-Interface/browser`.

### 4. Executando com Docker Compose (Ecossistema Completo)

O projeto possui orquestração pronta unindo o banco de dados MySQL 8.4, o backend Spring Boot e a interface Angular com Nginx:

```bash
# Iniciar todos os containers
docker compose up -d --build
```
A interface será servida na porta `80` (`http://localhost`).

---

## 👨‍💻 Autor

<div align="center">

<img src="https://avatars.githubusercontent.com/u/206952189?v=4" width="120px" height="120px" style="border-radius: 50%; border: 2px solid #a78bfa;" alt="Anderson Chaves Júnior"/>

**Anderson Chaves Júnior**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Anderson%20Chaves-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andersonchavesjunior/)

</div>
