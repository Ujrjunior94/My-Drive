# DOCUMENTO DE REQUISITOS DO PRODUTO (PRD) & ARQUITETURA TÉCNICA
## PROJETO: DRIVEPILOT AI — COCKPIT DE TELEMETRIA INTELIGENTE
**Código de Referência:** PRD-DRIVEPILOT-V1.0  
**Versão:** 1.0  
**Status:** APROVADO PARA DESENVOLVIMENTO  
**Autor:** AI Coding Agent (Google DeepMind / Antigravity Engine)  
**Público-Alvo:** Engenheiros de Software, Product Designers, Analistas de QA e IAs Autônomas de Geração de Código.

---

## 1. VISÃO GERAL, PRODUTO & PROPÓSITO

### 1.1. Introdução e Contexto de Mercado
No ecossistema de transporte sob demanda (ride-hailing), motoristas parceiros de aplicativos como Uber, 99, Lalamove, inDrive e frotas particulares operam como pequenas empresas individuais. No entanto, mais de 80% desses profissionais sofrem com a **falta de clareza financeira**, confundindo faturamento bruto com lucro real. Custos invisíveis como a depreciação do veículo, despesas com combustível flutuante, pedágios ocultos, alimentação fora de casa e a falta de manutenção preventiva (que causa quebras catastróficas e períodos sem trabalhar) corroem silenciosamente as margens operacionais do piloto.

O **DrivePilot AI** nasce como a resposta definitiva para esse mercado. É um cockpit digital de bordo, projetado especificamente para rodar no painel do carro do motorista. Ele transforma dados brutos de odômetro e faturamento em relatórios analíticos de altíssima precisão financeira e mecânica, atuando como o co-piloto financeiro definitivo alimentado por Inteligência Artificial (Google Gemini).

### 1.2. Proposta de Valor e Diferenciais
*   **Margem Real de Bolso:** Dedução em tempo real de cada centavo de custo operacional (combustível, pedágios, alimentação, depreciação acumulada por KM).
*   **Estética Automotiva de Luxo:** Interface inspirada nos consoles digitais dos supercarros esportivos mais modernos (Tesla, Porsche, Corvette), promovendo uma sensação de controle, performance e prestígio.
*   **IA de Bordo Ativa:** Diagnósticos baseados em telemetria real. O motorista conversa com o veículo, descobrindo qual plataforma paga melhor por quilômetro e qual o horário de maior rentabilidade.
*   **HUD de Oficina Preventiva:** Alertas visuais ativos que preveem o desgaste de componentes antes da falha mecânica.

---

## 2. ESTUDO DE PERSONAS & JORNADAS DO USUÁRIO

### 2.1. Personas Detalhadas

#### Persona A: Carlos "O Maratonista" (52 anos)
*   **Perfil:** Motorista de aplicativo em tempo integral há 6 anos. Dirige entre 10 e 12 horas por dia, 6 dias por semana.
*   **Necessidades:** Precisa maximizar seu faturamento diário para pagar as contas da casa e a parcela do financiamento do carro (Chevrolet Onix Flex).
*   **Dores:** Não sabe de cabeça quanto gasta de combustível ou se vale mais a pena rodar na Uber ou na 99 em determinados dias da semana. Tem pavor de ter que parar o carro repentinamente na oficina por falta de manutenção.
*   **Como o DrivePilot AI o ajuda:** Oferece um formulário de entrada ultra-rápido para preenchimento em 30 segundos no final do dia, calcula instantaneamente se ele atingiu sua meta diária de faturamento líquido e envia alertas de troca de óleo baseados no odômetro de bordo.

