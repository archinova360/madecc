import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeLocalStorageSetItem, safeLocalStorageGetItem } from '../utils/storage';

export interface SEOConfig {
  title: string;
  description: string;
  caption: string;
}

export interface ContentItem {
  id: string;
  type: 'project' | 'insight';
  title: string;
  category: string;
  date: string;
  image: string;
  videoUrl?: string;
  gallery?: { type: 'image' | 'video'; url: string; id: string; size?: number; name?: string }[];
  attachments?: { name: string; url: string; id: string; size?: number }[];
  description?: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  scheduledDate?: string;
  seo: SEOConfig;
}

interface ContentContextType {
  content: ContentItem[];
  addContent: (item: Omit<ContentItem, 'id' | 'date'>) => void;
  updateContent: (item: ContentItem) => void;
  deleteContent: (id: string) => void;
}

const DEFAULT_CONTENT: ContentItem[] = [
  {
    id: '1',
    type: 'project',
    title: 'Centennial Bridge',
    category: 'Infrastructure',
    date: '2023-11-20',
    image: '/src/assets/images/modern_bridge_engineering_1778998225640.png',
    description: 'Multi-modal transport bridge integrating green corridors.',
    status: 'Published',
    gallery: [
      { id: 'g1', type: 'image', url: '/src/assets/images/modern_bridge_engineering_1778998225640.png', name: 'Centennial Bridge Blueprint.png', size: 1048576 }
    ],
    attachments: [
      { id: 'a1', name: 'Centennial_Bridge_FEASIBILITY_STUDY.pdf', url: '/src/assets/images/modern_bridge_engineering_1778998225640.png', size: 2457600 }
    ],
    seo: {
      title: 'Centennial Bridge | MADECC Construction Projects',
      description: 'Explore the Centennial Bridge project, a multi-modal transport hub integrating green corridors and sustainable engineering.',
      caption: 'Green infrastructure landmark in the city center.'
    }
  },
  {
    id: '2',
    type: 'project',
    title: 'Skyline Towers',
    category: 'Commercial',
    date: '2023-12-15',
    image: '/src/assets/images/skyline_towers_construction_1778998242725.png',
    description: '45-story commercial complex with zero-carbon footprint.',
    status: 'Published',
    gallery: [
      { id: 'g2', type: 'image', url: '/src/assets/images/skyline_towers_construction_1778998242725.png', name: 'Skyline Towers Render.png', size: 2097152 }
    ],
    attachments: [
      { id: 'a2', name: 'Skyline_Towers_SOIL_ANALYSIS.pdf', url: '/src/assets/images/skyline_towers_construction_1778998242725.png', size: 1572864 }
    ],
    seo: {
      title: 'Skyline Towers | Sustainable Commercial Hub',
      description: 'The premier zero-carbon office space in the financial district.',
      caption: 'Redefining the metropolitan horizon.'
    }
  },
  {
    id: '3',
    type: 'insight',
    title: 'The Future of Sustainable Urban Concrete',
    category: 'Innovation',
    date: '2023-10-24',
    image: 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    seo: {
      title: 'Sustainable Urban Concrete Trends 2026 | MADECC Insights',
      description: 'Discover how eco-friendly concrete is revolutionizing urban construction and reducing carbon footprints.',
      caption: 'Revolutionizing materials for a greener tomorrow.'
    }
  },
  {
    id: '4',
    type: 'insight',
    title: 'Operational Integrity: The Backbone of MADECC',
    category: 'Corporate',
    date: '2024-03-12',
    image: 'https://images.unsplash.com/photo-1454165833767-13009d300067?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    seo: {
      title: 'MADECC Corporate Governance | Accounting & Admin Excellence',
      description: 'How centralized command and specialized administrative roles like Accountants and Secretaries ensure structural integrity in business.',
      caption: 'Excellence begins in the office, not just on the field.'
    }
  },
  {
    id: 'journal-1',
    type: 'insight',
    title: 'Building in Tropical Climates: Challenges & Solutions',
    category: 'Engineering',
    date: '2024-05-10',
    image: 'https://images.unsplash.com/photo-1449156001931-82833cc74030?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    description: 'In-depth analysis of structural thermal regulation in equatorial zones. This dispatch explores the implementation of high-thermal-mass materials and passive cooling systems in high-density urban environments across tropical latitudes.',
    seo: {
      title: 'Structural Engineering for Tropical Climates | MADECC Dispatches',
      description: 'Technical insights into thermal regulation and structural resilience in equatorial engineering projects.',
      caption: 'Passive cooling and thermal mass optimization.'
    }
  },
  {
    id: 'journal-2',
    type: 'insight',
    title: 'The Rise of Modular Construction in Commercial Real Estate',
    category: 'Trends',
    date: '2024-04-22',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    description: 'The shift from traditional on-site assembly to factory-controlled modular fabrication. Our report details how prefabricated components are reducing deployment timelines by 40% in continental commercial projects.',
    seo: {
      title: 'Modular Construction Trends 2024 | Commercial Real Estate Report',
      description: 'How prefabrication and factory-controlled processes are revolutionizing commercial construction timelines.',
      caption: 'Efficiency through controlled fabrication.'
    }
  },
  {
    id: 'journal-3',
    type: 'insight',
    title: 'Standardizing Safety: Our 2026 OSHA Compliance Report',
    category: 'Policy',
    date: '2024-04-05',
    image: 'https://images.unsplash.com/photo-1503387762-592dea58ef21?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    description: 'A comprehensive review of upcoming regulatory shifts in site safety. MADECC highlights the integration of AI-driven risk assessment and real-time biometric monitoring for high-altitude labor compliance.',
    seo: {
      title: 'Construction Safety Standards 2026 | OSHA Compliance Report',
      description: 'The evolution of site safety through digital monitoring and upcoming regulatory requirements.',
      caption: 'Zero-incident philosophy in the digital age.'
    }
  },
  {
    id: 'journal-4',
    type: 'insight',
    title: 'The Aesthetics of Brutalism in Modern Warehousing',
    category: 'Design',
    date: '2024-03-18',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    description: 'Exploring the resurgence of raw concrete and geometric honesty in large-scale logistics hubs. We examine how brutalist principles are being repurposed for operational clarity in 21st-century warehousing.',
    seo: {
      title: 'Brutalist Architecture in Modern Logistics | Design Philosophy',
      description: 'Why raw materials and geometric simplicity are making a comeback in industrial design.',
      caption: 'Raw honesty in structural expression.'
    }
  },
  {
    id: 'journal-5',
    type: 'insight',
    title: 'Infrastructure as Art: The Philosophy of Civil Works',
    category: 'Philosophy',
    date: '2024-02-28',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2070',
    status: 'Published',
    description: 'Beyond utility—viewing bridges, dams, and highways as cultural artifacts. This piece discusses the responsibility of engineers to create works that inspire as much as they serve.',
    seo: {
      title: 'The Philosophy of Civil Engineering | Infrastructure as Art',
      description: 'Discussing the cultural impact and aesthetic responsibility of large-scale infrastructure projects.',
      caption: 'Engineering as a catalyst for cultural pride.'
    }
  }
];

