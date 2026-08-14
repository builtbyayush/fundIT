export interface NavItem {
  label: string;
  href: string;
  /** If true, item is shown but not yet functional */
  disabled?: boolean;
}

export const publicNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/projects" },
  { label: "Categories", href: "/#categories" },
  { label: "How It Works", href: "/#how-it-works" },
];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Investments", href: "/admin/investments" },
  { label: "Investors", href: "/admin/investors", disabled: true },
  { label: "Categories", href: "/admin/categories", disabled: true },
  { label: "Settings", href: "/admin/settings", disabled: true },
];

export const investorNavigation: NavItem[] = [
  { label: "Dashboard", href: "/investor" },
  { label: "Explore", href: "/projects" },
  { label: "My Investments", href: "/investor/investments" },
  { label: "Profile", href: "/investor/profile" },
];

export const footerNavigation = {
  platform: [
    { label: "Explore Opportunities", href: "/projects" },
    { label: "Categories", href: "/#categories" },
    { label: "How It Works", href: "/#how-it-works" },
  ] satisfies NavItem[],
  company: [
    { label: "About", href: "/about", disabled: true },
    { label: "Contact", href: "/contact", disabled: true },
    { label: "Privacy", href: "/privacy", disabled: true },
    { label: "Terms", href: "/terms", disabled: true },
  ] satisfies NavItem[],
} as const;
