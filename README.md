# 🎬 CineScope

<div align="center">

![CineScope Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop)

### *Ultra-Fast Cinematic Universe & Intelligent Media Discovery Engine*

[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vanilla CSS](https://img.shields.io/badge/Vanilla_CSS-Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Production-success?style=for-the-badge)](#)

*An all-in-one streaming discovery platform, episode tracker, and cinematic encyclopedia powered by federated multi-source APIs, intelligent client-side caching, and responsive glassmorphic design.*

[Explore Features](#-features--capabilities) • [Use Cases](#-use-cases) • [User Guide](#-usage-guide) • [Architecture](#-architecture--data-federation) • [Quick Start](#-quick-start)

---

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Features & Capabilities](#-features--capabilities)
  - [1. Panoramic Spotlight Stage & Carousel](#1-panoramic-spotlight-stage--carousel)
  - [2. Multi-Source Search & Smart Filtering](#2-multi-source-search--smart-filtering)
  - [3. Luxury Title Showcase & Metadata Hub](#3-luxury-title-showcase--metadata-hub)
  - [4. Interactive TV Series & Episode Guide](#4-interactive-tv-series--episode-guide)
  - [5. "Where to Stream" Availability Hub](#5-where-to-stream-availability-hub)
  - [6. Personal Watchlist & Private Cinema Journal](#6-personal-watchlist--private-cinema-journal)
  - [7. Embedded Trailer Theater](#7-embedded-trailer-theater)
  - [8. Dark / Light Dual Aesthetic](#8-dark--light-dual-aesthetic)
- [Use Cases](#-use-cases)
- [Usage Guide](#-usage-guide)
- [Architecture & Data Federation](#-architecture--data-federation)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Installation](#-quick-start--installation)
- [Author & License](#-author--license)

---

## 🌟 Overview

**CineScope** is a high-performance web platform designed to streamline how movie buffs, anime enthusiasts, and TV binge-watchers discover, track, and explore films and series. 

Traditional movie apps often suffer from fragmented data, missing episode guides, sluggish search speeds, and uninspired UI designs. CineScope addresses this by combining multiple global media registries into a federated search engine, wrapped in an ambient, responsive UI with zero external UI framework dependencies.

---

## 🚀 Features & Capabilities

### 1. Panoramic Spotlight Stage & Carousel
- **Hero Carousel**: Widescreen billboard presenting trending films and marquee titles with high-definition backdrops.
- **Instant Actions**: One-click trailer launch, quick watchlist toggle, and full title navigation directly from the banner.
- **Quick Discovery Chips**: Preset search tags (*Dune*, *Interstellar*, *Breaking Bad*, *Stranger Things*, *Attack on Titan*, *Spirited Away*, *Oppenheimer*) for instant curation.

### 2. Multi-Source Search & Smart Filtering
- **Zero-Latency Search**: Real-time debounced search across thousands of international titles.
- **Multi-Category Browsing**: Dedicated catalog rows for Blockbusters, Top Rated TV Shows, Legendary Anime, Sci-Fi & Cyberpunk, Mind-Bending Thrillers, and Marvel/DC franchises.
- **Deep Filter Controls**: Filter by release year, primary genre (Action, Sci-Fi, Drama, Animation, Comedy, etc.), and sort dynamically by IMDb Rating, Year, Popularity, or Title.

### 3. Luxury Title Showcase & Metadata Hub
- **Critical Consensus**: Aggregated ratings comparing IMDb scores, Metascores, and Rotten Tomatoes approval ratings.
- **Detailed Specifications**: Box office earnings, official awards, runtime, age ratings (PG-13, R, TV-MA), director filmography, and complete cast lineups with actor photos.
- **Format Badges**: Dynamic detection of visual/audio specifications such as **4K Ultra HD**, **Dolby Atmos**, and **HDR10+**.

### 4. Interactive TV Series & Episode Guide
- **Multi-Season Navigator**: Drag-and-scroll season selector with episode breakdowns.
- **Episode Intelligence**: Episode synopsis, official runtime, air date, and thumbnail previews.
- **Progress Tracking**: Mark individual episodes as `✓ Watched` to monitor binge-watching progress stored in local state.

### 5. "Where to Stream" Availability Hub
- **Streaming Provider Detection**: Real-time lookup indicating platform availability across Netflix, Amazon Prime Video, Disney+, Max, Apple TV+, Hulu, and Crunchyroll.
- **Rent, Buy & Stream Breakdown**: Categorized access points with direct links to respective services.

### 6. Personal Watchlist & Private Cinema Journal
- **Categorized Lists**: Organize titles into *Want to Watch*, *Currently Watching*, *Completed*, and *Favorites*.
- **Private Journal & Star Ratings**: Assign personal 1–10 star ratings and write private timestamped journal reflections.
- **Persistent Offline Storage**: Retains watchlist state and journal entries in browser storage without mandatory account sign-up.

### 7. Embedded Trailer Theater
- **Cinema Modal**: Responsive widescreen YouTube trailer modal with background dimming and keyboard dismiss (`Esc`).
- **Dynamic Fallbacks**: Automatically fetches verified official trailers and teasers based on title and release year.

### 8. Dark / Light Dual Aesthetic
- **OLED Cinema Dark**: Deep velvet background (`#080c14`) with neon indigo accents and ambient glows.
- **Pristine Light**: High-contrast crystal styling tailored for daytime browsing.

---

## 🎯 Use Cases

| Persona / Scenario | CineScope Solution |
|---|---|
| 🎬 **The Cinephile & Movie Buff** | Explore deep film trivia, director credentials, box office figures, awards, and technical formats while logging private ratings and reviews. |
| 🍿 **The Casual Streamer** | Instantly find which streaming service (Netflix, Prime, Disney+, Max, etc.) hosts a specific movie without jumping between multiple apps. |
| 📺 **The Series Binge-Watcher** | Track season-by-season and episode-by-episode progress with one-click "Watched" checkmarks and overview summaries. |
| ⛩️ **The Anime Enthusiast** | Browse specialized anime catalogs with Japanese studio information, character rosters, and dedicated genre categories. |
| 🔍 **The Indecisive Viewer** | Discover curated lists sorted by critical acclaim, genre filters, and trending community favorites to decide movie night picks in seconds. |

---

## 🕹️ Usage Guide

### Searching & Discovering Titles
1. Use the top navigation bar to type any movie, series, or anime name.
2. Click any of the **Quick Discovery Chips** beneath the search bar for one-click access to popular titles.
3. Use the **Genre & Sort Filters** in the catalog view to narrow down selections by rating or release year.

### Exploring Title Details
1. Click on any title card to open the **Full Title Page**.
2. View synopsis, ratings, cast, box office details, and streaming providers.
3. For TV Series, click on season tabs (Season 1, Season 2, etc.) to view and track individual episodes.

### Managing Your Watchlist & Journal
1. Click the **Bookmark / Add to Watchlist** icon on any movie card or detail page.
2. Open the Watchlist Modal from the top navigation bar to filter by status (*Want to Watch*, *Watching*, *Completed*, *Favorites*).
3. Add custom star ratings and personal notes to preserve your thoughts on any movie or show.

---

## 🏛️ Architecture & Data Federation

```
                      ┌───────────────────────────────┐
                      │      CineScope Frontend       │
                      │  (React 19 + Vanilla CSS)     │
                      └──────────────┬────────────────┘
                                     │
                      ┌──────────────▼────────────────┐
                      │    Movie API Federated Hub    │
                      │  (Multi-Key & Cache Manager)  │
                      └──────┬───────┬───────┬────────┘
                             │       │       │
       ┌─────────────────────┼───────┼───────┼────────────────────┐
       │                     │       │       │                    │
┌──────▼──────┐       ┌──────▼──────┐│┌──────▼──────┐      ┌──────▼──────┐
│  OMDb API   │       │ TVmaze API  │││  Jikan v4   │      │  Wikipedia  │
│(Key Rotate) │       │(TV Guides)  │││ (Anime DB)  │      │ REST Media  │
└─────────────┘       └─────────────┘│└─────────────┘      └─────────────┘
                                     │
                             ┌───────▼───────┐
                             │  2-Tier Cache │
                             │(Memory + L-S) │
                             └───────────────┘
```

- **Federated Engine**: Combines OMDb API, TVmaze API, Jikan v4 (Anime API), and Wikipedia REST endpoints to produce unified title objects.
- **Key Rotation**: Built-in OMDb key pool rotation prevents single-key throttling and quota exhaustion.
- **Two-Tier Caching**: Uses in-memory `Map` caching for zero-millisecond instant switches and persistent `localStorage` with a 48-hour Time-To-Live (TTL).

---

## 💻 Technology Stack

- **Core**: React 19, JavaScript (ES6+), JSX
- **Build System**: Vite 8, Rolldown / Babel React Compiler
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism, CSS Grid & Flexbox)
- **External Data Providers**: OMDb API, TVmaze API, Jikan Anime API v4, Wikipedia REST API, YouTube IFrame API
- **State & Storage**: React Context / State, Browser Web Storage (`localStorage`)

---

## 📂 Project Directory Structure

```bash
Movie-Search-Project/
├── public/                       # Static public assets & icons
├── src/
│   ├── components/
│   │   ├── Body.jsx              # Main catalog grid & discovery layout
│   │   ├── HeroSection.jsx       # Panoramic spotlight hero banner
│   │   ├── InitialCinemaLoader.jsx # Cinematic initialization loader
│   │   ├── Loading.jsx           # Skeleton placeholders for async states
│   │   ├── MovieCard.jsx         # Theatrical card with hover animations
│   │   ├── MovieDetail.jsx       # Detailed title meta view
│   │   ├── MoviePage.jsx         # Full luxury dedicated title page
│   │   ├── Nav.jsx               # Top navigation bar, search, & theme toggle
│   │   ├── Notfound.jsx          # Custom 404 & empty state fallback
│   │   ├── Sections.jsx          # Categorized catalog sections
│   │   ├── TrailerModal.jsx      # Modal video theater
│   │   ├── WatchProviders.jsx    # "Where to Stream" platform resolver
│   │   └── WatchlistModal.jsx    # Personal cinema hub & journal modal
│   ├── services/
│   │   └── movieApi.js           # Multi-source API federation & cache engine
│   ├── App.css                   # Master stylesheet & glassmorphic tokens
│   ├── App.jsx                   # Global state management & routing
│   ├── index.css                 # Base typography & CSS resets
│   └── main.jsx                  # Application root entry point
├── index.html                    # HTML shell & font definitions
├── package.json                  # Dependencies & npm scripts
└── vite.config.js                # Vite build setup
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- [npm](https://www.npmjs.com/) (version 9.0 or higher)

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sarthak-chanda/Cinescope.git
   cd Cinescope
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Launch Application**
   Open your browser and navigate to `http://localhost:5173`.

### Production Build

To generate an optimized production bundle:
```bash
npm run build
```

To preview the production bundle locally:
```bash
npm run preview
```

---

## 👤 Author & License

Developed with ❤️ by **[Sarthak Chanda](https://github.com/Sarthak-chanda)**.

- **GitHub**: [@Sarthak-chanda](https://github.com/Sarthak-chanda)
- **Repository**: [Cinescope](https://github.com/Sarthak-chanda/Cinescope)

This project is licensed under the [MIT License](LICENSE).
