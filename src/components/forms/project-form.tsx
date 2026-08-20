"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createProjectAction,
  updateProjectAction,
  type ProjectActionState,
} from "@/lib/actions/project";
import { AdminCoverMediaField } from "@/components/forms/admin-cover-media-field";
import { AdminGalleryMediaField } from "@/components/forms/admin-gallery-media-field";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils/slug";
import { MAX_PROJECT_CATEGORIES } from "@/models/Project";

export interface ProjectFormCategoryOption {
  id: string;
  name: string;
}

export interface ProjectFormValues {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  categoryIds?: string[];
  primaryCategoryId?: string;
  thumbnail?: string | null;
  coverImage?: string | null;
  gallery?: string[];
  video?: string | null;
  website?: string | null;
  tags?: string[];
  highlights?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  } | null;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  projectId?: string;
  categories: ProjectFormCategoryOption[];
  initialValues?: ProjectFormValues;
}

const initialState: ProjectActionState = {};

const FORM_SECTIONS = [
  { id: "basic", label: "Basic information" },
  { id: "categories", label: "Categories" },
  { id: "story", label: "Project story" },
  { id: "media", label: "Media" },
  { id: "links", label: "Links and tags" },
] as const;

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? mode === "create"
          ? "Creating…"
          : "Saving…"
        : mode === "create"
          ? "Create project"
          : "Save changes"}
    </Button>
  );
}

