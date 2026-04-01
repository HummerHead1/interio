"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Language = "en" | "cs";

const STORAGE_KEY = "interio-language";

// ---------------------------------------------------------------------------
// Translation dictionary
// ---------------------------------------------------------------------------

export const translations = {
  en: {
    // Header / nav
    nav: {
      searchAriaLabel: "Search furniture",
      themeAriaLabel: "Toggle theme",
      langAriaLabel: "Switch to Czech",
      signIn: "Sign in",
      myFavorites: "My Favorites",
      arSession: "AR Session",
      snapToTry: "Snap & Try",
      adminPanel: "Admin Panel",
      signOut: "Sign out",
    },

    // Home page — hero
    hero: {
      eyebrow: "Augmented Reality Furniture",
      headline1: "See it before",
      headline2: "you buy it.",
      subtitle: "Browse furniture from Alza, Bonami & XXXLutz in 3D. Place it in your space with AR before you commit.",
      cta: "Browse Furniture",
      howItWorks: "How it works",
    },

    // Home page — featured section
    featured: {
      eyebrow: "Selection",
      title: "Featured Pieces",
      viewAll: "View all",
    },

    // Home page — how it works
    howItWorks: {
      eyebrow: "Process",
      title: "Three steps to certainty",
      steps: [
        {
          title: "Browse",
          desc: "Explore furniture from Czech stores rendered in interactive 3D",
        },
        {
          title: "Place in AR",
          desc: "Point your camera and see the piece live in your actual room",
        },
        {
          title: "Buy",
          desc: "Go directly to the store page and complete your purchase with confidence",
        },
      ],
    },

    // Home page — CTA section
    cta: {
      eyebrow: "Get Started",
      title: "Ready to redesign your space?",
      subtitle: "No app download needed. Works right in your browser.",
      button: "Start Browsing",
    },

    // Footer
    footer: {
      tagline: "Interio — 3PO642 Product management course prototype",
      credits: "Created by Eldar, Mia, Maria and Dina",
    },

    // Browse page
    browse: {
      title: "Browse Furniture",
      searchPlaceholder: 'Search furniture... e.g. "red chair" or "STEFAN"',
      sortDefault: "Sort",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      clearFilters: "Clear filters",
      clear: "Clear",
      noProducts: "No products match your filters.",
      products: (n: number) => `${n} product${n !== 1 ? "s" : ""}`,
      categories: {
        all: "All",
        chairs: "Chairs",
        sofas: "Sofas",
        beds: "Beds",
        tables: "Tables",
      },
      stores: {
        All: "All",
      },
    },

    // Product page
    product: {
      notFound: "Product not found",
      browseProducts: "Browse products",
      from: "from",
      colour: "Colour",
      width: "Width",
      depth: "Depth",
      height: "Height",
      cm: "cm",
      loadingModel: "Loading 3D model...",
      arRequiresMobile: "AR requires a mobile device with camera",
      viewInAR: "View in AR",
      buyAt: (store: string) => `Buy at ${store}`,
    },

    // AR Session page
    arSession: {
      back: "Back",
      title: "AR Session",
      items: (n: number) => `${n} item${n !== 1 ? "s" : ""}`,
      arrange: "Arrange",
      preview3d: "3D Preview",
      arrangeTitle: "Arrange Your Furniture",
      arrangeHint: 'Drag items to position them. Tap an item to select it, then use the rotation buttons. When ready, tap "Preview 3D" to see the combined scene.',
      total: "Total",
      itemsCombined: (n: number) => `${n} items combined`,
      preview3dHint: 'All items in one scene. Rotate to inspect. Tap "View in AR" to place this entire arrangement in your room. Go back to "Arrange" to adjust positions.',
      combineError: "Failed to combine models. Try again.",
      combining: "Combining...",
      preview3dAR: "Preview 3D & AR",
      rearrange: "Rearrange",
      viewAllInAR: "View All in AR",
      loadingScene: "Loading 3D scene...",
      notLoggedInTitle: "Sign in to use AR Session",
      notLoggedInSubtitle: "Save furniture to favorites, then place them all in your room.",
      noItemsTitle: "No items selected",
      noItemsSubtitle: "Add furniture to your favorites first, then start an AR session.",
      goToFavorites: "Go to Favorites",
      signIn: "Sign in",
    },

    // Favorites page
    favorites: {
      title: "My Favorites",
      arSession: "AR Session",
      cancel: "Cancel",
      selected: (n: number) => `${n} selected`,
      deselectAll: "Deselect all",
      selectAll: "Select all",
      start: "Start",
      empty: "You haven't saved any favorites yet.",
      browseFurniture: "Browse Furniture",
      addMoreHint: "Add more favorites to start a multi-item AR session",
      browseMore: "Browse more furniture",
      notLoggedInTitle: "Sign in to see favorites",
      notLoggedInSubtitle: "Save furniture you love and come back to it later.",
      signIn: "Sign in",
    },

    // Login page
    login: {
      title: "Sign in",
      emailLabel: "Email",
      passwordLabel: "Password",
      submit: "Sign in",
      submitting: "Signing in...",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    },

    // Signup page
    signup: {
      title: "Create account",
      nameLabel: "Name",
      emailLabel: "Email",
      passwordLabel: "Password",
      submit: "Sign up",
      submitting: "Creating account...",
      hasAccount: "Already have an account?",
      signIn: "Sign in",
      checkEmailTitle: "Check your email",
      checkEmailBody: (email: string) => `We sent a confirmation link to ${email}`,
      backToSignIn: "Back to sign in",
    },

    snapToTry: {
      title: "Snap & Try",
      back: "Back",
      signInTitle: "Sign in to use Snap & Try",
      signInDesc: "Take a photo of any furniture and see it in AR in your room.",
      uploadTitle: "Upload a Photo",
      uploadDesc: "Take a picture of furniture you like — from a store, website, or catalog.",
      tapToUpload: "Tap to take or upload a photo",
      photoHint: "JPG, PNG — clear front view works best",
      namePlaceholder: "Name this furniture (e.g. IKEA Armchair)",
      generate: "Generate 3D Model",
      generating: "Submitting...",
      myScans: "My Scanned Models",
      noScans: "No scans yet. Upload a photo above to get started.",
      statusProcessing: "Generating...",
      statusReady: "Ready — tap to preview",
      statusFailed: "Failed",
      statusPending: "Pending",
      viewInAR: "View in AR",
    },
  },

  cs: {
    // Záhlaví / navigace
    nav: {
      searchAriaLabel: "Hledat nábytek",
      themeAriaLabel: "Přepnout motiv",
      langAriaLabel: "Switch to English",
      signIn: "Přihlásit se",
      myFavorites: "Moje oblíbené",
      arSession: "AR relace",
      snapToTry: "Vyfotit a vyzkoušet",
      adminPanel: "Administrace",
      signOut: "Odhlásit se",
    },

    // Domovská stránka — hero
    hero: {
      eyebrow: "Nábytek v rozšířené realitě",
      headline1: "Uvidíte ho dřív,",
      headline2: "než ho koupíte.",
      subtitle: "Prohlédněte si nábytek z Alzy, Bonami a XXXLutz ve 3D. Umístěte ho do svého pokoje pomocí AR ještě před nákupem.",
      cta: "Procházet nábytek",
      howItWorks: "Jak to funguje",
    },

    // Domovská stránka — výběr
    featured: {
      eyebrow: "Výběr",
      title: "Doporučené kousky",
      viewAll: "Zobrazit vše",
    },

    // Domovská stránka — jak to funguje
    howItWorks: {
      eyebrow: "Postup",
      title: "Tři kroky k jistotě",
      steps: [
        {
          title: "Procházejte",
          desc: "Prozkoumejte nábytek z českých obchodů vykreslený v interaktivním 3D",
        },
        {
          title: "Umístěte v AR",
          desc: "Namiřte kameru a uvidíte kus nábytku přímo ve svém pokoji",
        },
        {
          title: "Nakupte",
          desc: "Přejděte přímo na stránku obchodu a dokončete nákup s jistotou",
        },
      ],
    },

    // Domovská stránka — výzva k akci
    cta: {
      eyebrow: "Začínáme",
      title: "Chcete přetvořit svůj prostor?",
      subtitle: "Žádné stahování aplikace. Funguje přímo v prohlížeči.",
      button: "Začít procházet",
    },

    // Patička
    footer: {
      tagline: "Interio — prototyp pro kurz 3PO642 Product management",
      credits: "Vytvořili Eldar, Mia, Maria a Dina",
    },

    // Stránka procházení
    browse: {
      title: "Procházet nábytek",
      searchPlaceholder: 'Hledat nábytek... např. „červená židle" nebo „STEFAN"',
      sortDefault: "Řadit",
      sortPriceAsc: "Cena: od nejnižší",
      sortPriceDesc: "Cena: od nejvyšší",
      clearFilters: "Zrušit filtry",
      clear: "Zrušit",
      noProducts: "Žádné produkty neodpovídají zvoleným filtrům.",
      products: (n: number) => `${n} produkt${n === 1 ? "" : n >= 2 && n <= 4 ? "y" : "ů"}`,
      categories: {
        all: "Vše",
        chairs: "Židle",
        sofas: "Pohovky",
        beds: "Postele",
        tables: "Stoly",
      },
      stores: {
        All: "Vše",
      },
    },

    // Stránka produktu
    product: {
      notFound: "Produkt nebyl nalezen",
      browseProducts: "Procházet produkty",
      from: "od",
      colour: "Barva",
      width: "Šířka",
      depth: "Hloubka",
      height: "Výška",
      cm: "cm",
      loadingModel: "Načítání 3D modelu...",
      arRequiresMobile: "AR vyžaduje mobilní zařízení s kamerou",
      viewInAR: "Zobrazit v AR",
      buyAt: (store: string) => `Koupit na ${store}`,
    },

    // Stránka AR relace
    arSession: {
      back: "Zpět",
      title: "AR relace",
      items: (n: number) => `${n} ${n === 1 ? "položka" : n >= 2 && n <= 4 ? "položky" : "položek"}`,
      arrange: "Rozmístit",
      preview3d: "3D náhled",
      arrangeTitle: "Rozmístěte nábytek",
      arrangeHint: 'Přetažením rozmístěte položky. Klepnutím vyberte položku a otočte ji. Až budete hotovi, klepněte na „3D náhled".',
      total: "Celkem",
      itemsCombined: (n: number) => `${n} ${n === 1 ? "položka spojena" : n >= 2 && n <= 4 ? "položky spojeny" : "položek spojeno"}`,
      preview3dHint: 'Všechny položky v jedné scéně. Otáčejte pro prohlížení. Klepněte na „Zobrazit v AR" pro umístění v místnosti. Vraťte se na „Rozmístit" pro úpravy.',
      combineError: "Nepodařilo se spojit modely. Zkuste to znovu.",
      combining: "Spojuji...",
      preview3dAR: "3D náhled & AR",
      rearrange: "Přeuspořádat",
      viewAllInAR: "Zobrazit vše v AR",
      loadingScene: "Načítání 3D scény...",
      notLoggedInTitle: "Přihlaste se pro AR relaci",
      notLoggedInSubtitle: "Uložte nábytek do oblíbených a umístěte ho celý do svého pokoje.",
      noItemsTitle: "Žádné položky nevybrány",
      noItemsSubtitle: "Nejprve přidejte nábytek do oblíbených a pak spusťte AR relaci.",
      goToFavorites: "Přejít na oblíbené",
      signIn: "Přihlásit se",
    },

    // Stránka oblíbených
    favorites: {
      title: "Moje oblíbené",
      arSession: "AR relace",
      cancel: "Zrušit",
      selected: (n: number) => `${n} vybráno`,
      deselectAll: "Odznačit vše",
      selectAll: "Vybrat vše",
      start: "Spustit",
      empty: "Zatím jste neuložili žádné oblíbené.",
      browseFurniture: "Procházet nábytek",
      addMoreHint: "Přidejte další oblíbené pro spuštění relace s více položkami",
      browseMore: "Procházet další nábytek",
      notLoggedInTitle: "Přihlaste se pro zobrazení oblíbených",
      notLoggedInSubtitle: "Ukládejte nábytek, který se vám líbí, a vracejte se k němu.",
      signIn: "Přihlásit se",
    },

    // Přihlašovací stránka
    login: {
      title: "Přihlásit se",
      emailLabel: "E-mail",
      passwordLabel: "Heslo",
      submit: "Přihlásit se",
      submitting: "Přihlašuji...",
      noAccount: "Nemáte účet?",
      signUp: "Registrovat se",
    },

    // Stránka registrace
    signup: {
      title: "Vytvořit účet",
      nameLabel: "Jméno",
      emailLabel: "E-mail",
      passwordLabel: "Heslo",
      submit: "Registrovat se",
      submitting: "Vytvářím účet...",
      hasAccount: "Již máte účet?",
      signIn: "Přihlásit se",
      checkEmailTitle: "Zkontrolujte e-mail",
      checkEmailBody: (email: string) => `Odeslali jsme potvrzovací odkaz na adresu ${email}`,
      backToSignIn: "Zpět na přihlášení",
    },

    snapToTry: {
      title: "Vyfotit a vyzkoušet",
      back: "Zpět",
      signInTitle: "Přihlaste se pro Vyfotit a vyzkoušet",
      signInDesc: "Vyfoťte jakýkoli nábytek a prohlédněte si ho v AR ve svém pokoji.",
      uploadTitle: "Nahrajte fotku",
      uploadDesc: "Vyfoťte nábytek, který se vám líbí — z obchodu, webu nebo katalogu.",
      tapToUpload: "Klepněte pro focení nebo nahrání fotky",
      photoHint: "JPG, PNG — nejlépe čelní pohled",
      namePlaceholder: "Pojmenujte nábytek (např. IKEA Křeslo)",
      generate: "Vytvořit 3D model",
      generating: "Odesílám...",
      myScans: "Moje naskenované modely",
      noScans: "Zatím žádné skeny. Nahrajte fotku výše.",
      statusProcessing: "Generuji...",
      statusReady: "Hotovo — klepněte pro náhled",
      statusFailed: "Selhalo",
      statusPending: "Čeká se",
      viewInAR: "Zobrazit v AR",
    },
  },
} as const;

export type Translations = typeof translations.en;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface LanguageContextValue {
  lang: Language;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "cs") setLang(stored);
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Language = prev === "en" ? "cs" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value: LanguageContextValue = {
    lang,
    t: translations[lang] as unknown as Translations,
    toggle,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