#### Persona B: Sandra "A Estrategista" (34 anos)
*   **Perfil:** Motorista de tempo parcial (trabalha de 4 a 6 horas por dia, focada nos horários de pico e fins de semana). Dirige um carro alugado (Hyundai HB20).
*   **Necessidades:** Otimizar cada quilômetro rodado. Quer o maior lucro líquido possível por hora ativa trabalhada para conciliar a atividade com os cuidados da família.
*   **Dores:** Detesta gastar tempo rodando vazia procurando passageiros. Precisa calcular se o custo do aluguel diário e do combustível compensa as horas em que trabalha.
*   **Como o DrivePilot AI a ajuda:** O painel "Advisor" da IA analisa seus dias históricos de trabalho e recomenda as melhores faixas de horário e quais aplicativos trazem o melhor faturamento por KM rodado na sua região de operação.

#### Persona C: Renato "O Administrador de Frota" (41 anos)
*   **Perfil:** Investidor que possui 3 veículos populares que aluga para outros motoristas de aplicativo.
*   **Necessidades:** Monitorar a quilometragem rodada real e assegurar que as manutenções preventivas (troca de correias, pneus, pastilhas e lubrificantes) estão sendo feitas rigorosamente em dia pelos inquilinos.
*   **Dores:** Motoristas parceiros esquecem de verificar o óleo e a água, resultando em motores fundidos e milhares de reais em prejuízos.
*   **Como o DrivePilot AI o ajuda:** Central de manutenções em tempo real com indicador visual pulsante que exibe a proximidade mecânica de revisões cruciais, permitindo auditar o uso correto do veículo.

### 2.2. Jornadas Detalhadas de Uso

#### Jornada 1: Entrada em Serviço (Início do Turno)
1.  O motorista entra no veículo no início da manhã, abre o aplicativo e visualiza seu cockpit escuro que inicia instantaneamente sem focar os olhos devido ao design amigável de alto contraste.
2.  Ele clica no botão proeminente "Iniciar Turno (Start Engine)".
3.  Preenche rapidamente o odômetro inicial exibido na tela (o sistema traz pré-preenchido o último odômetro final da jornada anterior para economizar digitação) e o nível de combustível atual do veículo (usando controles deslizantes responsivos e táteis).
4.  Clica em "Confirmar Partida". O DrivePilot AI inicia o registro do cronômetro de horas ativas em segundo plano.

#### Jornada 2: O Fechamento do Diário de Bordo (Fim do Turno)
1.  Ao final do dia de trabalho, o motorista para o veículo em um local seguro e clica em "Finalizar Turno".
2.  Ele insere o odômetro final (o sistema valida se é maior que o inicial) e o nível de combustível restante.
3.  Insere os ganhos agregados das plataformas (Uber: R$ 350,00; 99: R$ 120,00; Outros: R$ 40,00).
4.  Lança as despesas extras do turno (Alimentação: R$ 25,00; Pedágios: R$ 12,00).
5.  O DrivePilot AI calcula instantaneamente a quilometragem total percorrida, o rendimento financeiro por KM, faturamento por hora de voo e o lucro líquido real após todas as deduções de custo físico do carro.
6.  O dia no Calendário de Desempenho muda de cor para **Verde Brilhante** se a meta foi superada, oferecendo reforço psicológico positivo imediato.

#### Jornada 3: Consulta ao Co-Piloto IA (Advisor)
1.  Durante uma pausa para o café, o motorista abre o painel do "Advisor IA".
2.  O sistema apresenta carregando um **Skeleton Animado** imitando leitura de telemetria para dar feedback imediato.
3.  O motorista clica em uma pergunta recomendada: *"Como foi minha eficiência financeira de combustível esta semana?"*.
4.  O backend Express captura os dados históricos de abastecimentos e jornadas de forma anônima, envia ao Gemini 3.5 Flash e retorna um diagnóstico exato, com tabelas de consumo e orientações mecânicas profissionais em menos de 2 segundos.

---

## 3. ARQUITETURA COMPLETA DO SISTEMA (ETAPA 1)

O DrivePilot AI é projetado sob uma arquitetura de microsserviços integrados de alta resiliência, utilizando o princípio do desacoplamento de responsabilidades e foco em tempo de resposta em tempo real.

