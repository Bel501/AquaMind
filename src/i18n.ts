import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type SupportedLocale = 'fr' | 'en' | 'ar';

const resources = {
  fr: {
    translation: {
      skipLink: 'Aller au contenu principal',
      preloaderLabel: 'Initialisation AquaMind',
      nav: {
        problem: 'Enjeux',
        how: 'Fonctionnement',
        features: 'Capacités',
        dashboard: 'Plateforme',
        assistant: 'Assistant IA',
        sectors: 'Secteurs',
        cta: 'Demander une démo',
        themeLight: 'Passer en mode clair',
        themeDark: 'Passer en mode sombre',
        openMenu: 'Ouvrir le menu',
        closeMenu: 'Fermer le menu',
      },
      hero: {
        kicker: 'Intelligence hydrique · IoT & séries temporelles',
        title: "L'eau, enfin sous contrôle.",
        subtitle:
          'IA prédictive et capteurs IoT pour irriguer juste et traquer chaque fuite.',
        ctaPrimary: 'Demander une démo',
        ctaSecondary: 'Voir comment ça marche',
        explore: 'EXPLORER',
        brandSub: "Gestion intelligente de l'eau",
        pillars: [
          { key: 'save', label: "Économiser l'eau" },
          { key: 'optimize', label: "Optimiser l'irrigation" },
          { key: 'detect', label: 'Détecter les fuites' },
          { key: 'costs', label: 'Réduire les coûts' },
        ],
      },
      architecture: {
        platformTitle: 'AquaMind Platform',
        platformSub: 'Architecture fonctionnelle du produit',
        sources: [
          {
            id: 'sites',
            title: 'Exploitation agricole / Hôtel / Industrie',
            subtitle: 'Sites, parcelles, équipements et compteurs',
          },
          {
            id: 'iot',
            title: 'IoT Sensors',
            subtitle: 'Humidité, débit, pression, température',
          },
          {
            id: 'external',
            title: 'External Data',
            subtitle: 'Météo, pluie, vent, évapotranspiration ET₀',
          },
        ],
        engineTitle: 'AquaMind AI Engine',
        engineSub: 'Machine Learning · Time Series · Anomaly Detection · Optimization',
        modules: [
          {
            id: 'irrigation',
            title: 'Irrigation AI',
            subtitle: 'Quand et combien irriguer ?',
            detail:
              'Modèles d’évapotranspiration et d’humidité racinaire calculant la dose optimale par parcelle avant stress hydrique.',
          },
          {
            id: 'leak',
            title: 'Leak Detection',
            subtitle: 'Fuites et anomalies',
            detail:
              'Comparaison continue entre débit réel et signature temporelle attendue pour isoler toute surconsommation en < 4 minutes.',
          },
          {
            id: 'forecast',
            title: 'Consumption Forecast',
            subtitle: 'Prévisions de consommation',
            detail:
              'Séries temporelles multi-horizons (24h à 7 jours) avec bande de confiance adaptative par site et saisonnalité.',
          },
          {
            id: 'optimization',
            title: 'Optimization',
            subtitle: "Économies d'eau et coûts",
            detail:
              'Arbitrage automatique des plages horaires, pompage hors pointe et pilotage des vannes pour économiser 20 à 40 %.',
          },
        ],
        bridgeTitle: 'Dashboard Web + Application Mobile',
        bridgeSubtitle: 'Alertes, recommandations, rapports et pilotage',
      },
      problem: {
        kicker: 'Le constat',
        line1: 'Chaque mètre cube gaspillé pèse',
        line2Prefix: 'sur vos rendements et',
        line2Highlight: 'vos marges opérationnelles.',
        stat1: "d'eau perdue en moyenne par sur-irrigation ou réseaux non monitorés.",
        stat2: 'délai moyen avant de repérer une fuite souterraine sans télémétrie IA.',
        stat3: 'de surcoût énergétique et hydrique évitable sur une saison complète.',
      },
      how: {
        kicker: 'Architecture en 3 temps',
        titlePrefix: 'De la donnée brute à',
        titleHighlight: "l'action autonome.",
        steps: [
          {
            index: '01',
            kicker: 'Acquisition continue',
            title: 'Capteurs et météo hyperlocale',
            description:
              "Nos sondes LoRaWAN mesurent humidité racinaire, pression, débit et salinité en continu, enrichies par les prévisions satellites et d'évapotranspiration.",
            meta: 'Sondes IoT · Débitmètres · Météo J+10',
          },
          {
            index: '02',
            kicker: 'Intelligence temporelle',
            title: 'Modèles ML et séries temporelles',
            description:
              'Nos réseaux neuronaux temporels modélisent la signature hydrique de chaque parcelle ou bâtiment pour prédire les besoins et isoler la moindre anomalie.',
            meta: 'Séries temporelles · Détection d’écarts · Score de risque',
          },
          {
            index: '03',
            kicker: 'Exécution précise',
            title: 'Décisions automatisées',
            description:
              "AquaMind ajuste vos électrovannes à la minute près et déclenche une alerte géolocalisée avec coupure ciblée dès qu'une fuite apparaît.",
            meta: 'Pilotage vannes · Alertes < 4 min · API & SCADA',
          },
        ],
      },
      features: {
        kicker: 'Capacités clés',
        titlePrefix: 'Une précision chirurgicale sur',
        titleHighlight: 'chaque litre.',
        subtitle:
          'Conçu pour les exploitations exigeantes, les infrastructures hôtelières et les réseaux industriels critiques.',
        items: [
          {
            title: 'Prédiction des besoins en irrigation',
            description:
              'Anticipation à 7 jours du stress hydrique par zone selon le sol, la culture et la météo réelle.',
          },
          {
            title: "Détection d'anomalies et de fuites",
            description:
              'Identification des surconsommations nocturnes, ruptures progressives et dérives de vannes invisibles.',
          },
          {
            title: "Optimisation de l'irrigation",
            description:
              "Calendriers dynamiques recalibrés automatiquement selon les heures creuses et l'évapotranspiration.",
          },
          {
            title: 'Alertes en temps réel',
            description:
              'Notifications multicanales instantanées (SMS, application, webhook industriel) avec localisation exacte du tronçon.',
          },
          {
            title: 'Tableau de bord unifié',
            description:
              'Cockpit multi-sites pour piloter parcelles, hôtels et lignes industrielles avec rapports RSE et empreinte hydrique.',
          },
        ],
      },
      dashboard: {
        kicker: 'Cockpit temps réel',
        titlePrefix: 'Votre tour de contrôle',
        titleHighlight: 'en temps réel.',
        subtitle:
          'Observez la télémétrie IoT en direct, la bande de prédiction ML, et simulez une fuite pour tester la réactivité du modèle.',
        liveStatus: 'Flux IoT actif · Mise à jour 2s',
        simulateLeak: 'Simuler une fuite',
        stopLeak: 'Résoudre la fuite',
        leakActiveBadge: 'Fuite active détectée · Alerte critique',
        legendReal: 'Débit réel (m³/h)',
        legendPred: 'Prédiction ML',
        legendBand: 'Bande de confiance',
        sensors: {
          moisture: 'Humidité sol',
          flow: 'Débit instantané',
          pressure: 'Pression réseau',
          weather: 'Météo & ET0',
        },
        alertTitle: 'Détection anomalie & fuite',
        alertNominal: 'Aucune dérive détectée sur le réseau. Débit conforme à la signature ML.',
        alertLeak:
          'Rupture / surdébit critique (+44 % vs prédiction) détecté sur Secteur B2. Perte estimée : 1 420 L/h.',
        recoTitle: "Recommandation d'irrigation IA",
        recoApply: "Appliquer le plan d'irrigation",
        recoApplied: 'Plan appliqué aux électrovannes',
        whenLabel: 'Quand',
        volumeLabel: 'Volume',
        zoneLabel: 'Zone ciblée',
        bridgeTitle: 'Dashboard Web + Application Mobile',
        bridgeSubtitle: 'Alertes, recommandations, rapports et pilotage',
        featuresPanelTitle: 'Fonctionnalités clés',
        featuresList: [
          {
            title: 'Machine Learning et séries temporelles',
            sub: '(prévision, apprentissage, adaptation)',
          },
          {
            title: 'Capteurs IoT',
            sub: '(mesure en temps réel et supervision)',
          },
          {
            title: 'Données météorologiques',
            sub: '(prévisions, pluie, vent, évapotranspiration)',
          },
          {
            title: 'Détection de fuites',
            sub: '(anomalies et surconsommations)',
          },
          {
            title: "Optimisation de l'irrigation",
            sub: '(besoin réel, dose et planning)',
          },
        ],
        targetsPanelTitle: 'Clients cibles',
        targetsList: [
          {
            mode: 'agri',
            title: 'Exploitations agricoles',
            sub: 'Irrigation précise, rendements et gestion durable',
          },
          {
            mode: 'hotel',
            title: 'Hôtels',
            sub: 'Maîtrise de la consommation (jardins, piscines, espaces verts)',
          },
          {
            mode: 'industry',
            title: 'Industriels',
            sub: 'Suivi continu, détection de fuites et réduction des coûts',
          },
        ],
        benefitsPanelTitle: 'Bénéfices clés',
        benefitsList: [
          "–20 % à –40 % de consommation d'eau",
          'Détection rapide des fuites',
          'Irrigation plus efficace et automatisée',
          "Réduction des coûts d'exploitation",
          'Gestion multi-sites et multi-utilisateurs',
        ],
        kpiToday: "Consommation aujourd'hui",
        kpiSavings: "Économie d'eau",
        kpiLeaks: 'Fuites détectées',
        kpiReco: 'Irrigation recommandée',
        parcelTitle: 'Cartographie réseau & capteurs',
        chartTitle: 'Prévision de consommation (7 jours)',
        sidebar: {
          overview: 'Tableau de bord',
          irrigation: 'Irrigation',
          consumption: 'Consommation',
          leaks: 'Fuites & alertes',
          reports: 'Rapports',
          settings: 'Paramètres',
        },
        mobileTabs: {
          home: 'Accueil',
          alerts: 'Alertes',
          irrigation: 'Irrigation',
          reports: 'Rapports',
        },
      },
      sectors: {
        kicker: "Secteurs d'application",
        titlePrefix: 'Taillé pour vos',
        titleHighlight: 'contraintes terrain.',
        cta: 'Simuler dans le cockpit',
        items: [
          {
            mode: 'agri',
            title: 'Agriculture',
            description:
              'Pilotage parcellaire du goutte-à-goutte selon le stress hydrique racinaire, les stades de culture et les prévisions météo.',
            metric: '-32 %',
            metricDetail: "d'eau d'irrigation · +14 % d'homogénéité",
          },
          {
            mode: 'hotel',
            title: 'Hôtellerie',
            description:
              'Surveillance silencieuse des chambres, spas, piscines et arrosages paysagers pour stopper les fuites nocturnes.',
            metric: '-25 %',
            metricDetail: 'sur la facture hydrique · ROI en 4 mois',
          },
          {
            mode: 'industry',
            title: 'Industrie',
            description:
              'Contrôle continu des boucles de refroidissement, eaux de process et stations de traitement avant toute dérive.',
            metric: '99,4 %',
            metricDetail: 'de disponibilité réseau sans arrêt imprévu',
          },
        ],
      },
      results: {
        items: [
          {
            prefix: "Jusqu'à -",
            target: 30,
            suffix: ' %',
            desc: "de consommation d'eau dès la première année d'exploitation",
          },
          {
            prefix: '< ',
            target: 4,
            suffix: ' min',
            desc: 'pour détecter et géolocaliser une fuite active sur le réseau',
          },
          {
            prefix: '',
            target: 96,
            suffix: ' %',
            desc: 'de précision prédictive des séries temporelles à horizon 7 jours',
          },
          {
            prefix: '+',
            target: 180,
            suffix: '',
            desc: 'sites agricoles, hôteliers et industriels connectés en continu',
          },
        ],
      },
      assistant: {
        kicker: 'Intelligence conversationnelle',
        titlePrefix: 'Demandez à',
        titleHighlight: 'AquaMind.',
        subtitle:
          "Posez vos questions sur l'irrigation prédictive, la détection de fuites ou le dimensionnement IoT sur votre site.",
        placeholder: 'Ex. Comment détecter une fuite nocturne dans un hôtel ?',
        send: 'Envoyer',
        thinking: 'Analyse en cours…',
        fallbackNotice:
          "Mode hors-ligne actif : le serveur Gemini n'est pas joignable actuellement. Réponse générée depuis la base de connaissances AquaMind.",
        suggestions: [
          "Comment prédisez-vous les besoins d'irrigation à 7 jours ?",
          'Comment détecter une fuite souterraine sans casser les sols ?',
          'Quel ROI pour un domaine viticole de 150 hectares ?',
          'Quels capteurs IoT sont compatibles avec AquaMind ?',
        ],
      },
      testimonials: {
        kicker: 'Retours terrain',
        titlePrefix: 'Ils pilotent déjà',
        titleHighlight: 'chaque goutte.',
        prev: 'Témoignage précédent',
        next: 'Témoignage suivant',
      },
      contact: {
        kicker: "Passer à l'action",
        titlePrefix: 'Prêt à reprendre',
        titleHighlight: 'le contrôle ?',
        subtitle:
          'Planifiez une démonstration personnalisée avec nos ingénieurs hydrauliques et data scientists sur vos propres données.',
        perks: [
          "Audit rapide de potentiel d'économie sous 48h",
          'Compatible compteurs, automates et sondes existants',
          "Déploiement pilote sans interruption d'activité",
        ],
        form: {
          nameLabel: 'Nom complet',
          namePlaceholder: 'Camille Laurent',
          companyLabel: 'Entreprise / Exploitation',
          companyPlaceholder: 'Domaine des Roches',
          sectorLabel: 'Secteur',
          sectorPlaceholder: 'Choisir un secteur',
          sectorOptions: {
            agriculture: 'Exploitation agricole',
            hotellerie: 'Hôtellerie & Resort',
            industrie: 'Industrie',
            autre: 'Collectivité / Autre',
          },
          emailLabel: 'Email professionnel',
          emailPlaceholder: 'camille@entreprise.fr',
          messageLabel: 'Votre besoin ou surface / débit',
          messagePlaceholder: 'Précisez vos parcelles, bâtiments ou objectifs de réduction...',
          submit: 'Demander ma démonstration',
          submitting: 'Envoi en cours…',
          successPrefix: 'Merci',
          successBody: 'Votre demande pour {{company}} est enregistrée. Un ingénieur AquaMind vous contactera sous 24h ouvrées.',
          errors: {
            nameMin: 'Nom requis (2 caractères min.).',
            nameMax: 'Nom trop long (120 caractères max.).',
            companyMin: 'Entreprise requise (2 caractères min.).',
            companyMax: "Nom d'entreprise trop long (160 caractères max.).",
            sectorInvalid: 'Veuillez sélectionner un secteur.',
            emailInvalid: 'Adresse email professionnelle invalide.',
            messageMin: 'Précisez votre besoin en quelques mots (10 caractères min.).',
            messageMax: 'Message trop long (1500 caractères max.).',
            serverFallback: "Une erreur est survenue lors de l'envoi.",
            networkFallback: 'Impossible de joindre le serveur. Veuillez réessayer.',
          },
        },
      },
      footer: {
        slogan: "— L'eau, enfin sous contrôle.",
        rights: '© 2026 AquaMind. Tous droits réservés.',
      },
    },
  },
  en: {
    translation: {
      skipLink: 'Skip to main content',
      preloaderLabel: 'Initializing AquaMind',
      nav: {
        problem: 'Challenges',
        how: 'How it works',
        features: 'Capabilities',
        dashboard: 'Platform',
        assistant: 'AI Assistant',
        sectors: 'Sectors',
        cta: 'Request demo',
        themeLight: 'Switch to light mode',
        themeDark: 'Switch to dark mode',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
      },
      hero: {
        kicker: 'Water intelligence · IoT & time-series ML',
        title: 'Water, finally under control.',
        subtitle:
          'Predictive AI and IoT sensors to irrigate accurately and track down every leak.',
        ctaPrimary: 'Request a demo',
        ctaSecondary: 'See how it works',
        explore: 'EXPLORE',
        brandSub: 'Smart water intelligence',
        pillars: [
          { key: 'save', label: 'Save water' },
          { key: 'optimize', label: 'Optimize irrigation' },
          { key: 'detect', label: 'Detect leaks' },
          { key: 'costs', label: 'Cut operating costs' },
        ],
      },
      architecture: {
        platformTitle: 'AquaMind Platform',
        platformSub: 'Functional product architecture',
        sources: [
          {
            id: 'sites',
            title: 'Farm / Hotel / Industrial Site',
            subtitle: 'Sites, plots, equipment & water meters',
          },
          {
            id: 'iot',
            title: 'IoT Sensors',
            subtitle: 'Moisture, flow, pressure, temperature',
          },
          {
            id: 'external',
            title: 'External Data',
            subtitle: 'Weather, rainfall, wind, evapotranspiration ET₀',
          },
        ],
        engineTitle: 'AquaMind AI Engine',
        engineSub: 'Machine Learning · Time Series · Anomaly Detection · Optimization',
        modules: [
          {
            id: 'irrigation',
            title: 'Irrigation AI',
            subtitle: 'When & how much to irrigate?',
            detail:
              'Evapotranspiration and root-zone moisture models calculating the exact dose per plot before water stress occurs.',
          },
          {
            id: 'leak',
            title: 'Leak Detection',
            subtitle: 'Leaks & anomalies',
            detail:
              'Continuous comparison between real flow and expected temporal signature to isolate excess consumption in < 4 min.',
          },
          {
            id: 'forecast',
            title: 'Consumption Forecast',
            subtitle: 'Demand forecasting',
            detail:
              'Multi-horizon time-series predictions (24h to 7 days) with adaptive confidence bands per site.',
          },
          {
            id: 'optimization',
            title: 'Optimization',
            subtitle: 'Water & cost savings',
            detail:
              'Automated scheduling around off-peak pumping windows and valve control delivering 20%–40% savings.',
          },
        ],
        bridgeTitle: 'Web Dashboard + Mobile App',
        bridgeSubtitle: 'Alerts, recommendations, reports & remote control',
      },
      problem: {
        kicker: 'The challenge',
        line1: 'Every wasted cubic meter weighs',
        line2Prefix: 'on your yields and',
        line2Highlight: 'your operating margins.',
        stat1: 'of water lost on average due to over-irrigation or unmonitored pipelines.',
        stat2: 'average delay before detecting an underground leak without AI telemetry.',
        stat3: 'avoidable water and energy surcharge over a full operating season.',
      },
      how: {
        kicker: '3-stage architecture',
        titlePrefix: 'From raw telemetry to',
        titleHighlight: 'autonomous action.',
        steps: [
          {
            index: '01',
            kicker: 'Continuous sensing',
            title: 'Sensors & hyperlocal weather',
            description:
              'LoRaWAN probes continuously measure root-zone moisture, pressure, flow, and salinity, enriched by satellite and evapotranspiration forecasts.',
            meta: 'IoT Probes · Flowmeters · 10-day Weather',
          },
          {
            index: '02',
            kicker: 'Temporal intelligence',
            title: 'ML models & time series',
            description:
              'Temporal neural models learn the hydraulic signature of each plot or building to forecast demand and isolate any anomaly.',
            meta: 'Time Series · Anomaly Scoring · Risk Index',
          },
          {
            index: '03',
            kicker: 'Precision execution',
            title: 'Automated decisions',
            description:
              'AquaMind schedules solenoid valves down to the minute and triggers geo-localized alerts with targeted shutoff whenever a leak occurs.',
            meta: 'Valve Control · Alerts < 4 min · API & SCADA',
          },
        ],
      },
      features: {
        kicker: 'Core capabilities',
        titlePrefix: 'Surgical precision on',
        titleHighlight: 'every liter.',
        subtitle:
          'Built for high-performing farms, hospitality resorts, and mission-critical industrial facilities.',
        items: [
          {
            title: 'Irrigation demand forecasting',
            description:
              '7-day crop water stress prediction per zone based on soil, phenology, and real weather.',
          },
          {
            title: 'Anomaly & leak detection',
            description:
              'Pinpoint overnight excess flow, progressive pipe ruptures, and silent valve drifts.',
          },
          {
            title: 'Dynamic irrigation optimization',
            description:
              'Schedules automatically recalibrated around off-peak energy windows and evapotranspiration.',
          },
          {
            title: 'Real-time alerts',
            description:
              'Instant multi-channel alerts (SMS, mobile app, industrial webhook) with exact segment pinpointing.',
          },
          {
            title: 'Unified control cockpit',
            description:
              'Multi-site dashboard for plots, hotels, and cooling loops with ESG water-footprint reporting.',
          },
        ],
      },
      dashboard: {
        kicker: 'Live cockpit',
        titlePrefix: 'Your control tower',
        titleHighlight: 'in real time.',
        subtitle:
          'Monitor live IoT telemetry, ML confidence bands, and trigger a leak simulation to test instant anomaly response.',
        liveStatus: 'Live IoT stream · 2s tick',
        simulateLeak: 'Simulate a leak',
        stopLeak: 'Resolve leak',
        leakActiveBadge: 'Active leak detected · Critical alert',
        legendReal: 'Actual flow (m³/h)',
        legendPred: 'ML forecast',
        legendBand: 'Confidence band',
        sensors: {
          moisture: 'Soil moisture',
          flow: 'Live flow rate',
          pressure: 'Line pressure',
          weather: 'Weather & ET0',
        },
        alertTitle: 'Anomaly & leak monitor',
        alertNominal: 'No drift detected. Flow remains within the expected ML confidence envelope.',
        alertLeak:
          'Critical surge (+44% above forecast) detected on Sector B2. Estimated loss: 1,420 L/h.',
        recoTitle: 'AI irrigation recommendation',
        recoApply: 'Apply irrigation schedule',
        recoApplied: 'Schedule synced to valves',
        whenLabel: 'When',
        volumeLabel: 'Volume',
        zoneLabel: 'Target zone',
        bridgeTitle: 'Web Dashboard + Mobile App',
        bridgeSubtitle: 'Alerts, recommendations, reports & remote control',
        featuresPanelTitle: 'Core Capabilities',
        featuresList: [
          {
            title: 'Machine Learning & Time Series',
            sub: '(forecasting, learning, adaptation)',
          },
          {
            title: 'IoT Sensors',
            sub: '(real-time metering & supervision)',
          },
          {
            title: 'Weather & Climate Data',
            sub: '(forecasts, rain, wind, ET₀)',
          },
          {
            title: 'Leak Detection',
            sub: '(anomalies & excess flow)',
          },
          {
            title: 'Irrigation Optimization',
            sub: '(actual crop need, dose & schedule)',
          },
        ],
        targetsPanelTitle: 'Target Clients',
        targetsList: [
          {
            mode: 'agri',
            title: 'Farms & Estates',
            sub: 'Precision irrigation, yields & sustainable management',
          },
          {
            mode: 'hotel',
            title: 'Hotels & Resorts',
            sub: 'Control consumption across gardens, pools & green spaces',
          },
          {
            mode: 'industry',
            title: 'Industrial Facilities',
            sub: 'Continuous monitoring, leak detection & cost reduction',
          },
        ],
        benefitsPanelTitle: 'Key Benefits',
        benefitsList: [
          '–20% to –40% water consumption',
          'Rapid leak detection',
          'Smarter automated irrigation',
          'Lower operating expenses',
          'Multi-site & multi-user management',
        ],
        kpiToday: "Today's consumption",
        kpiSavings: 'Water saved',
        kpiLeaks: 'Leaks detected',
        kpiReco: 'Recommended irrigation',
        parcelTitle: 'Site & sensor telemetry map',
        chartTitle: 'Consumption forecast (7 days)',
        sidebar: {
          overview: 'Dashboard',
          irrigation: 'Irrigation',
          consumption: 'Consumption',
          leaks: 'Leaks & alerts',
          reports: 'Reports',
          settings: 'Settings',
        },
        mobileTabs: {
          home: 'Home',
          alerts: 'Alerts',
          irrigation: 'Irrigation',
          reports: 'Reports',
        },
      },
      sectors: {
        kicker: 'Target industries',
        titlePrefix: 'Engineered for your',
        titleHighlight: 'field constraints.',
        cta: 'Simulate in cockpit',
        items: [
          {
            mode: 'agri',
            title: 'Agriculture',
            description:
              'Plot-level drip irrigation driven by root-zone water stress, crop stage, and local weather.',
            metric: '-32 %',
            metricDetail: 'irrigation water · +14% yield uniformity',
          },
          {
            mode: 'hotel',
            title: 'Hospitality',
            description:
              'Silent monitoring of guest rooms, spas, pools, and landscaping to eliminate overnight leaks.',
            metric: '-25 %',
            metricDetail: 'water bill reduction · 4-month ROI',
          },
          {
            mode: 'industry',
            title: 'Industry',
            description:
              'Continuous supervision of cooling loops, process water, and treatment units before drift escalates.',
            metric: '99.4 %',
            metricDetail: 'network uptime without unplanned stops',
          },
        ],
      },
      results: {
        items: [
          {
            prefix: 'Up to -',
            target: 30,
            suffix: ' %',
            desc: 'water consumption savings in the very first year',
          },
          {
            prefix: '< ',
            target: 4,
            suffix: ' min',
            desc: 'to detect and locate an active pipeline leak',
          },
          {
            prefix: '',
            target: 96,
            suffix: ' %',
            desc: 'time-series forecast accuracy on a 7-day horizon',
          },
          {
            prefix: '+',
            target: 180,
            suffix: '',
            desc: 'connected farms, resorts, and industrial sites',
          },
        ],
      },
      assistant: {
        kicker: 'Conversational intelligence',
        titlePrefix: 'Ask',
        titleHighlight: 'AquaMind.',
        subtitle:
          'Ask questions about predictive irrigation, leak detection, or IoT deployment for your facility.',
        placeholder: 'e.g. How can I detect an overnight leak in a resort?',
        send: 'Send',
        thinking: 'Analyzing…',
        fallbackNotice:
          'Offline mode active: Gemini server endpoint is unavailable right now. Answer provided from AquaMind local knowledge base.',
        suggestions: [
          'How do you forecast irrigation needs 7 days ahead?',
          'How can you locate an underground leak without digging?',
          'What ROI can a 150-hectare vineyard expect?',
          'Which IoT meters and probes integrate with AquaMind?',
        ],
      },
      testimonials: {
        kicker: 'Field proof',
        titlePrefix: 'Already controlling',
        titleHighlight: 'every drop.',
        prev: 'Previous testimonial',
        next: 'Next testimonial',
      },
      contact: {
        kicker: 'Get started',
        titlePrefix: 'Ready to take',
        titleHighlight: 'back control?',
        subtitle:
          'Schedule a tailored demonstration with our hydraulic engineers and data scientists using your own profile.',
        perks: [
          'Rapid savings potential audit within 48h',
          'Compatible with existing meters, PLCs, and probes',
          'Zero-downtime pilot deployment',
        ],
        form: {
          nameLabel: 'Full name',
          namePlaceholder: 'Camille Laurent',
          companyLabel: 'Company / Farm',
          companyPlaceholder: 'Domaine des Roches',
          sectorLabel: 'Sector',
          sectorPlaceholder: 'Select a sector',
          sectorOptions: {
            agriculture: 'Agriculture & Vineyards',
            hotellerie: 'Hospitality & Resorts',
            industrie: 'Industrial Facilities',
            autre: 'Municipality / Other',
          },
          emailLabel: 'Work email',
          emailPlaceholder: 'camille@company.com',
          messageLabel: 'Project scope / acreage or flow',
          messagePlaceholder: 'Describe your plots, facilities, or water-saving targets...',
          submit: 'Request my demo',
          submitting: 'Sending…',
          successPrefix: 'Thank you',
          successBody:
            'Your request for {{company}} is confirmed. An AquaMind engineer will reach out within 24 business hours.',
          errors: {
            nameMin: 'Full name is required (min 2 characters).',
            nameMax: 'Name is too long (max 120 characters).',
            companyMin: 'Company or farm name is required (min 2 characters).',
            companyMax: 'Company name is too long (max 160 characters).',
            sectorInvalid: 'Please select a sector.',
            emailInvalid: 'Please enter a valid work email address.',
            messageMin: 'Please describe your needs briefly (min 10 characters).',
            messageMax: 'Message is too long (max 1500 characters).',
            serverFallback: 'An error occurred while submitting your request.',
            networkFallback: 'Unable to reach the server. Please try again.',
          },
        },
      },
      footer: {
        slogan: '— Water, finally under control.',
        rights: '© 2026 AquaMind. All rights reserved.',
      },
    },
  },
  ar: {
    translation: {
      skipLink: 'الانتقال إلى المحتوى الرئيسي',
      preloaderLabel: 'جاري تهيئة AquaMind',
      nav: {
        problem: 'التحديات',
        how: 'آلية العمل',
        features: 'القدرات',
        dashboard: 'المنصة',
        assistant: 'المساعد الذكي',
        sectors: 'القطاعات',
        cta: 'طلب عرض',
        themeLight: 'التبديل إلى الوضع الفاتح',
        themeDark: 'التبديل إلى الوضع الداكن',
        openMenu: 'فتح القائمة',
        closeMenu: 'إغلاق القائمة',
      },
      hero: {
        kicker: 'ذكاء مائي · إنترنت الأشياء والتعلم الآلي الزمني',
        title: 'المياه، تحت السيطرة أخيرًا.',
        subtitle:
          'ذكاء اصطناعي تنبؤي ومستشعرات ذكية للري الدقيق وكشف كل تسرب في الوقت الفعلي.',
        ctaPrimary: 'طلب عرض توضيحي',
        ctaSecondary: 'كيف تعمل المنصة',
        explore: 'استكشف',
        brandSub: 'إدارة ذكية للمياه',
        pillars: [
          { key: 'save', label: 'توفير المياه' },
          { key: 'optimize', label: 'تحسين الري' },
          { key: 'detect', label: 'كشف التسربات' },
          { key: 'costs', label: 'خفض التكاليف' },
        ],
      },
      architecture: {
        platformTitle: 'منصة AquaMind',
        platformSub: 'البنية الوظيفية للمنتج',
        sources: [
          {
            id: 'sites',
            title: 'مزارع / فنادق / صناعة',
            subtitle: 'المواقع والقطع والمعدات والعدادات',
          },
          {
            id: 'iot',
            title: 'مستشعرات IoT',
            subtitle: 'الرطوبة، التدفق، الضغط، الحرارة',
          },
          {
            id: 'external',
            title: 'بيانات خارجية',
            subtitle: 'الطقس، الأمطار، الرياح، التبخر ET₀',
          },
        ],
        engineTitle: 'محرك الذكاء الاصطناعي AquaMind',
        engineSub: 'التعلم الآلي · السلاسل الزمنية · كشف الشذوذ · التحسين',
        modules: [
          {
            id: 'irrigation',
            title: 'Irrigation AI',
            subtitle: 'متى وكم نروي؟',
            detail:
              'نماذج التبخر ورطوبة الجذور لحساب الجرعة المثلى لكل قطعة أرض قبل حدوث الإجهاد المائي.',
          },
          {
            id: 'leak',
            title: 'Leak Detection',
            subtitle: 'التسربات والشذوذ',
            detail:
              'مقارنة مستمرة بين التدفق الفعلي والبصمة الزمنية المتوقعة لعزل أي تسرب خلال أقل من 4 دقائق.',
          },
          {
            id: 'forecast',
            title: 'Consumption Forecast',
            subtitle: 'توقعات الاستهلاك',
            detail:
              'توقعات متعددة الأفق (24 ساعة إلى 7 أيام) مع نطاق ثقة متكيف حسب الموقع والموسم.',
          },
          {
            id: 'optimization',
            title: 'Optimization',
            subtitle: 'توفير المياه والتكاليف',
            detail:
              'جدولة ذكية خارج أوقات الذروة والتحكم بالصمامات لتحقيق وفر من 20 إلى 40%.',
          },
        ],
        bridgeTitle: 'لوحة الويب + تطبيق الهاتف',
        bridgeSubtitle: 'التنبيهات والتوصيات والتقارير والتحكم',
      },
      problem: {
        kicker: 'الواقع الحالي',
        line1: 'كل متر مكعب مهدر يؤثر',
        line2Prefix: 'على محاصيلك و',
        line2Highlight: 'هوامشك التشغيلية.',
        stat1: 'متوسط هدر المياه بسبب الري المفرط أو الشبكات غير المراقبة.',
        stat2: 'متوسط التأخير قبل اكتشاف تسرب تحت الأرض دون قياس ذكي.',
        stat3: 'تكاليف إضافية في الطاقة والمياه يمكن تجنبها خلال موسم كامل.',
      },
      how: {
        kicker: 'هندسة من 3 مراحل',
        titlePrefix: 'من البيانات الخام إلى',
        titleHighlight: 'التحكم الذاتي.',
        steps: [
          {
            index: '01',
            kicker: 'قياس مستمر',
            title: 'مستشعرات وطقس فائق الدقة',
            description:
              'تقيس مجسات LoRaWAN رطوبة الجذور والضغط والتدفق والملوحة باستمرار، مدعومة بتوقعات الأقمار الصناعية والتبخر.',
            meta: 'مجسات IoT · عدادات تدفق · طقس 10 أيام',
          },
          {
            index: '02',
            kicker: 'ذكاء السلاسل الزمنية',
            title: 'نماذج التعلم الآلي الزمنية',
            description:
              'تحلل الشبكات العصبية البصمة المائية لكل قطعة أرض أو مبنى للتنبؤ بالاحتياج وعزل أي شذوذ فورًا.',
            meta: 'سلاسل زمنية · كشف الانحراف · مؤشر المخاطر',
          },
          {
            index: '03',
            kicker: 'تنفيذ دقيق',
            title: 'قرارات مؤتمتة',
            description:
              'يضبط AquaMind الصمامات بدقة متناهية ويرسل تنبيهًا جغرافيًا مع إغلاق مستهدف فور ظهور أي تسرب.',
            meta: 'تحكم بالصمامات · تنبيه < 4 دقائق · API & SCADA',
          },
        ],
      },
      features: {
        kicker: 'القدرات الأساسية',
        titlePrefix: 'دقة فائقة في إدارة',
        titleHighlight: 'كل قطرة ماء.',
        subtitle:
          'مصممة للمزارع المتقدمة والمنتجعات الفندقية والمنشآت الصناعية الحساسة.',
        items: [
          {
            title: 'التنبؤ باحتياجات الري',
            description:
              'توقع الإجهاد المائي قبل 7 أيام حسب التربة ونوع المحصول والطقس الفعلي.',
          },
          {
            title: 'كشف التسربات والشذوذ',
            description:
              'رصد الاستهلاك الليلي غير الطبيعي والكسور التدريجية وانحراف الصمامات الخفي.',
          },
          {
            title: 'تحسين جداول الري',
            description:
              'إعادة ضبط تلقائية لأوقات الري وفق ساعات الطاقة المنخفضة ومعدل التبخر.',
          },
          {
            title: 'تنبيهات فورية',
            description:
              'إشعارات متعددة القنوات مع تحديد الموقع الدقيق للمقطع المتضرر في الشبكة.',
          },
          {
            title: 'لوحة تحكم موحدة',
            description:
              'منصة مركزية لإدارة المزارع والفنادق والخطوط الصناعية مع تقارير الاستدامة.',
          },
        ],
      },
      dashboard: {
        kicker: 'غرفة التحكم الحية',
        titlePrefix: 'برج المراقبة الخاص بك',
        titleHighlight: 'في الوقت الفعلي.',
        subtitle:
          'راقب قياسات IoT الحية ونطاق التنبؤ الذكي، وجرب زر محاكاة التسرب لاختبار سرعة الاستجابة.',
        liveStatus: 'بث IoT مباشر · تحديث كل ثانيتين',
        simulateLeak: 'محاكاة تسرب',
        stopLeak: 'إصلاح التسرب',
        leakActiveBadge: 'تم رصد تسرب نشط · تنبيه حرج',
        legendReal: 'التدفق الفعلي (م³/س)',
        legendPred: 'توقع الذكاء الاصطناعي',
        legendBand: 'نطاق الثقة',
        sensors: {
          moisture: 'رطوبة التربة',
          flow: 'التدفق اللحظي',
          pressure: 'ضغط الشبكة',
          weather: 'الطقس والتبخر',
        },
        alertTitle: 'مراقبة التسربات والشذوذ',
        alertNominal: 'لا يوجد انحراف. التدفق مطابق لنطاق التوقع الذكي.',
        alertLeak:
          'ارتفاع حرج (+44% فوق التوقع) في القطاع B2. الهدر المقدر: 1,420 لتر/ساعة.',
        recoTitle: 'توصية الري الذكية',
        recoApply: 'تطبيق خطة الري',
        recoApplied: 'تم تفعيل الخطة على الصمامات',
        whenLabel: 'التوقيت',
        volumeLabel: 'الكمية',
        zoneLabel: 'المنطقة المستهدفة',
        bridgeTitle: 'لوحة الويب + تطبيق الهاتف',
        bridgeSubtitle: 'التنبيهات والتوصيات والتقارير والتحكم',
        featuresPanelTitle: 'المزايا الرئيسية',
        featuresList: [
          {
            title: 'التعلم الآلي والسلاسل الزمنية',
            sub: '(تنبؤ وتعلم وتكيف مستمر)',
          },
          {
            title: 'مستشعرات IoT',
            sub: '(قياس وإشراف في الوقت الفعلي)',
          },
          {
            title: 'بيانات الطقس والمناخ',
            sub: '(التوقعات والأمطار والرياح والتبخر)',
          },
          {
            title: 'كشف التسربات',
            sub: '(رصد الشذوذ والاستهلاك الزائد)',
          },
          {
            title: 'تحسين الري',
            sub: '(الاحتياج الفعلي والجرعة والجدولة)',
          },
        ],
        targetsPanelTitle: 'العملاء المستهدفون',
        targetsList: [
          {
            mode: 'agri',
            title: 'المزارع والحقول',
            sub: 'ري دقيق وزيادة الإنتاج وإدارة مستدامة',
          },
          {
            mode: 'hotel',
            title: 'الفنادق والمنتجعات',
            sub: 'التحكم في استهلاك الحدائق والمسابح والمساحات الخضراء',
          },
          {
            mode: 'industry',
            title: 'المنشآت الصناعية',
            sub: 'متابعة مستمرة وكشف التسربات وخفض التكاليف',
          },
        ],
        benefitsPanelTitle: 'الفوائد الأساسية',
        benefitsList: [
          'توفير من 20% إلى 40% من استهلاك المياه',
          'اكتشاف سريع للتسربات',
          'ري أكثر كفاءة وأتمتة',
          'خفض تكاليف التشغيل',
          'إدارة متعددة المواقع والمستخدمين',
        ],
        kpiToday: 'استهلاك اليوم',
        kpiSavings: 'المياه الموفرة',
        kpiLeaks: 'التسربات المكتشفة',
        kpiReco: 'الري الموصى به',
        parcelTitle: 'خريطة الشبكة والمستشعرات',
        chartTitle: 'توقعات الاستهلاك (7 أيام)',
        sidebar: {
          overview: 'لوحة التحكم',
          irrigation: 'الري',
          consumption: 'الاستهلاك',
          leaks: 'التسربات والتنبيهات',
          reports: 'التقارير',
          settings: 'الإعدادات',
        },
        mobileTabs: {
          home: 'الرئيسية',
          alerts: 'التنبيهات',
          irrigation: 'الري',
          reports: 'التقارير',
        },
      },
      sectors: {
        kicker: 'القطاعات المستهدفة',
        titlePrefix: 'مصممة لتلائم',
        titleHighlight: 'تحديات الميدان.',
        cta: 'محاكاة في لوحة التحكم',
        items: [
          {
            mode: 'agri',
            title: 'الزراعة',
            description:
              'إدارة دقيقة للري بالتنقيط حسب الإجهاد المائي للجذور ومراحل النمو والطقس.',
            metric: '-32 %',
            metricDetail: 'من مياه الري · +14% تجانس الإنتاج',
          },
          {
            mode: 'hotel',
            title: 'الضيافة والفنادق',
            description:
              'مراقبة صامتة للغرف والمنتجعات والمسابح والحدائق لإيقاف التسربات الليلية.',
            metric: '-25 %',
            metricDetail: 'توفير الفاتورة المائية · عائد خلال 4 أشهر',
          },
          {
            mode: 'industry',
            title: 'الصناعة',
            description:
              'إشراف مستمر على دوائر التبريد ومياه العمليات قبل تفاقم أي خلل.',
            metric: '99.4 %',
            metricDetail: 'جاهزية الشبكة دون توقف مفاجئ',
          },
        ],
      },
      results: {
        items: [
          {
            prefix: 'حتى -',
            target: 30,
            suffix: ' %',
            desc: 'توفير في استهلاك المياه منذ السنة التشغيلية الأولى',
          },
          {
            prefix: '< ',
            target: 4,
            suffix: ' د',
            desc: 'لاكتشاف وتحديد موقع أي تسرب نشط في الشبكة',
          },
          {
            prefix: '',
            target: 96,
            suffix: ' %',
            desc: 'دقة التنبؤ بالسلاسل الزمنية لأفق 7 أيام',
          },
          {
            prefix: '+',
            target: 180,
            suffix: '',
            desc: 'موقعًا زراعيًا وفندقيًا وصناعيًا متصلًا باستمرار',
          },
        ],
      },
      assistant: {
        kicker: 'المساعد التفاعلي',
        titlePrefix: 'اسأل',
        titleHighlight: 'AquaMind.',
        subtitle:
          'اطرح أسئلتك حول الري التنبؤي أو كشف التسربات أو تجهيز المستشعرات لموقعك.',
        placeholder: 'مثال: كيف نكتشف تسربًا ليليًا في فندق؟',
        send: 'إرسال',
        thinking: 'جاري التحليل…',
        fallbackNotice:
          'الوضع المحلي نشط: خادم Gemini غير متاح حاليًا. تم توليد الإجابة من قاعدة معرفة AquaMind.',
        suggestions: [
          'كيف تتنبؤون باحتياجات الري قبل 7 أيام؟',
          'كيف تحددون مكان تسرب تحت الأرض دون تكسير؟',
          'ما العائد المتوقع لمزرعة مساحتها 150 هكتارًا؟',
          'ما هي مستشعرات IoT المتوافقة مع AquaMind؟',
        ],
      },
      testimonials: {
        kicker: 'آراء العملاء',
        titlePrefix: 'يديرون بالفعل',
        titleHighlight: 'كل قطرة.',
        prev: 'الشهادة السابقة',
        next: 'الشهادة التالية',
      },
      contact: {
        kicker: 'ابدأ الآن',
        titlePrefix: 'هل أنت مستعد',
        titleHighlight: 'لاستعادة السيطرة؟',
        subtitle:
          'احجز عرضًا مخصصًا مع مهندسي الهيدروليك وعلماء البيانات لدينا استنادًا إلى معطيات موقعك.',
        perks: [
          'تدقيق سريع لإمكانات التوفير خلال 48 ساعة',
          'متوافق مع العدادات والمستشعرات الحالية',
          'تشغيل تجريبي دون إيقاف النشاط',
        ],
        form: {
          nameLabel: 'الاسم الكامل',
          namePlaceholder: 'كريم المنصور',
          companyLabel: 'الشركة / المزرعة',
          companyPlaceholder: 'مزارع الواحة',
          sectorLabel: 'القطاع',
          sectorPlaceholder: 'اختر القطاع',
          sectorOptions: {
            agriculture: 'الزراعة والمزارع',
            hotellerie: 'الفنادق والمنتجعات',
            industrie: 'الصناعة',
            autre: 'قطاع عام / آخر',
          },
          emailLabel: 'البريد المهني',
          emailPlaceholder: 'karim@company.com',
          messageLabel: 'تفاصيل المشروع أو المساحة',
          messagePlaceholder: 'اذكر المساحة أو المباني أو أهداف تقليل الاستهلاك...',
          submit: 'طلب العرض التوضيحي',
          submitting: 'جاري الإرسال…',
          successPrefix: 'شكرًا',
          successBody:
            'تم تسجيل طلبك لصالح {{company}}. سيتواصل معك مهندس AquaMind خلال 24 ساعة عمل.',
          errors: {
            nameMin: 'الاسم الكامل مطلوب (حرفان على الأقل).',
            nameMax: 'الاسم طويل جدًا (120 حرفًا كحد أقصى).',
            companyMin: 'اسم الشركة أو المزرعة مطلوب (حرفان على الأقل).',
            companyMax: 'اسم الشركة طويل جدًا (160 حرفًا كحد أقصى).',
            sectorInvalid: 'يرجى اختيار القطاع.',
            emailInvalid: 'عنوان البريد المهني غير صالح.',
            messageMin: 'يرجى توضيح احتياجك بإيجاز (10 أحرف على الأقل).',
            messageMax: 'الرسالة طويلة جدًا (1500 حرف كحد أقصى).',
            serverFallback: 'حدث خطأ أثناء إرسال الطلب.',
            networkFallback: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
          },
        },
      },
      footer: {
        slogan: '— المياه، تحت السيطرة أخيرًا.',
        rights: '© 2026 AquaMind. جميع الحقوق محفوظة.',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
