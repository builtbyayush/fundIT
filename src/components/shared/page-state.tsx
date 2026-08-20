import { Logo } from "@/components/shared/logo";
import { DecorativeBlob } from "@/components/shared/decorative-blob";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PageStateProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageState({ title, description, children, className }: PageStateProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12",
        className,
      )}
    >
      <DecorativeBlob />
      <div className="relative mb-8">
        <Logo />
      </div>
      <Card variant="elevated" className="relative w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children ? (
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {children}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
