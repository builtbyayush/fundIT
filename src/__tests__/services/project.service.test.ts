import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectStatus } from "@/constants/project-status";
import { ApiError } from "@/lib/api/errors";

const VALID_ID = "507f1f77bcf86cd799439011";
const VALID_ID_B = "507f1f77bcf86cd799439012";

const findByIdMock = vi.fn();
const findOneMock = vi.fn();
const createMock = vi.fn();
const countDocumentsMock = vi.fn();
const findMock = vi.fn();
const ensureCategoriesExistMock = vi.fn();
const getCategoryBySlugMock = vi.fn();

vi.mock("@/models/Project", () => ({
  Project: {
    findById: (...args: unknown[]) => findByIdMock(...args),
    findOne: (...args: unknown[]) => findOneMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    countDocuments: (...args: unknown[]) => countDocumentsMock(...args),
    find: (...args: unknown[]) => findMock(...args),
  },
}));

vi.mock("@/services/category.service", () => ({
  ensureCategoriesExist: (...args: unknown[]) => ensureCategoriesExistMock(...args),
  getCategoryBySlug: (...args: unknown[]) => getCategoryBySlugMock(...args),
}));

import {
  archiveProject,
  createProject,
  getPublishedProjectBySlug,
  listAdminProjects,
  listPublishedProjects,
  listPublishedProjectsExcluding,
  listRelatedPublishedProjects,
  publishProject,
  unpublishProject,
  updateProject,
} from "@/services/project.service";

function mockProjectDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => VALID_ID },
    title: "Sample",
    slug: "sample",
    shortDescription: "Short description for sample project.",
    description: "A longer description for the sample project under test.",
    categories: [VALID_ID],
    primaryCategory: VALID_ID,
    status: ProjectStatus.DRAFT,
    thumbnail: null,
    coverImage: null,
    gallery: [],
    video: null,
    website: null,
    tags: [],
    highlights: [],
    location: null,
    createdBy: "admin-1",
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const baseInput = {
  title: "Sample",
  shortDescription: "Short description for sample project.",
  description: "A longer description for the sample project under test.",
  categoryIds: [VALID_ID],
  primaryCategoryId: VALID_ID,
  gallery: [] as string[],
  tags: [] as string[],
  highlights: [] as string[],
  location: null,
  thumbnail: null,
  coverImage: null,
  video: null,
  website: null,
};