export interface PageOverrides {
  heroHeading: string;
  heroSubtitle: string;
  missionStatement: string;
  visionStatement: string;
  homeProfileSummary: string;
  corporateHistorySummary: string;
}

const DEFAULT_OVERRIDES: PageOverrides = {
  heroHeading: "Constructing Sustainable Masterpieces in Cameroon",
  heroSubtitle: "MADECC Group is Cameroon's chief building contractor. We shape skylines from Douala to Yaoundé with architectural excellence, compliance and budget fidelity.",
  missionStatement: "To construct climate-resilient and structurally superior edifices in Cameroon, aligning strictly with local regulatory models (ANOR) while employing regional talent and modern, safe workflows.",
  visionStatement: "To be the absolute benchmark of general construction in Central Africa, trusted for structural honesty, transparent bidding, and precision delivery.",
  homeProfileSummary: "Founded with local execution spirit and international quality protocols, MADECC Group (Maison de Construction et de Civil) is an integrated engineering-grade construction company fully registered in Cameroon.",
  corporateHistorySummary: "Established in Cameroon, MADECC Group began as a small structural advisory group. Sensing the critical need for standard general contractors combining true execution checklists, reliable logistics, and legal compliance, we scaled into a complete Design-Build institution spanning multiple active sites."
};

interface ContentContextType {
  content: ContentItem[];
  addContent: (item: Omit<ContentItem, 'id' | 'date'>) => void;
  updateContent: (item: ContentItem) => void;
  deleteContent: (id: string) => void;
  pageOverrides: PageOverrides;
  updatePageOverrides: (overrides: PageOverrides) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentItem[]>(() => {
    const cached = safeLocalStorageGetItem('madecc_cache_content');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
    return DEFAULT_CONTENT;
  });

  const [pageOverrides, setPageOverrides] = useState<PageOverrides>(() => {
    const cached = safeLocalStorageGetItem('madecc_cache_page_overrides');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.heroHeading) {
          return parsed;
        }
      } catch (e) {
        console.error("Cache overrides parsing error", e);
      }
    }
    return DEFAULT_OVERRIDES;
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Load from server on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch('/api/store/content');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data)) {
            setContent(data);
            safeLocalStorageSetItem('madecc_cache_content', JSON.stringify(data));
          }
        }
      } catch (e) {
        console.warn("Failed to synchronize content ledger with server, using cache.", e);
      }

      try {
        const res = await fetch('/api/store/page_overrides');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && !data.default && data.heroHeading) {
            setPageOverrides(data);
            safeLocalStorageSetItem('madecc_cache_page_overrides', JSON.stringify(data));
          }
        }
      } catch (e) {
        console.warn("Failed to synchronize page overrides ledger with server, using cache.", e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadContent();
  }, []);

  // Save to server when content changes
  useEffect(() => {
    if (!isInitialized) return;

    const syncContent = async () => {
      safeLocalStorageSetItem('madecc_cache_content', JSON.stringify(content));
      try {
        await fetch('/api/store/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: content }),
        });
      } catch (e) {
        console.error("Content synchronization failed", e);
      }
    };

    const timeout = setTimeout(syncContent, 1000);
    return () => clearTimeout(timeout);
  }, [content, isInitialized]);

  // Save to server when pageOverrides change
  useEffect(() => {
    if (!isInitialized) return;

    const syncOverrides = async () => {
      safeLocalStorageSetItem('madecc_cache_page_overrides', JSON.stringify(pageOverrides));
      try {
        await fetch('/api/store/page_overrides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: pageOverrides }),
        });
      } catch (e) {
        console.error("Page overrides synchronization failed", e);
      }
    };

    const timeout = setTimeout(syncOverrides, 1000);
    return () => clearTimeout(timeout);
  }, [pageOverrides, isInitialized]);

  const addContent = (item: Omit<ContentItem, 'id' | 'date'>) => {
    const newItem: ContentItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    setContent(prev => [...prev, newItem]);
  };

  const updateContent = (item: ContentItem) => {
    setContent(prev => prev.map(old => old.id === item.id ? item : old));
  };

  const deleteContent = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id));
  };

  const updatePageOverrides = (overrides: PageOverrides) => {
    setPageOverrides(overrides);
  };

  return (
    <ContentContext.Provider value={{ content, addContent, updateContent, deleteContent, pageOverrides, updatePageOverrides }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