```
+----------------------------------------------------------------------------------+
|                               FRONTEND (VITE + REACT)                            |
|  - Camada de UI tátil de alto impacto, responsiva, tema "Elegant Dark".           |
|  - Skeletons de carregamento baseados em Framer Motion para feedback visual.       |
|  - Estado em memória reativo e sincronização robusta offline-first (IndexedDB).   |
+----------------------------------------+-----------------------------------------+
                                         |
                            (Firebase Auth & Firestore Sync)
                                         |
                                         v
+----------------------------------------------------------------------------------+
|                            BANCO DE DADOS & IDENTIDADE                           |
|  - Firebase Auth: Gerenciamento seguro de sessões, login, registro e demo.       |
|  - Cloud Firestore: NoSQL orientado a documentos estruturados, isolado por UID.   |
|  - Firestore Security Rules: Proteção horizontal de acesso a nível de usuário.    |
+----------------------------------------+-----------------------------------------+
                                         |
                             (Proxy de Rede via Express)
                                         |
                                         v
+----------------------------------------------------------------------------------+
|                              BACKEND CORE (EXPRESS API)                          |
|  - Porta de Entrada Segura na porta 3000.                                         |
|  - Roteamento analítico e computação matemática de métricas de frota.             |
|  - Proteção de secrets e chaves privadas de barramento.                         |
+----------------------------------------+-----------------------------------------+
                                         |
                            (Google GenAI TypeScript SDK)
                                         |
                                         v
+----------------------------------------------------------------------------------+
|                              INTELIGÊNCIA ARTIFICIAL                             |
|  - Google Gemini 3.5 Flash: Geração ultrarrápida de insights em tempo real.      |
|  - Engenharia de Prompts Automotiva estruturada para diagnósticos exatos.        |
+----------------------------------------------------------------------------------+
```

### 3.1. Estrutura de Pastas de Referência (Folders)
Abaixo está definida a estrutura física de arquivos do repositório para garantir modularidade extrema:

```text
/
├── .env.example                 # Declaração padronizada de chaves secretas
├── .gitignore                   # Ignora dependências e builds locais
├── ARCHITECTURE.md              # Documentação técnica rápida de engenharia
├── DOCUMENTATION.md             # ESTE DOCUMENTO (Fonte Única da Verdade / PRD)
├── index.html                   # Casca HTML5 de ancoragem
├── metadata.json                # Metadados de empacotamento da applet
├── package.json                 # Manifesto de dependências e scripts de automação
├── server.ts                    # Backend Express Core com integração Vite Middleware
├── tsconfig.json                # Configuração do compilador TypeScript
├── vite.config.ts               # Bundler e pipelines de compilação do front
└── src/
    ├── main.tsx                 # Entrada de compilação do React
    ├── index.css                # Estilos globais (Tailwind CSS v4 integrado)
    ├── types.ts                 # Contratos de tipos de dados estruturados e enums
    ├── App.tsx                  # Controller e orquestrador principal de views
    ├── components/
    │   ├── Dashboard.tsx        # Módulo 2: Painel Instrument Cluster (Cockpit)
    │   ├── CalendarView.tsx     # Módulo 3: Calendário Mensal e logs diários
    │   ├── JourneyForm.tsx      # Módulo 4: Entrada física de jornadas
    │   ├── RefuelsView.tsx      # Módulo 5: Registro de combustível e autonomia
    │   ├── MaintenancesView.tsx # Módulo 6: Alertas preventivos de oficina
    │   └── AdvisorPanel.tsx     # Módulo 7: Chat de bordo e consultor IA (Gemini)
    └── lib/
        └── firebase.ts          # Driver de inicialização e conexões do Firebase
```