describe("project.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureCategoriesExistMock.mockResolvedValue([{ _id: VALID_ID, isActive: true }]);
    findOneMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
  });

  it("creates projects as drafts with generated unique slugs", async () => {
    createMock.mockResolvedValue(mockProjectDoc());

    await createProject(baseInput, "admin-1");

    expect(ensureCategoriesExistMock).toHaveBeenCalledWith([VALID_ID]);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectStatus.DRAFT,
        slug: "sample",
        createdBy: "admin-1",
        categories: [VALID_ID],
        primaryCategory: VALID_ID,
      }),
    );
  });

  it("creates projects with multiple categories", async () => {
    createMock.mockResolvedValue(
      mockProjectDoc({ categories: [VALID_ID, VALID_ID_B], primaryCategory: VALID_ID_B }),
    );
    ensureCategoriesExistMock.mockResolvedValue([
      { _id: VALID_ID, isActive: true },
      { _id: VALID_ID_B, isActive: true },
    ]);

    await createProject(
      {
        ...baseInput,
        categoryIds: [VALID_ID, VALID_ID_B],
        primaryCategoryId: VALID_ID_B,
      },
      "admin-1",
    );

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [VALID_ID, VALID_ID_B],
        primaryCategory: VALID_ID_B,
      }),
    );
  });

  it("does not auto-rewrite slug on title-only updates", async () => {
    const doc = mockProjectDoc({ slug: "original-slug", title: "Original" });
    findByIdMock.mockResolvedValue(doc);

    await updateProject(VALID_ID, {
      ...baseInput,
      title: "Updated Title",
      slug: "",
    });

    expect(doc.slug).toBe("original-slug");
    expect(doc.title).toBe("Updated Title");
    expect(doc.save).toHaveBeenCalled();
  });

  it("publishes drafts and sets publishedAt", async () => {
    const doc = mockProjectDoc();
    findByIdMock.mockResolvedValue(doc);

    await publishProject(VALID_ID);

    expect(doc.status).toBe(ProjectStatus.PUBLISHED);
    expect(doc.publishedAt).toBeInstanceOf(Date);
  });

  it("rejects invalid status transitions", async () => {
    const doc = mockProjectDoc({ status: ProjectStatus.DRAFT });
    findByIdMock.mockResolvedValue(doc);

    await expect(unpublishProject(VALID_ID)).rejects.toBeInstanceOf(ApiError);
  });

  it("lists only published projects publicly", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce([]);
    findMock.mockReturnValue(chain);
    countDocumentsMock.mockResolvedValue(0);

    await listPublishedProjects({
      page: 1,
      limit: 12,
      search: "",
      category: "",
      sort: "newest",
    });

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: ProjectStatus.PUBLISHED }),
    );
    expect(chain.sort).toHaveBeenCalledWith({ publishedAt: -1, createdAt: -1 });
  });

  it("filters published projects by any assigned category slug", async () => {
    const categoryObjectId = { toString: () => VALID_ID };
    getCategoryBySlugMock.mockResolvedValue({
      _id: categoryObjectId,
      isActive: true,
    });

    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce([]);
    findMock.mockReturnValue(chain);
    countDocumentsMock.mockResolvedValue(0);

    await listPublishedProjects({
      page: 1,
      limit: 12,
      search: "",
      category: "nutrition",
      sort: "newest",
    });

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectStatus.PUBLISHED,
        categories: categoryObjectId,
      }),
    );
  });

  it("sorts published projects by recently updated when requested", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce([]);
    findMock.mockReturnValue(chain);
    countDocumentsMock.mockResolvedValue(0);

    await listPublishedProjects({
      page: 1,
      limit: 12,
      search: "health",
      category: "",
      sort: "updated",
    });

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectStatus.PUBLISHED,
        $or: expect.any(Array),
      }),
    );
    expect(chain.sort).toHaveBeenCalledWith({ updatedAt: -1, createdAt: -1 });
  });

  it("supports admin pagination metadata", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce([]);
    findMock.mockReturnValue(chain);
    countDocumentsMock.mockResolvedValue(25);

    const result = await listAdminProjects({
      page: 2,
      limit: 10,
      search: "",
      category: "",
      status: undefined,
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(chain.skip).toHaveBeenCalledWith(10);
  });

  it("filters admin list by status and search", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce([]);
    findMock.mockReturnValue(chain);
    countDocumentsMock.mockResolvedValue(0);

    await listAdminProjects({
      page: 1,
      limit: 10,
      search: "health",
      category: "",
      status: ProjectStatus.DRAFT,
    });

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectStatus.DRAFT,
        $or: expect.any(Array),
      }),
    );
  });

  it("archives published projects", async () => {
    const doc = mockProjectDoc({ status: ProjectStatus.PUBLISHED });
    findByIdMock.mockResolvedValue(doc);
    await archiveProject(VALID_ID);
    expect(doc.status).toBe(ProjectStatus.ARCHIVED);
  });

  it("returns null for unpublished slugs", async () => {
    const chain = {
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(null),
    };
    findOneMock.mockReturnValue(chain);

    const result = await getPublishedProjectBySlug("draft-idea");

    expect(result).toBeNull();
    expect(findOneMock).toHaveBeenCalledWith({
      slug: "draft-idea",
      status: ProjectStatus.PUBLISHED,
    });
  });

  it("lists related published projects excluding the current id", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce([mockProjectDoc()]);
    findMock.mockReturnValue(chain);

    const items = await listRelatedPublishedProjects({
      excludeId: VALID_ID,
      categoryIds: [VALID_ID_B],
      limit: 4,
    });

    expect(items).toHaveLength(1);
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectStatus.PUBLISHED,
        _id: { $ne: expect.anything() },
        categories: { $in: expect.any(Array) },
      }),
    );
    expect(chain.limit).toHaveBeenCalledWith(4);
  });

  it("returns no related projects when there are no sibling categories", async () => {
    const items = await listRelatedPublishedProjects({
      excludeId: VALID_ID,
      categoryIds: [],
      limit: 4,
    });

    expect(items).toEqual([]);
    expect(findMock).not.toHaveBeenCalled();
  });

  it("lists newest published projects excluding already-backed ids", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce([mockProjectDoc()]);
    findMock.mockReturnValue(chain);

    const items = await listPublishedProjectsExcluding({
      excludeProjectIds: [VALID_ID],
      limit: 4,
    });

    expect(items).toHaveLength(1);
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectStatus.PUBLISHED,
        _id: { $nin: expect.any(Array) },
      }),
    );
    expect(chain.limit).toHaveBeenCalledWith(4);
  });
});
