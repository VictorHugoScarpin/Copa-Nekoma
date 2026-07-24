Bolao Copa
Bolao Copa is an interactive platform developed to support prediction-based competitions ("tipping pools") among groups of participants during major sporting tournaments. The system centralizes match scheduling, prediction submission, automated scoring, and participant ranking, complemented by supplementary engagement features such as a quiz module and real-time chat.
---
Project Background
The project originated as a lightweight prediction tracker intended for a small group of 5 to 7 participants within the Nekoma community server. As development progressed, the scope expanded to accommodate more than 20 active users competing simultaneously, with real-world prizes awarded to top-performing participants.
What began as a straightforward tipping pool evolved, across successive development iterations, into a broader entertainment hub encompassing a Fantasy Game mode, a dynamic quiz system, and synchronous chat functionality.
---
Core Features
The platform's stable release includes the following modules:
Matches Page: An automated schedule displaying tournament fixtures, dates, and kickoff times, allowing participants to track submission deadlines for their predictions.
Guesses Page: The primary interface for submitting and updating predictions for each match prior to kickoff.
Ranking and Leaderboard: An automated scoring engine that processes official match results, updates standings, and generates participant rankings in real time.
Quiz Module: A dynamic question-and-answer system integrated into the platform, awarding bonus points and additional rewards to participants.
Real-Time Chat: An integrated chat room built on Supabase Realtime, enabling instant discussion and commentary among participants as matches unfold.
---
Technology Stack
The project is built using the following technologies, selected for performance, responsive design, and reactive data handling:
Frontend: React with Vite, providing fast build times and a high-performance single-page application.
Styling: Tailwind CSS and custom CSS for a modern, clean interface.
Backend and Database: Supabase, providing authentication, PostgreSQL storage, and Realtime WebSocket support for the chat feature.
Automation and Infrastructure: GitHub Actions, used for custom, manually triggered maintenance and deployment workflows.
---
Setup and Installation
To run the project locally for testing or development:
Clone the repository:
```bash
   git clone https://github.com/seu-usuario/bol-o-copa.git
   cd bol-o-copa
   ```
Install dependencies:
```bash
   npm install
   ```
Configure environment variables:
Create a `.env` file in the project root with the following Supabase credentials:
```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
Start the development server:
```bash
   npm run dev
   ```
---
Maintenance Scripts (GitHub Actions)
The repository includes GitHub Actions workflows for periodic maintenance tasks. The chat cleanup script, for example, is configured to run exclusively via manual trigger (`workflow_dispatch`), ensuring that administrators retain full control over database operations without unintended automated interference affecting the user experience.

---


Bolão Copa
O Bolão Copa é uma plataforma interativa desenvolvida para viabilizar competições de palpites entre grupos de participantes durante grandes torneios esportivos. O sistema centraliza o calendário de partidas, o registro de palpites, a apuração automatizada de pontuação e a classificação dos participantes, complementados por funcionalidades adicionais de engajamento, como um módulo de quiz e chat em tempo real.
---
Histórico do Projeto
O projeto teve origem como um sistema simples de controle de palpites, destinado a um grupo restrito de 5 a 7 participantes do servidor da comunidade Nekoma. Com o avanço do desenvolvimento, o escopo foi ampliado para atender mais de 20 usuários ativos competindo simultaneamente, com premiações reais destinadas aos participantes mais bem colocados.
O que começou como um bolão tradicional evoluiu, ao longo de sucessivos ciclos de desenvolvimento, para um hub de entretenimento mais amplo, incorporando um modo Fantasy Game, um sistema dinâmico de quiz e funcionalidades de chat síncrono.
---
Funcionalidades Principais
A versão estável da plataforma inclui os seguintes módulos:
Página de Partidas: Calendário automatizado exibindo os confrontos, datas e horários da competição, permitindo que os participantes acompanhem os prazos para registro de seus palpites.
Página de Palpites: Interface principal para registro e atualização dos palpites de cada partida antes do início do jogo.
Ranking e Classificação: Motor de pontuação automatizado que processa os resultados oficiais das partidas, atualiza a tabela de classificação e gera o ranking dos participantes em tempo real.
Módulo de Quiz: Sistema dinâmico de perguntas e respostas integrado à plataforma, concedendo pontos extras e recompensas adicionais aos participantes.
Chat em Tempo Real: Sala de bate-papo integrada, construída sobre o Supabase Realtime, permitindo discussões e comentários instantâneos entre os participantes durante as partidas.
---
Stack Tecnológica
O projeto foi construído utilizando as seguintes tecnologias, selecionadas por performance, design responsivo e manipulação reativa de dados:
Frontend: React com Vite, garantindo builds rápidos e uma aplicação single-page de alta performance.
Estilização: Tailwind CSS e CSS customizado, proporcionando uma interface moderna e limpa.
Backend e Banco de Dados: Supabase, responsável por autenticação, armazenamento em PostgreSQL e suporte a WebSockets em tempo real para o recurso de chat.
Automação e Infraestrutura: GitHub Actions, utilizado para workflows customizados de manutenção e deploy, acionados manualmente.
---
Configuração e Instalação
Para executar o projeto localmente em ambiente de testes ou desenvolvimento:
Clone o repositório:
```bash
   git clone https://github.com/seu-usuario/bol-o-copa.git
   cd bol-o-copa
   ```
Instale as dependências:
```bash
   npm install
   ```
Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes credenciais do Supabase:
```env
   VITE_SUPABASE_URL=sua_supabase_url
   VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key
   ```
Inicie o servidor de desenvolvimento:
```bash
   npm run dev
   ```
---
Scripts de Manutenção (GitHub Actions)
O repositório conta com workflows do GitHub Actions destinados a tarefas de manutenção periódica. O script de limpeza do chat, por exemplo, é configurado para execução exclusivamente manual (`workflow_dispatch`), garantindo que os administradores mantenham controle total sobre as operações no banco de dados, sem interferências automatizadas indesejadas que possam impactar a experiência dos usuários.