### 3.2. Arquitetura do Frontend (Client-Side)
O frontend opera como uma **Single Page Application (SPA)** de altíssima performance, desenvolvida em **React 18** e empacotada pelo **Vite**. 
*   **Gestão de Estado:** Utiliza hooks nativos do React (`useState`, `useContext`, `useMemo`) combinados com carregamento assíncrono controlado.
*   **Feedback Visual Ativo (Skeletons):** Todas as transições de carregamento de dados utilizam componentes de esqueleto cinza escovado (`bg-neutral-800/70`) animados por pulsações suaves do **Framer Motion (`motion.div`)**. Isso elimina telas piscando ou "flashing", mantendo a percepção de uma aplicação nativa e responsiva de alto nível.
*   **Renderização de Gráficos:** Implementada via biblioteca matemática **Recharts**, desenhando áreas e barras vetorizadas dinâmicas e responsivas.
*   **Design System:** Construído puramente sobre o motor do **Tailwind CSS**, eliminando excessos de scripts CSS adicionais e otimizando a legibilidade e o tempo de renderização no navegador do motorista.

### 3.3. Arquitetura do Backend (Server-Side)
O servidor Express (`server.ts`) atua de forma dupla:
1.  **Modo de Desenvolvimento:** Monta o middleware do Vite para transpilação e hot-reload sob demanda da aplicação React diretamente na porta `3000`.
2.  **Modo de Produção:** Serve os ativos estáticos otimizados compilados na pasta `/dist` e expõe a rota REST de análise analítica.
3.  **Segurança das Credenciais:** Gerencia com exclusividade a inicialização e comunicação com a SDK do Google Gemini (`@google/genai`). A chave secreta do modelo (`process.env.GEMINI_API_KEY`) nunca é trafegada ou exposta na internet para garantir imunidade absoluta contra roubos de dados e abusos de cota da API.

### 3.4. Sistema de Autenticação & Modo de Demonstração
A identidade do piloto é gerenciada de duas formas transparentes:
1.  **Autenticação Oficial (Firebase Auth):** Login com e-mail e senha criptografados diretamente na nuvem. Sessões persistidas de forma segura em cookies locais/localStorage do navegador, evitando novas telas de login a cada abertura de aba.
2.  **Modo de Demonstração (Demo Mode):** Um botão de escape rápido na tela de login que permite ao usuário entrar instantaneamente em um perfil fictício carregado localmente em memória. O sistema popula o banco local com um histórico de 15 jornadas, 5 abastecimentos e 3 manutenções pré-calculadas e realistas. Isso permite que novos motoristas compreendam o real poder da telemetria e das análises da IA antes de criar sua conta corporativa.

---

## 4. MODELAGEM EXAUSTIVA DO BANCO DE DADOS (ETAPA 2)

O banco de dados NoSQL do Cloud Firestore é estruturado sob o conceito de **Isolamento de Tenant**. Cada usuário cadastrado possui documentos e subcoleções sob o seu próprio identificador único (`userId`), garantindo segurança cibernética total.

### 4.1. Coleção Principal: `users`
Armazena a ficha cadastral e as configurações financeiras do piloto.
*   **Caminho do Documento:** `/users/{userId}`

```typescript
interface UserProfile {
  uid: string;                 // Chave primária de autenticação do Firebase
  email: string;               // E-mail corporativo cadastrado
  displayName: string;         // Nome ou apelido do piloto
  createdAt: any;              // Timestamp de criação da conta de bordo
  settings: {
    vehicleModel: string;      // Modelo exato do carro (ex: "Toyota Prius 1.8")
    fuelType: string;          // Combustível predominante (Flex, Gasolina, Etanol, GNV, Elétrico)
    targetDailyProfit: number; // Meta financeira líquida de faturamento diário
    currency: string;          // Moeda do cockpit (padrão: "BRL")
    currentOdometer: number;   // Última quilometragem conhecida pelo carro
  };
  subscription?: {             // Estrutura reservada para futuras expansões pagas
    plan: "free" | "premium";  // Nível da conta
    status: "active" | "canceled" | "past_due";
    expiresAt: string;         // Data de expiração
  };
}
```