export function ProjectForm({
  mode,
  projectId,
  categories,
  initialValues,
}: ProjectFormProps) {
  const router = useRouter();
  const action =
    mode === "create"
      ? createProjectAction
      : updateProjectAction.bind(null, projectId ?? "");

  const [state, formAction] = useActionState(action, initialState);
  const draftKey = useId();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialValues?.categoryIds?.length
      ? initialValues.categoryIds
      : initialValues?.primaryCategoryId
        ? [initialValues.primaryCategoryId]
        : [],
  );
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    initialValues?.primaryCategoryId ?? initialValues?.categoryIds?.[0] ?? "",
  );
  const [shortDescriptionLength, setShortDescriptionLength] = useState(
    initialValues?.shortDescription?.length ?? 0,
  );

  const selectedCategories = useMemo(
    () => categories.filter((category) => selectedIds.includes(category.id)),
    [categories, selectedIds],
  );

  useEffect(() => {
    if (state.success && state.projectId) {
      if (mode === "create") {
        router.push(`/admin/projects/${state.projectId}/edit`);
      } else {
        router.refresh();
      }
    }
  }, [state, mode, router]);

  function toggleCategory(categoryId: string) {
    setSelectedIds((current) => {
      if (current.includes(categoryId)) {
        if (current.length === 1) return current;
        const next = current.filter((id) => id !== categoryId);
        if (primaryCategoryId === categoryId) {
          setPrimaryCategoryId(next[0] ?? "");
        }
        return next;
      }
      if (current.length >= MAX_PROJECT_CATEGORIES) return current;
      const next = [...current, categoryId];
      if (!primaryCategoryId) {
        setPrimaryCategoryId(categoryId);
      }
      return next;
    });
  }

  return (
    <div className={cn("lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8", mode === "edit" && "pb-24")}>
      <nav
        className="sticky top-28 hidden h-fit space-y-1 lg:block"
        aria-label="Form sections"
      >
        {FORM_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <form action={formAction} className="space-y-6">
        {state.error ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
        {state.success && mode === "edit" ? (
          <p
            className="rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
            role="status"
          >
            Project saved successfully.
          </p>
        ) : null}

        <section id="basic" className="scroll-mt-24 space-y-4 rounded-xl border border-border/80 bg-card p-5">
          <div>
            <h2 className="text-base font-semibold">Basic information</h2>
            <p className="text-sm text-muted-foreground">
              Core details used in admin lists and public discovery.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={initialValues?.title}
              placeholder="Neighborhood kitchen expansion"
              onBlur={(event) => {
                const slugInput = document.getElementById("slug") as HTMLInputElement | null;
                if (slugInput && !slugInput.value && event.target.value) {
                  slugInput.value = slugify(event.target.value);
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="shortDescription">Short description</Label>
              <span className="text-xs text-muted-foreground">{shortDescriptionLength}/280</span>
            </div>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              required
              defaultValue={initialValues?.shortDescription}
              maxLength={280}
              placeholder="A concise summary for opportunity cards."
              onChange={(event) => setShortDescriptionLength(event.target.value.length)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={initialValues?.slug}
              placeholder="neighborhood-kitchen-expansion"
            />
            <p className="text-xs text-muted-foreground">
              Public URL path. Existing published URLs are not auto-changed when you edit the
              title.
            </p>
          </div>
        </section>

        <section id="categories" className="scroll-mt-24 space-y-4 rounded-xl border border-border/80 bg-card p-5">
          <div>
            <h2 className="text-base font-semibold">Categories</h2>
            <p className="text-sm text-muted-foreground">
              Select 1–{MAX_PROJECT_CATEGORIES} categories. Primary must be one of the selected
              categories.
            </p>
          </div>

          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={category.id === primaryCategoryId ? "pastelMint" : "pastelLavender"}
                  className="gap-1 pr-1"
                >
                  {category.name}
                  {category.id === primaryCategoryId ? " · Primary" : ""}
                  <button
                    type="button"
                    className="ml-1 rounded px-1 text-xs hover:bg-muted"
                    aria-label={`Remove ${category.name}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No categories selected yet.</p>
          )}

          <div className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border border-border/80 p-3 sm:grid-cols-2">
            {categories.map((category) => {
              const checked = selectedIds.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-1 text-sm hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    checked={checked}
                    onChange={() => toggleCategory(category.id)}
                    className="size-4 accent-[hsl(var(--primary))]"
                  />
                  <span>{category.name}</span>
                </label>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryCategoryId">Primary category</Label>
            <Select
              id="primaryCategoryId"
              name="primaryCategoryId"
              required
              value={primaryCategoryId}
              onChange={(event) => setPrimaryCategoryId(event.target.value)}
              disabled={selectedCategories.length === 0}
            >
              <option value="">Select from chosen categories</option>
              {selectedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        </section>

        <section id="story" className="scroll-mt-24 space-y-4 rounded-xl border border-border/80 bg-card p-5">
          <div>
            <h2 className="text-base font-semibold">Project story</h2>
            <p className="text-sm text-muted-foreground">
              Plain-text description only. No rich text in this phase.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea
              id="description"
              name="description"
              required
              className="min-h-[180px] whitespace-pre-wrap"
              defaultValue={initialValues?.description}
              placeholder="What this project is, who it serves, and how funds will be used."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights</Label>
            <Textarea
              id="highlights"
              name="highlights"
              defaultValue={initialValues?.highlights?.join("\n")}
              placeholder="One highlight per line"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={initialValues?.location?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={initialValues?.location?.state ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={initialValues?.location?.country ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Project website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={initialValues?.website ?? ""}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video URL</Label>
            <Input
              id="video"
              name="video"
              type="url"
              defaultValue={initialValues?.video ?? ""}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <p className="text-xs text-muted-foreground">
              Optional YouTube or external video shown on the public project page.
            </p>
          </div>
        </section>

        <section id="media" className="scroll-mt-24 space-y-4 rounded-xl border border-border/80 bg-card p-5">
          <div>
            <h2 className="text-base font-semibold">Media</h2>
            <p className="text-sm text-muted-foreground">
              Upload images to Cloudinary or paste a URL. Only URLs are stored on the project.
            </p>
          </div>

          <AdminCoverMediaField
            initialValue={initialValues?.coverImage ?? initialValues?.thumbnail}
            projectId={projectId}
            draftKey={draftKey}
          />

          <AdminGalleryMediaField
            initialUrls={initialValues?.gallery ?? []}
            projectId={projectId}
            draftKey={draftKey}
          />
        </section>

        <section id="links" className="scroll-mt-24 space-y-4 rounded-xl border border-border/80 bg-card p-5">
          <div>
            <h2 className="text-base font-semibold">Links and tags</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={initialValues?.tags?.join(", ")}
              placeholder="food, neighborhood, kitchen"
            />
            <p className="text-xs text-muted-foreground">Comma-separated tags.</p>
          </div>
        </section>

        {mode === "create" ? (
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton mode={mode} />
            <Button variant="outline" asChild>
              <Link href="/admin/projects">Cancel</Link>
            </Button>
          </div>
        ) : (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-card/95 px-4 py-3 backdrop-blur lg:left-60">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/projects">Cancel</Link>
              </Button>
              <SubmitButton mode={mode} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
