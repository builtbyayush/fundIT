# Phase 6 — Admin experience

Admin stays a workspace: efficient, data-oriented, and limited to live routes. No Categories / Investors / Settings pages, no Razorpay, and no invented financial claims.

## What changed

- **Shell:** Live nav only (Dashboard, Projects, Create project, Investments). Prefix-active matching so `/admin/projects/[id]/edit` highlights Projects and `/admin/projects/new` highlights Create project. Path-derived breadcrumbs. Mobile drawer with overlay, `aria-expanded`, and close-on-navigate. Header shows operator name/email and Log out. Logo still goes to `/`. `robots: noindex` unchanged.
- **Dashboard:** Dense metric strip from real counts (project statuses, open opportunities, confirmed funding, pending payments). Attention list for drafts, published-without-open-opportunity, and pending payments. Recent projects and investments. No marketing hero or fake KPI tiles.
- **Projects list:** Server search (`Search projects...`) plus status/category filters. Desktop table and mobile cards. Opportunity status and compact funding from current-page summaries (not a new Mongo filter). Title links to edit; actions include terms, preview when published, and status transitions.
- **Project form:** One create/update action, labeled sections with sticky in-page nav on `lg`. Short description 280 counter. Chip category select with primary restricted to selected IDs. Cloudinary cover/gallery unchanged (URLs only). Edit: next-step banner, status actions, Preview only if published, sticky save footer.
- **Opportunity terms:** Back to project, overview + funding bar, existing Open/Pause/Close/Cancel actions, human-readable open blockers from current service rules.
- **Investments list:** Desktop table + mobile cards, investor name + email, project title linked to terms. Filter-empty vs true-empty copy. No detail/refund UI.
- **Login:** Staff copy, no signup, Auth.js + `expectedRole=ADMIN`, callback URL still sanitized.

## Empty / loading / error

- Dashboard and nested admin pages share `(dashboard)/loading.tsx` skeletons and `error.tsx` using restrained `EmptyState` (no public blobs).
- Project catalog vs filtered-empty, and investments catalog vs filtered-empty, use different copy.
- Attention list has an empty “nothing needs attention” state.

## Accessibility

- Admin mobile menu: `aria-expanded`, overlay close, touch-sized links, `aria-current` on active nav.
- Status badges include text labels (not color-only).
- Form sections have `id`s for in-page nav; alerts use `role="alert"` / `role="status"`.
- Breadcrumbs use a labeled `<nav>`.

## Security

- Admin layout still `requireRole(ADMIN)` and redirects to `/admin/login`.
- Callback URLs remain constrained by `safeAuthCallbackUrl`.
- No new collections, payment providers, or public draft preview.
- Media still stores Cloudinary/public URLs only; no live provider calls in tests.

## Deferred

Phase 7 motion library, Phase 8 trust/legal copy, Razorpay, wallet/KYC/equity/ROI, category CRUD UI, investor directory, Settings, draft public preview route.