### 4.2. Coleção de Apoio: `journeys`
Armazena todos os diários de bordo e fechamentos de turno.
*   **Caminho do Documento:** `/users/{userId}/journeys/{journeyId}`

```typescript
interface Journey {
  id: string;                  // ID único gerado pelo Firestore ou prefixo "demo_*"
  date: string;                // Data do turno trabalhado (Formato: YYYY-MM-DD)
  startKm: number;             // Registro do odômetro ao ligar o veículo
  endKm: number;               // Registro do odômetro ao finalizar o turno
  totalKm: number;             // Distância percorrida real (endKm - startKm)
  totalHours: number;          // Horas totais trabalhadas ativamente
  startFuelLevel: number;      // Nível do tanque inicial em porcentagem (0 - 100)
  endFuelLevel: number;        // Nível do tanque final em porcentagem (0 - 100)
  earnings: {
    uber: number;              // Ganhos brutos na plataforma Uber
    99: number;                // Ganhos brutos na plataforma 99 App
    others: number;            // Outros faturamentos (entregas, particular, inDrive)
  };
  expenses: {
    fuel: number;              // Gastos de abastecimento efetuados durante o dia
    tolls: number;             // Custos de pedágios enfrentados na rota
    others: number;            // Custos de alimentação, lavagem do carro, etc.
  };
  metrics: {
    grossEarnings: number;     // Faturamento bruto total somado (Uber + 99 + Others)
    totalExpenses: number;     // Custos somados (Fuel + Tolls + Others)
    netProfit: number;         // Lucro limpo real (grossEarnings - totalExpenses)
    profitPerHour: number;     // Rendimento por hora online (netProfit / totalHours)
    profitPerKm: number;       // Margem de faturamento por quilômetro (netProfit / totalKm)
    costPerKm: number;         // Custo financeiro real por quilômetro (totalExpenses / totalKm)
  };
  notes?: string;              // Observações do turno escritas pelo piloto
  createdAt: any;              // Data e hora de gravação no banco de dados
}
```

### 4.3. Coleção de Abastecimentos: `refuels`
Usada para calcular o consumo real médio e o preço ponderado por litro de combustível.
*   **Caminho do Documento:** `/users/{userId}/refuels/{refuelId}`

```typescript
interface Refuel {
  id: string;                  // Identificador único do abastecimento
  date: string;                // Data do evento de abastecimento (YYYY-MM-DD)
  value: number;               // Valor total pago na bomba em moeda corrente
  liters: number;              // Volume real de combustível carregado no tanque
  pricePerLiter: number;       // Valor por litro (Calculado automaticamente: value / liters)
  stationName?: string;        // Bandeira ou nome do posto de gasolina
  odometer: number;            // Odômetro do veículo no ato do abastecimento
  fuelType: string;            // Tipo de combustível abastecido (Etanol, Gasolina, GNV)
  createdAt: any;              // Data de registro
}
```

### 4.4. Coleção de Manutenções: `maintenances`
Lista todas as intervenções preventivas e corretivas efetuadas no carro para previsão de durabilidade e HUD de alertas ativos.
*   **Caminho do Documento:** `/users/{userId}/maintenances/{maintenanceId}`

```typescript
interface Maintenance {
  id: string;                  // Identificador exclusivo do serviço de oficina
  date: string;                // Data em que o carro esteve na oficina (YYYY-MM-DD)
  type: string;                // Tipo de intervenção efetuada (Troca de Óleo, Freios, Amortecedores, Pneus, etc.)
  odometer: number;            // Odômetro do carro no ato do serviço
  cost: number;                // Custo pago pela peça e mão de obra
  nextOdometerCheck: number;   // Próxima quilometragem recomendada para nova revisão
  notes?: string;              // Comentários ou marca das peças utilizadas
  createdAt: any;              // Timestamp de gravação do checkup
}
```

