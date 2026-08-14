/**
 * Generates illustrative SVG demo assets for seeded projects.
 * Run: npx tsx scripts/generate-demo-media.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public/demo/projects");

type Theme = {
  bg: string;
  bg2: string;
  accent: string;
  accent2: string;
  surface: string;
  line: string;
  label: string;
};

const THEMES: Record<string, Theme> = {
  "ai-health": {
    bg: "#0f2744",
    bg2: "#16365c",
    accent: "#38bdf8",
    accent2: "#22d3ee",
    surface: "#1e3a5f",
    line: "#94a3b8",
    label: "Clinical intelligence platform",
  },
  software: {
    bg: "#111827",
    bg2: "#1f2937",
    accent: "#6366f1",
    accent2: "#818cf8",
    surface: "#374151",
    line: "#9ca3af",
    label: "Product workspace",
  },
  gadgets: {
    bg: "#0f172a",
    bg2: "#1e293b",
    accent: "#14b8a6",
    accent2: "#2dd4bf",
    surface: "#334155",
    line: "#94a3b8",
    label: "Connected wellness device",
  },
  nutrition: {
    bg: "#1a2e1a",
    bg2: "#234423",
    accent: "#84cc16",
    accent2: "#a3e635",
    surface: "#365314",
    line: "#a3a3a3",
    label: "Nutrition intelligence",
  },
  equipment: {
    bg: "#1c1917",
    bg2: "#292524",
    accent: "#f59e0b",
    accent2: "#fbbf24",
    surface: "#44403c",
    line: "#a8a29e",
    label: "Precision equipment",
  },
  academics: {
    bg: "#1e1b4b",
    bg2: "#312e81",
    accent: "#a78bfa",
    accent2: "#c4b5fd",
    surface: "#4338ca",
    line: "#c4b5fd",
    label: "Learning platform",
  },
  apps: {
    bg: "#172554",
    bg2: "#1e3a8a",
    accent: "#60a5fa",
    accent2: "#93c5fd",
    surface: "#1d4ed8",
    line: "#bfdbfe",
    label: "Mobile experience",
  },
  formulations: {
    bg: "#1f1428",
    bg2: "#2d1b3d",
    accent: "#e879f9",
    accent2: "#f0abfc",
    surface: "#581c87",
    line: "#d8b4fe",
    label: "Formulation lab",
  },
  events: {
    bg: "#3b0764",
    bg2: "#581c87",
    accent: "#f472b6",
    accent2: "#fb7185",
    surface: "#7e22ce",
    line: "#f5d0fe",
    label: "Event experience",
  },
  publications: {
    bg: "#1a1410",
    bg2: "#292018",
    accent: "#f97316",
    accent2: "#fdba74",
    surface: "#7c2d12",
    line: "#fed7aa",
    label: "Publishing platform",
  },
};

function coverSvg(theme: Theme, variant: number): string {
  const bars = Array.from({ length: 4 }, (_, i) => {
    const h = 28 + ((i + variant) % 3) * 18;
    const x = 360 + i * 52;
    return `<rect x="${x}" y="${320 - h}" width="36" height="${h}" rx="6" fill="${theme.accent}" opacity="${0.35 + i * 0.12}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.surface}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${theme.bg2}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="980" cy="120" r="180" fill="${theme.accent}" opacity="0.12"/>
  <circle cx="180" cy="560" r="140" fill="${theme.accent2}" opacity="0.1"/>
  <rect x="80" y="90" width="720" height="495" rx="24" fill="url(#panel)" stroke="${theme.line}" stroke-opacity="0.25"/>
  <rect x="120" y="130" width="220" height="16" rx="8" fill="${theme.line}" opacity="0.35"/>
  <rect x="120" y="170" width="360" height="28" rx="10" fill="${theme.accent}" opacity="0.85"/>
  <rect x="120" y="220" width="300" height="14" rx="7" fill="${theme.line}" opacity="0.35"/>
  <rect x="120" y="250" width="260" height="14" rx="7" fill="${theme.line}" opacity="0.25"/>
  <rect x="120" y="300" width="640" height="180" rx="18" fill="${theme.bg}" opacity="0.45"/>
  ${bars}
  <path d="M140 430 Q220 360 300 410 T460 390 T620 420 T780 360" fill="none" stroke="${theme.accent2}" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
  <circle cx="780" cy="360" r="10" fill="${theme.accent2}"/>
  <rect x="860" y="150" width="240" height="360" rx="20" fill="${theme.bg}" opacity="0.55" stroke="${theme.line}" stroke-opacity="0.2"/>
  <rect x="890" y="190" width="180" height="120" rx="16" fill="${theme.accent}" opacity="0.35"/>
  <rect x="890" y="330" width="140" height="14" rx="7" fill="${theme.line}" opacity="0.35"/>
  <rect x="890" y="360" width="170" height="14" rx="7" fill="${theme.line}" opacity="0.25"/>
  <rect x="890" y="390" width="120" height="14" rx="7" fill="${theme.line}" opacity="0.2"/>
  <rect x="890" y="440" width="180" height="44" rx="12" fill="${theme.accent}" opacity="0.75"/>
  <text x="80" y="640" fill="${theme.line}" font-family="system-ui, sans-serif" font-size="28" opacity="0.8">${theme.label}</text>
</svg>`;
}

function gallerySvg(theme: Theme, index: number): string {
  const accent = index % 2 === 0 ? theme.accent : theme.accent2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <rect x="60" y="60" width="680" height="300" rx="20" fill="${theme.surface}" opacity="0.85"/>
  <rect x="100" y="110" width="180" height="14" rx="7" fill="${theme.line}" opacity="0.35"/>
  <rect x="100" y="145" width="260" height="22" rx="8" fill="${accent}" opacity="0.8"/>
  <rect x="100" y="190" width="220" height="12" rx="6" fill="${theme.line}" opacity="0.3"/>
  <rect x="100" y="220" width="520" height="90" rx="14" fill="${theme.bg}" opacity="0.45"/>
  <circle cx="620" cy="250" r="70" fill="${accent}" opacity="0.25"/>
  <rect x="100" y="390" width="160" height="44" rx="12" fill="${accent}" opacity="0.7"/>
  <rect x="280" y="390" width="160" height="44" rx="12" fill="${theme.line}" opacity="0.18"/>
</svg>`;
}

for (const [folder, theme] of Object.entries(THEMES)) {
  const dir = path.join(ROOT, folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "cover.svg"), coverSvg(theme, 1));
  writeFileSync(path.join(dir, "thumb.svg"), coverSvg(theme, 2));
  writeFileSync(path.join(dir, "gallery-1.svg"), gallerySvg(theme, 1));
  writeFileSync(path.join(dir, "gallery-2.svg"), gallerySvg(theme, 2));
  writeFileSync(path.join(dir, "gallery-3.svg"), gallerySvg(theme, 3));
}

console.log(`Generated demo media in ${ROOT}`);
