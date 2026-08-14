import { Container } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
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

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Basic account information for your investor profile.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {(sessionUser.name || "I")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("") || "I"}
            </div>
            <div>
              <CardTitle>{sessionUser.name}</CardTitle>
              <CardDescription>{sessionUser.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b py-3">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="secondary">{sessionUser.role}</Badge>
          </div>
          <div className="flex items-center justify-between border-b py-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="outline">{sessionUser.status}</Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium text-foreground">{createdAt}</span>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