---

## 5. REGRAS DE NEGÓCIO E FÓRMULAS MATEMÁTICAS INTEGRADAS

Para garantir a precisão de telemetria automotiva e auditoria contábil exigida pelo PRD, o sistema obedece a regras de validação rígidas e equações físicas:

### 5.1. Regras de Validação de Formulários
*   **Validação de Odômetro (Odometria Segura):**
    No formulário de nova jornada (`JourneyForm`), o sistema deve impedir fisicamente e com mensagens visuais vermelhas que o campo `endKm` (Odômetro Final) seja menor ou igual ao `startKm` (Odômetro Inicial). A diferença mínima deve ser de pelo menos $1$ quilômetro rodado para turnos válidos.
*   **Automação de Preço por Litro:**
    No formulário de abastecimento (`RefuelsView`), se o motorista digitar o Valor Total Pago (`value`) e a quantidade de Litros Carregados (`liters`), o sistema deve calcular e preencher o Preço por Litro (`pricePerLiter`) em tempo real através da equação:
    $$\text{pricePerLiter} = \frac{\text{value}}{\text{liters}}$$
*   **Carga de Tanque:**
    O nível inicial do combustível (`startFuelLevel`) e o nível final (`endFuelLevel`) devem ser validados de forma que, se o motorista não registrou despesas com abastecimento, o `endFuelLevel` deve ser igual ou menor que o `startFuelLevel`.

### 5.2. Métricas Analíticas Avançadas (Cockpit)
O painel de telemetria realiza os seguintes agrupamentos e cálculos de forma dinâmica:

1.  **Faturamento Bruto Total ($G_{total}$):**
    $$G_{total} = \sum (\text{earnings.uber} + \text{earnings.99} + \text{earnings.others})$$
2.  **Despesas Totais ($D_{total}$):**
    $$D_{total} = \sum (\text{expenses.fuel} + \text{expenses.tolls} + \text{expenses.others})$$
3.  **Lucro Líquido Real ($L_{liquido}$):**
    $$L_{liquido} = G_{total} - D_{total}$$
4.  **Lucro por Hora de Trabalho ($L_{hora}$):**
    $$L_{hora} = \frac{L_{liquido}}{\sum \text{totalHours}}$$
5.  **Lucro por Quilômetro Rodado ($L_{km}$):**
    $$L_{km} = \frac{L_{liquido}}{\sum \text{totalKm}}$$
6.  **Custo Operacional por Quilômetro ($C_{km}$):**
    $$C_{km} = \frac{D_{total}}{\sum \text{totalKm}}$$

### 5.3. Algoritmo de Previsão Mecânica (Central de Oficina)
Para cada tipo de manutenção cadastrada, a Central de Oficina e Alertas do cockpit realiza uma varredura cruzada contra o odômetro atual calculado do veículo ($O_{atual}$, obtido pelo maior valor de `endKm` cadastrado nas jornadas).
*   **Margem Crítica de Vencimento:** $1.500$ KM.
*   **Regra de Gatilho de Alerta Visual:**
    Se:
    $$O_{atual} \ge \text{nextOdometerCheck} - 1500$$
    O sistema deve emitir um alerta visual na tela, colorindo o indicador do serviço correspondente com luz vermelha pulsante e exibindo um banner do cockpit de comando: *"ALERTA CRÍTICO: Revisão de pastilhas/óleo vencida ou próxima do limite!"*.

---

## 6. ESPECIFICAÇÃO DE APIS & CONTRATO DE INTELIGÊNCIA ARTIFICIAL

O DrivePilot AI expõe um barramento seguro e simplificado de API para a comunicação com o motor de inteligência artificial do Google Gemini.

