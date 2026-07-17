# Drive Analytics - Documento de Arquitetura e Plano de Desenvolvimento

Este documento descreve a arquitetura técnica, mapa de telas, modelo de dados e plano de desenvolvimento do aplicativo **Drive Analytics**, uma plataforma completa para motoristas de aplicativo (Uber, 99, etc.) controlarem suas jornadas de trabalho, faturamento, despesas e lucro real.

---

## 1. Arquitetura de Software

O Drive Analytics é construído como uma aplicação **Full-Stack moderna**, otimizada para performance, segurança e usabilidade em múltiplos dispositivos (desktop, tablet, celular).

```
+-------------------------------------------------------------+
|                        Navegador / App                      |
|  [ React 19 SPA ] <---> [ Tailwind v4 ] <---> [ Motion ]     |
+------------------------------------+------------------------+
                                     | (API & Auth)
                                     v
+-------------------------------------------------------------+
|                    Express Backend Server                   |
|  [ tsx / Node.js ]                                          |
|  - Middleware de Autenticação Firebase                      |
|  - Endpoints de Relatórios e Inteligência                   |
|  - Integração com Gemini API para Insights Automáticos      |
+------------------------------------+------------------------+
                                     |
                                     v
+-------------------------------------------------------------+
|                      Banco de Dados                         |
|  [ Firebase Firestore ] (Armazenamento Não-Relacional)      |
|  - Coleções de Usuários, Jornadas, Abastecimentos           |
|  - Segurança via Firestore Security Rules                   |
+-------------------------------------------------------------+
```

### Componentes de Tecnologia:
1. **Front-End**: React 19 (TypeScript), Vite, Tailwind CSS v4 para estilização de alto nível, Lucide React para ícones de painel, e Recharts para relatórios visuais.
2. **Back-End**: Express (TypeScript) rodando no Node.js. Serve a aplicação React e provê rotas de API seguras, incluindo um analisador inteligente de desempenho integrado com a **Gemini API**.
3. **Persistência**: Firebase Firestore para sincronização em nuvem e persistência real-time por usuário.
4. **Autenticação**: Firebase Auth integrado no cliente com e-mail/senha, garantindo isolamento total de dados entre os motoristas.

---

## 2. Mapa das Telas (Screen Map)

A interface é inspirada em um **painel de carro esportivo/moderno (Supercar Dashboard)**. Possui um tema escuro profundo (preto de alta densidade e grafite fosco), com luzes de destaque em azul elétrico e verde neon.

```
       [ Tela de Autenticação ]
                  |
                  v
       [ Painel Principal / Sidebar ]
                  |
    +-------------+-------------+-------------+
    |                           |             |
[ Dashboard Geral ]    [ Calendário Mensal ]  [ Nova Jornada ]
- Métricas chave       - Visualização de      - KM Inicial/Final
- Gráficos de lucro     desempenho diário     - Ganhos por App
- Insights Gemini      - Cores por lucro      - Gastos e Abastecimento
- Comparação Apps      - Detalhamento de dia  - Nível de Combustível
```

1. **Dashboard Geral ("Cockpit")**: Exibição em tempo real de KPIs de alto impacto: Receita Bruta, Gastos, Lucro Líquido, Lucro por Hora, Lucro por KM e Custo por KM. Inclui gráficos de barras e rosca comparando Uber vs 99 e tendências diárias/semanais.
2. **Calendário Mensal ("Jornadas")**: Um calendário interativo onde cada dia é colorido conforme o lucro líquido real alcançado:
   - 🟢 Verde Brilhante: Lucro Alto (> R$ 250/dia)
   - 🔵 Azul Elétrico: Lucro Médio (R$ 100 - R$ 250/dia)
   - 🟡 Amarelo/Laranja: Lucro Baixo (< R$ 100/dia)
   - 🔘 Grafite Escuro: Sem registros.
3. **Formulário de Entrada de Jornada ("Start Engine")**: Interface intuitiva para salvar dados de cada dia trabalhado:
   - KM Inicial e Final (com cálculo automático de rodagem).
   - Horário de início e fim da jornada (cálculo automático de horas trabalhadas).
   - Nível de combustível inicial e final (com barra deslizante interativa).
   - Ganhos discriminados por plataforma: Uber, 99, Outros.
   - Detalhamento de despesas: Abastecimentos (litros e preço), Pedágios, Alimentação e Outros.
   - Observações rápidas da jornada.
4. **Painel de Insights Inteligentes ("Advisor")**: IA integrada que processa as jornadas recentes e oferece relatórios em linguagem natural, recomendando qual plataforma é mais vantajosa para o motorista, melhores dias da semana para rodar e formas de economizar combustível.

---

## 3. Diagrama do Banco de Dados (Firestore Schema)

Como estamos operando no Firebase Firestore (uma escolha robusta que substitui o Cloud SQL para persistência flexível, segura e real-time no ambiente Cloud), o modelo de dados é estruturado em coleções isoladas por ID de usuário (`userId`).

### Coleção: `users`
```json
{
  "uid": "ID_DO_USUARIO",
  "email": "motorista@email.com",
  "displayName": "Nome do Motorista",
  "createdAt": "Timestamp",
  "settings": {
    "fuelType": "Flex / Gasolina / Etanol / GNV",
    "targetDailyProfit": 250.00,
    "currency": "BRL"
  }
}
```

### Coleção: `journeys`
```json
{
  "id": "ID_DA_JORNADA",
  "userId": "ID_DO_USUARIO",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "startKm": 120450,
  "endKm": 120680,
  "totalKm": 230,
  "startFuelLevel": 100, // em porcentagem
  "endFuelLevel": 40,
  "earnings": {
    "uber": 280.50,
    "99": 120.00,
    "others": 0.00
  },
  "expenses": {
    "fuel": 110.00,
    "tolls": 18.50,
    "food": 25.00,
    "others": 10.00
  },
  "metrics": {
    "grossEarnings": 400.50,
    "totalExpenses": 163.50,
    "netProfit": 237.00,
    "profitPerHour": 29.62,
    "profitPerKm": 1.03,
    "costPerKm": 0.71
  },
  "notes": "Dia chuvoso, bastante dinâmica na Uber.",
  "createdAt": "Timestamp"
}
```

---

## 4. Plano de Desenvolvimento (Fases)

Para garantir máxima solidez e estabilidade do código, dividimos a execução em fases validadas:

- **Fase 1: Configuração e Setup**: Estruturar os arquivos de ambiente, configurar as dependências de build do Vite/Express, e inicializar o Firebase.
- **Fase 2: Arquitetura do Backend e API**: Criar o servidor `server.ts` integrado ao Vite, configurar o roteamento de API e a integração do conselheiro inteligente com a **Gemini API**.
- **Fase 3: Camada de Serviços do Firebase**: Desenvolver os serviços de autenticação de usuários e operações de CRUD no Firestore (com suporte a fallback offline em localStorage).
- **Fase 4: UI/UX "Car Dashboard" & Componentes**: Implementar o layout responsivo com tema escuro e elementos inspirados em cockpit. Desenvolver o calendário mensal colorido e os formulários interativos.
- **Fase 5: Gráficos e Relatórios (Recharts)**: Integrar visualizações de pizza, barras e linhas para analisar o faturamento comparativo e o custo/lucro por quilômetro.
- **Fase 6: Polimento e Integração de IA**: Ativar o painel de insights por IA e testar todos os cenários.
