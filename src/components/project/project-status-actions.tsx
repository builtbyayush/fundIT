"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  archiveProjectAction,
  publishProjectAction,
  unpublishProjectAction,
} from "@/lib/actions/project";
import { ProjectStatus } from "@/constants/project-status";
import { canTransitionStatus } from "@/constants/project-status";

interface ProjectStatusActionsProps {
  projectId: string;
  status: ProjectStatus;
}

export function ProjectStatusActions({ projectId, status }: ProjectStatusActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(
    action: (id: string) => Promise<{ error?: string; success?: boolean }>,
    confirmMessage: string,
  ) {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action(projectId);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canTransitionStatus(status, ProjectStatus.PUBLISHED) && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(publishProjectAction, "Publish this project? It will appear on the public catalog.")
          }
        >
          Publish
        </Button>
      )}
      {canTransitionStatus(status, ProjectStatus.UNPUBLISHED) && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(
              unpublishProjectAction,
              "Unpublish this project? It will no longer appear on the public catalog.",
            )
          }
        >
          Unpublish
        </Button>
      )}
      {canTransitionStatus(status, ProjectStatus.ARCHIVED) && (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() =>
            run(
              archiveProjectAction,
              "Archive this project? It will leave the active catalog.",
            )
          }
        >
          Archive
        </Button>
      )}
    </div>
  );
}
