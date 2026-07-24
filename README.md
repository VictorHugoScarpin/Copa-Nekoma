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
