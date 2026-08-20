import Image from "next/image";
import { Container } from "@/components/shared/section-heading";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { initialsFromName } from "@/lib/investor/greeting";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function InvestorProfilePage() {
  const sessionUser = await requireRole(UserRole.INVESTOR);

  await connectToDatabase();
  const user = await User.findById(sessionUser.id).lean();

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const avatar = sessionUser.avatar || user?.avatar;
  const initials = initialsFromName(sessionUser.name);

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Profile</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          The basics we use for your FundIt account.
        </p>
      </div>

      <section className="max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="bg-pastel-peach/80 px-6 py-8 text-pastel-peach-foreground">
          <div className="flex items-center gap-4">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
                aria-hidden="true"
              >
                {initials}
              </div>
            )}
            <div>
              <h2 className="font-display text-2xl">{sessionUser.name || "Investor"}</h2>
              <p className="text-sm text-muted-foreground">{sessionUser.email}</p>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-border/60 px-6">
          <div className="flex justify-between gap-4 py-4 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium text-foreground">{sessionUser.name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 py-4 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-foreground">{sessionUser.email}</dd>
          </div>
          <div className="flex justify-between gap-4 py-4 text-sm">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium text-foreground">{createdAt}</dd>
          </div>
        </dl>
      </section>
    </Container>
  );
}
