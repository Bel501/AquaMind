# AquaMind — L'eau, enfin sous contrôle.

Plateforme intelligente de gestion de l'eau combinant **capteurs IoT**, **séries temporelles (Machine Learning)** et **visualisation 3D interactive** pour prédire les besoins en irrigation et détecter les fuites en temps réel (< 4 min) dans l'**agriculture**, l'**hôtellerie** et l'**industrie**.

---

## Fonctionnalités principales

- **Scène 3D persistante (Three.js)** pilotée au scroll (*scrub*) sur 5 états : goutte réfractive (Hero) → réseau IoT → terrain agricole isométrique & courbes ML → canalisations avec fuite pulsante → sphère équilibrée & vagues 3D.
- **Défilement fluide & micro-interactions** : Lenis (`lerp: 0.08`) synchronisé avec GSAP ScrollTrigger, barre de progression, navbar auto-masquée, curseur goutte d'eau (desktop), boutons magnétiques à ondulation (*ripple*), préchargeur goutte 0–100 %.
- **Cockpit IoT temps réel (Recharts)** : flux simulé (humidité du sol, débit, pression, météo/ET0), courbe de consommation + bande de confiance ML, bouton **« Simuler une fuite »**, et recommandation d'irrigation actionnable.
- **Assistant IA « Demandez à AquaMind »** : route Express sécurisée `/api/chat` appelant le SDK `@google/genai` côté serveur avec limitation de débit, validation Zod et mode fallback local.
- **Multilingue & Thème** : Français (`fr`), English (`en`), العربية (`ar` avec support `dir="rtl"`), plus mode sombre/clair.
- **Formulaire de démo validé par Zod** (`POST /api/demo-request`).

---

## Stack technique

- **Frontend** : React 19, TypeScript (mode `strict`), Vite 8, Tailwind CSS v4, Motion, Lucide React
- **3D & Animations** : Three.js (`RoomEnvironment`, `InstancedMesh`, `LatheGeometry`, `TubeGeometry`), GSAP + ScrollTrigger, Lenis
- **Data, i18n & Validation** : Recharts, `react-i18next` / `i18next`, Zod
- **Backend** : Express 4, `@google/genai` (`gemini-4-hydrogen`), `dotenv`, `tsx`

---

## Installation locale

### Prérequis
- Node.js `>= 22` (ou Bun `>= 1.1`)

### Avec npm
```bash
npm install
cp .env.example .env
# Renseignez GEMINI_API_KEY dans .env
npm run dev
```

### Avec bun
```bash
bun install
cp .env.example .env
bun run dev
```

L'application est accessible sur **`http://localhost:3000`**.

---

## Variables d'environnement

| Variable | Description | Requis |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Clé API Google Gemini utilisée uniquement côté serveur dans `server.ts` | Oui (fallback local si absente) |
| `APP_URL` | URL publique de l'application déployée | Optionnel |
| `PORT` | Port d'écoute du serveur Express (défaut : `3000`) | Optionnel |

---

## Scripts disponibles

- `npm run dev` — Démarre le serveur Express + Vite middleware sur le port `3000`
- `npm run build` — Compile le bundle frontend optimisé dans `dist/`
- `npm run start` — Lance le serveur Express en production (`NODE_ENV=production node server.ts`)
- `npm run lint` — Vérifie le typage TypeScript strict (`tsc --noEmit`)
- `npm run format` — Formate le code avec Prettier

---

## Structure du projet

```text
├── index.html                  # Point d'entrée HTML, SEO, Open Graph, Schema.org
├── metadata.json               # Métadonnées AI Studio
├── server.ts                   # Serveur Express (/api/chat, /api/demo-request) + Vite
├── public/
│   ├── favicon.svg             # Favicon goutte d'eau vectoriel
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── App.tsx                 # Orchestration Lenis, GSAP ScrollTrigger & 11 sections
    ├── i18n.ts                 # Traductions FR / EN / AR (RTL)
    ├── index.css               # Tailwind CSS v4, thème sombre/clair, utilitaires
    ├── main.tsx                # Montage React + i18n
    └── components/
        ├── AquaMindAssistant.tsx   # Chat IA « Demandez à AquaMind » (/api/chat)
        ├── DashboardDemo.tsx       # Cockpit IoT temps réel Recharts + simulation fuite
        ├── DemoForm.tsx            # Formulaire validé par Zod (/api/demo-request)
        ├── MagneticButton.tsx      # Bouton magnétique avec effet ripple
        ├── Navbar.tsx              # Navbar flottante, sélecteur langue & thème
        ├── Preloader.tsx           # Écran de chargement goutte 0–100 %
        ├── SectorCards.tsx         # Cartes secteurs avec icônes 3D isométriques
        ├── TestimonialsSlider.tsx  # Carrousel fluide tactile & clavier
        ├── TiltFeatureCards.tsx    # Cartes fonctionnalités avec tilt 3D
        ├── WaterCanvas3D.tsx       # Scène 3D persistante Three.js
        └── WaterCursor.tsx         # Curseur personnalisé cercle d'eau (desktop)
```

---

## Déploiement

### Google Cloud Run
```bash
npm run build
NODE_ENV=production PORT=3000 npm run start
```
Configurez `GEMINI_API_KEY` dans les variables d'environnement / secrets du service Cloud Run.

### Render / Railway / Fly.io
- **Build Command** : `npm install && npm run build`
- **Start Command** : `NODE_ENV=production npm run start`
- **Environment Variable** : `GEMINI_API_KEY`

### Vercel
Pour un déploiement serverless sur Vercel, exposez `src/App.tsx` via le build statique (`npm run build` → `dist/`) et déployez les handlers `/api/chat` et `/api/demo-request` en Vercel Functions dans `api/`.
