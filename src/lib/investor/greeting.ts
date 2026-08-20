export function firstNameFromFullName(name: string | null | undefined): string | null {
  const first = name?.trim().split(/\s+/).filter(Boolean)[0];
  return first || null;
}

export function initialsFromName(name: string | null | undefined): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "I";
}

export function investorGreeting(name: string | null | undefined): {
  title: string;
  subtitle: string;
} {
  const firstName = firstNameFromFullName(name);
  return {
    title: firstName ? `Welcome back, ${firstName}.` : "Good to see you again.",
    subtitle: "Here’s what you’re backing on FundIt.",
  };
}