### 6.1. Endpoint de Consulta de Insights: `POST /api/insights`
*   **Responsabilidade:** Recebe as últimas jornadas, configurações de meta e histórico do motorista para formular recomendações estratégicas, respondendo a perguntas diretas enviadas via chat de bordo.
*   **Autenticação:** Exige cabeçalho bearer contendo o token JWT validado pelo Firebase Auth. Em ambiente de Modo Demonstração (Demo Mode), o servidor aceita uma requisição simulada segura.

#### Exemplo de Payload de Entrada (Request Body)
```json
{
  "message": "Qual é a média de faturamento diário atual e se estou atingindo a minha meta?",
  "history": [
    { "role": "user", "parts": [{ "text": "Como posso otimizar meus ganhos diários no carro?" }] },
    { "role": "model", "parts": [{ "text": "Analisando seu cockpit, recomendo focar nas horas de pico de sexta-feira." }] }
  ],
  "journeys": [
    {
      "id": "demo_1",
      "date": "2026-07-16",
      "totalKm": 180,
      "totalHours": 8.5,
      "earnings": { "uber": 340.00, "99": 110.00, "others": 0 },
      "expenses": { "fuel": 95.00, "tolls": 10.00, "others": 15.00 },
      "metrics": { "grossEarnings": 450.00, "totalExpenses": 120.00, "netProfit": 330.00 }
    }
  ],
  "settings": {
    "targetDailyProfit": 250.00,
    "currency": "BRL",
    "vehicleModel": "Toyota Corolla 2.0"
  }
}
```

#### Exemplo de Resposta do Servidor (Response Body)
```json
{
  "response": "Analisando seu histórico de telemetria mais recente, seu faturamento líquido atual por jornada é de **R$ 330,00**, operando em um veículo **Toyota Corolla 2.0**.\n\n*   **Performance vs Meta:** Você **superou** sua meta diária de R$ 250,00 em **+R$ 80,00** (atingindo **132%** da meta configurada).\n*   **Velocidade de Ganhos:** Seu rendimento líquido por hora ativa foi de **R$ 38,82/hora**.\n*   **Custo de Rodagem:** Cada quilômetro percorrido custou **R$ 0,66** em insumos operacionais.\n\n**Recomendação de IA:** Seu Corolla está rodando com excelente taxa de rendimento por KM. Como a Uber representou **75.5%** de seus ganhos desse turno, concentre suas horas online em turnos com tarifas dinâmicas da Uber para maximizar ainda mais a sua produtividade financeira."
}
```

---

## 7. CRONOGRAMA DE EVOLUÇÃO E ROADMAP DE DESENVOLVIMENTO

O desenvolvimento do DrivePilot AI segue uma esteira contínua de entrega de valor baseada nos 5 estágios indicados para o produto:

### ETAPA 1 — Setup, Configuração & Arquitetura Base
*   Estruturação dos ambientes de desenvolvimento locais e em contêiner no Cloud Run.
*   Configuração do compilador TypeScript, regras de build do Vite e dependências estritas de framework.
*   Criação do arquivo de ambiente `.env.example` protegendo as variáveis secretas de barramento.

### ETAPA 2 — Modelagem & Camada de Banco de Dados
*   Provisionamento do Firestore Database.
*   Definição e deploy das **Firestore Security Rules** assegurando que nenhum usuário consiga visualizar dados de terceiros.
*   Implementação do arquivo `/src/lib/firebase.ts` contendo as chamadas seguras e o motor de "Demo Mode" rodando em localStorage.

### ETAPA 3 — Design System "Elegant Dark" & Skeletons
*   Desenho da paleta de cores escura inspirada em painéis de superesportivos com detalhes neon.
*   Implementação de Skeletons animados com Framer Motion em todos os blocos de dados, eliminando cintilações durante as requisições assíncronas do Firestore e barramento de inteligência artificial.

