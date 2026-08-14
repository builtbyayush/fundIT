/**
 * Local demo media paths for seeded development projects.
 * Assets live under public/demo/projects/ — run `npx tsx scripts/generate-demo-media.ts` to regenerate.
 */
export type DemoMediaTheme =
  | "ai-health"
  | "software"
  | "gadgets"
  | "nutrition"
  | "equipment"
  | "academics"
  | "apps"
  | "formulations"
  | "events"
  | "publications";

export function demoProjectMedia(theme: DemoMediaTheme) {
  const base = `/demo/projects/${theme}`;
  return {
    coverImage: `${base}/cover.svg`,
    thumbnail: `${base}/thumb.svg`,
    gallery: [`${base}/gallery-1.svg`, `${base}/gallery-2.svg`, `${base}/gallery-3.svg`],
  };
}

export const LEGACY_SEED_DESCRIPTION_PATTERN =
  /fictional seed|development only|UI testing|seed data|seed content|seed opportunity|admin workflow testing|admin status transitions|archived fictional|verify that archived/i;

export function shouldRefreshSeededProject(project: {
  coverImage?: string | null;
  description?: string;
}): boolean {
  return !project.coverImage || LEGACY_SEED_DESCRIPTION_PATTERN.test(project.description ?? "");
}
