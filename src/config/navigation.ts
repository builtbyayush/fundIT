export interface NavItem {
  label: string;
  href: string;
  /** If true, item is shown but not yet functional */
  disabled?: boolean;
}

export const publicNavigation: NavItem[] = [
  { label: "Explore", href: "/projects" },
  { label: "Categories", href: "/#categories" },
  { label: "How it works", href: "/#how-it-works" },
];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Create project", href: "/admin/projects/new" },
  { label: "Investments", href: "/admin/investments" },
];

export const investorNavigation: NavItem[] = [
  { label: "My FundIt", href: "/investor" },
  { label: "Explore", href: "/projects" },
  { label: "My investments", href: "/investor/investments" },
  { label: "Profile", href: "/investor/profile" },
];

export const footerNavigation = {
  platform: [
    { label: "Explore Opportunities", href: "/projects" },
    { label: "Categories", href: "/#categories" },
    { label: "How it works", href: "/#how-it-works" },
  ] satisfies NavItem[],
  company: [
    { label: "About", href: "/about", disabled: true },
    { label: "Contact", href: "/contact", disabled: true },
    { label: "Privacy", href: "/privacy", disabled: true },
    { label: "Terms", href: "/terms", disabled: true },
  ] satisfies NavItem[],
  account: [
    { label: "Login", href: "/login" },
    { label: "Join FundIt", href: "/signup" },
  ] satisfies NavItem[],
} as const;
