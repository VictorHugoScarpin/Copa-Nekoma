<div align="center">

# Bolao Copa

**Interactive prediction and engagement platform for tournament competitions**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Project Background](#project-background)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Setup and Installation](#setup-and-installation)
- [Maintenance Scripts](#maintenance-scripts-github-actions)

---

## Overview

Bolao Copa is a platform developed to support prediction-based competitions ("tipping pools") among groups of participants during major sporting tournaments. The system centralizes match scheduling, prediction submission, automated scoring, and participant ranking, complemented by supplementary engagement features such as a quiz module and real-time chat.

---

## Project Background

The project originated as a lightweight prediction tracker intended for a small group of 5 to 7 participants within the Nekoma community server. As development progressed, the scope expanded to accommodate more than 20 active users competing simultaneously, with real-world prizes awarded to top-performing participants.

What began as a straightforward tipping pool evolved, across successive development iterations, into a broader entertainment hub encompassing a Fantasy Game mode, a dynamic quiz system, and synchronous chat functionality.

---

## Core Features

| Module | Description |
|---|---|
| **Matches Page** | Automated schedule displaying tournament fixtures, dates, and kickoff times, allowing participants to track submission deadlines for their predictions. |
| **Guesses Page** | Primary interface for submitting and updating predictions for each match prior to kickoff. |
| **Ranking and Leaderboard** | Automated scoring engine that processes official match results, updates standings, and generates participant rankings in real time. |
| **Quiz Module** | Dynamic question-and-answer system integrated into the platform, awarding bonus points and additional rewards to participants. |
| **Real-Time Chat** | Integrated chat room built on Supabase Realtime, enabling instant discussion and commentary among participants as matches unfold. |

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Fast build times and high-performance single-page application |
| Styling | Tailwind CSS / Custom CSS | Modern, clean, and responsive interface |
| Backend & Database | Supabase | Authentication, PostgreSQL storage, and Realtime WebSockets |
| Automation & Infra | GitHub Actions | Manually triggered maintenance and deployment workflows |

---

## Setup and Installation

**1. Clone the repository**
```bash
git clone https://github.com/seu-usuario/bol-o-copa.git
cd bol-o-copa
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Start the development server**
```bash
npm run dev
```

---

## Maintenance Scripts (GitHub Actions)

The repository includes GitHub Actions workflows for periodic maintenance tasks. The chat cleanup script, for example, is configured to run exclusively via manual trigger (`workflow_dispatch`), ensuring that administrators retain full control over database operations without unintended automated interference affecting the user experience.

---

<div align="center">

*Built with React, Supabase, and a passion for football.*

</div>





<div align="center">

# Bolão Copa

**Plataforma interativa de palpites e engajamento para competições de torneios**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Histórico do Projeto](#histórico-do-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Stack Tecnológica](#stack-tecnológica)
- [Configuração e Instalação](#configuração-e-instalação)
- [Scripts de Manutenção](#scripts-de-manutenção-github-actions)

---

## Visão Geral

O Bolão Copa é uma plataforma desenvolvida para viabilizar competições de palpites entre grupos de participantes durante grandes torneios esportivos. O sistema centraliza o calendário de partidas, o registro de palpites, a apuração automatizada de pontuação e a classificação dos participantes, complementados por funcionalidades adicionais de engajamento, como um módulo de quiz e chat em tempo real.

---

## Histórico do Projeto

O projeto teve origem como um sistema simples de controle de palpites, destinado a um grupo restrito de 5 a 7 participantes do servidor da comunidade Nekoma. Com o avanço do desenvolvimento, o escopo foi ampliado para atender mais de 20 usuários ativos competindo simultaneamente, com premiações reais destinadas aos participantes mais bem colocados.

O que começou como um bolão tradicional evoluiu, ao longo de sucessivos ciclos de desenvolvimento, para um hub de entretenimento mais amplo, incorporando um modo Fantasy Game, um sistema dinâmico de quiz e funcionalidades de chat síncrono.

---

## Funcionalidades Principais

| Módulo | Descrição |
|---|---|
| **Página de Partidas** | Calendário automatizado exibindo os confrontos, datas e horários da competição, permitindo que os participantes acompanhem os prazos para registro de seus palpites. |
| **Página de Palpites** | Interface principal para registro e atualização dos palpites de cada partida antes do início do jogo. |
| **Ranking e Classificação** | Motor de pontuação automatizado que processa os resultados oficiais das partidas, atualiza a tabela de classificação e gera o ranking dos participantes em tempo real. |
| **Módulo de Quiz** | Sistema dinâmico de perguntas e respostas integrado à plataforma, concedendo pontos extras e recompensas adicionais aos participantes. |
| **Chat em Tempo Real** | Sala de bate-papo integrada, construída sobre o Supabase Realtime, permitindo discussões e comentários instantâneos entre os participantes durante as partidas. |

---

## Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|---|---|---|
| Frontend | React + Vite | Builds rápidos e aplicação single-page de alta performance |
| Estilização | Tailwind CSS / CSS Customizado | Interface moderna, limpa e responsiva |
| Backend e Banco de Dados | Supabase | Autenticação, armazenamento em PostgreSQL e WebSockets em tempo real |
| Automação e Infraestrutura | GitHub Actions | Workflows de manutenção e deploy acionados manualmente |

---

## Configuração e Instalação

**1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/bol-o-copa.git
cd bol-o-copa
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_supabase_url
VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key
```

**4. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

---

## Scripts de Manutenção (GitHub Actions)

O repositório conta com workflows do GitHub Actions destinados a tarefas de manutenção periódica. O script de limpeza do chat, por exemplo, é configurado para execução exclusivamente manual (`workflow_dispatch`), garantindo que os administradores mantenham controle total sobre as operações no banco de dados, sem interferências automatizadas indesejadas que possam impactar a experiência dos usuários.

---

<div align="center">

*Desenvolvido com React, Supabase e paixão por futebol.*

</div>