### ETAPA 4 — Desenvolvimento de Módulos Funcionais
1.  **Auth Gate:** Sistema de Login, Cadastro de Pilotos e o atalho interativo de Modo Demonstração.
2.  **Dashboard Instrument Cluster:** Fichas de KPI tátil de alto impacto, velocímetro de meta de faturamento e gráficos de tendências Recharts.
3.  **Calendário Mensal de Desempenho:** Grid mensal completo com cores térmicas dinâmicas de acordo com o rendimento diário e gaveta lateral de auditoria rápida.
4.  **Ficha de Lançamento de Jornadas:** Formulários táteis inteligentes com travas de segurança de odômetro e cálculos instantâneos de performance.
5.  **Gestor de Abastecimentos:** Logs de abastecimentos, automação de custo por litro e telemetria diferencial de autonomia (km/L).
6.  **Central de Oficina:** Controle mecânico de ativos com HUD pulsante de revisões vencidas ou próximas do limite físico.
7.  **Co-Piloto Inteligente IA:** Chat interativo alimentado pelo Gemini 3.5 Flash via canal de API Express seguro.

### ETAPA 5 — Testes, Qualidade de Código & Deploy
*   Auditoria de qualidade via linter integrado (`npm run lint`).
*   Verificação completa do sistema de compilação de produção (`npm run build`).
*   Deploy contínuo e escalável utilizando infraestrutura serveless moderna no Google Cloud Run.

---

## 8. PLANO DE GARANTIA DE QUALIDADE (QA) & MATRIZ DE TESTES

Para garantir imunidade a falhas (bugs) e assegurar que as atualizações de código mantenham o padrão de alta qualidade exigido, o DrivePilot AI estabelece os seguintes casos de testes obrigatórios:

### 8.1. Matriz de Casos de Teste (Test Matrix)

| ID do Teste | Módulo Alvo | Descrição Detalhada | Procedimento de Teste | Critério de Aceitação (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- |
| **TC-SEC-01** | Segurança de Dados | Testar o isolamento do banco NoSQL | Tentar realizar requisição direta de leitura na rota `/users/UID_DIFERENTE/journeys`. | **Pass:** O Firestore bloqueia o acesso com erro "Missing or insufficient permissions". |
| **TC-VAL-01** | Formulário de Jornada | Impedir entrada inválida de odômetro | Cadastrar jornada com odômetro inicial `120000` e odômetro final `119000`. | **Pass:** O sistema bloqueia a submissão, pinta o campo de vermelho e exibe mensagem de erro de validação. |
| **TC-CALC-01**| Abastecimentos | Cálculo automático do preço por litro | Inserir valor pago R$ 180,00 e volume de 40 Litros no formulário de combustível. | **Pass:** O campo `pricePerLiter` deve ser preenchido automaticamente com o valor exato de R$ 4,50. |
| **TC-MEC-01** | Central de Oficina | HUD de Alerta Ativo de Manutenção | Registrar troca de óleo com previsão para `130000` KM. Cadastrar uma jornada com odômetro de fechamento de `129000` KM. | **Pass:** O painel exibe um alerta vermelho pulsante destacando que faltam apenas 1.000 KM para a manutenção do óleo. |
| **TC-DEMO-01**| Autenticação | Modo Demonstração sem Cadastro | Clicar no botão "Modo Demonstração" na tela principal de login. | **Pass:** O sistema redireciona imediatamente para o cockpit com dados simulados e sem falhas de compilação. |
| **TC-AI-01**   | IA Advisor | Resiliência de IA sem Histórico | Entrar na tela da IA com uma conta nova sem nenhuma jornada ou abastecimento cadastrado. | **Pass:** A IA responde de forma amigável informando que precisa de mais lançamentos no cockpit para calcular diagnósticos. |

---
**FIM DO PRD & GUIA DE ARQUITETURA.**  
*Este documento estabelece as especificações estruturais de desenvolvimento do DrivePilot AI. Qualquer nova IA de codificação deve consultar este arquivo como fonte absoluta da verdade técnica.*
