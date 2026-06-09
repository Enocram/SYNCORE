# 🔷 SYNCORE  
### *O Núcleo Sincronizado dos Seus Projetos*

<p align="center">
  <img src="assets/icons/icon-192.png" width="80" alt="SYNCORE Logo">
</p>

[![PWA](https://img.shields.io/badge/PWA-Instalável-blueviolet?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Offline Ready](https://img.shields.io/badge/Offline-Pronto-brightgreen?logo=webpack)](https://web.dev/offline-fallback-page/)
[![Supabase](https://img.shields.io/badge/Supabase-Sincronização%20Cloud-3ecf8e?logo=supabase)](https://supabase.com)
[![Licença](https://img.shields.io/badge/Licença-MIT-yellow.svg)](LICENSE)
[![PRs Bem-vindos](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Um espaço de trabalho neural onde projetos, conhecimento e IA se conectam – offline first, cloud ready.**

---

## 📌 Visão Geral

**SYNCORE** é um Progressive Web App (PWA) projetado como um **sistema operacional pessoal para desenvolvimento de software, gestão de projetos e inteligência de equipe**. Ele combina CRUD de projetos, insights com IA, grafos de conhecimento, roadmaps inteligentes e sincronização na nuvem entre dispositivos em uma única interface futurista.

**Para quem?**  
- Desenvolvedores e líderes técnicos  
- Gerentes de produto e times ágeis  
- Freelancers e empreendedores solo  
- Entusiastas de IA e pesquisadores  

**Problema que resolve**  
Ferramentas tradicionais de projeto são isoladas (tarefas, documentos, IA, roadmap). SYNCORE unifica tudo em um **único ambiente offline‑first** que funciona sem internet e sincroniza quando você reconecta.

---

## ✨ Principais Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🧠 **Mapa Neural** | Gráfico interativo que visualiza dependências do projeto, colaboradores IA e estágios do roadmap. Zoom, pan, arraste de nós – como um radar tático. |
| 🤖 **AI Hub** | Registre modelos de IA (ChatGPT, Claude, Gemini…), armazene prompts, guarde resultados e analise métricas de uso. |
| 📚 **Centro de Conhecimento** | Central única para notas, links de pesquisa, decisões e histórico de prompts. Busca global em todos os itens. |
| 🗺️ **Roadmaps Inteligentes** | Visualização Kanban + linha do tempo para etapas customizáveis. Cálculo automático de progresso e alertas de prazo. |
| ☁️ **Sincronização Cloud** | Motor de sincronização offline‑first alimentado por **Supabase** (PostgreSQL + RLS). Sincronização em tempo real entre dispositivos. |
| 📊 **Dashboard Inteligente** | KPIs ao vivo, gráficos radar, heatmaps de atividade e alertas proativos (projetos parados, prazos próximos). |

---

## 🖼️ Capturas de Tela

| Dashboard | Neural Map | AI Hub |
|-----------|------------|--------|
| ![Dashboard](assets/img/screenshot-dashboard.png) | ![Neural Map](assets/img/screenshot-neural-map.png) | ![AI Hub](assets/img/screenshot-ai-hub.png) |

| Roadmap Kanban | Knowledge Center | Cloud Status |
|----------------|------------------|---------------|
| ![Roadmap](assets/img/screenshot-roadmap.png) | ![Knowledge](assets/img/screenshot-knowledge.png) | ![Sync](assets/img/screenshot-sync.png) |

---

## 🏗️ Arquitetura

```mermaid
graph LR
    A[PWA / Service Worker] --> B[IndexedDB Cache Local]
    B --> C[Sync Engine]
    C --> D[Supabase Auth & PostgreSQL]
    D --> E[(Dados do Usuário)]
    C -->|Resolução de conflitos| B
    A -->|Offline First| B
