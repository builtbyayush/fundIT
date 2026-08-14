import { beforeEach, describe, expect, it, vi } from "vitest";

const createCategoryMock = vi.fn();
const findOneMock = vi.fn();
const findByIdMock = vi.fn();
const countDocumentsMock = vi.fn();

vi.mock("@/models/Category", () => ({
  Category: {
    findOne: (...args: unknown[]) => findOneMock(...args),
    findById: (...args: unknown[]) => findByIdMock(...args),
    createCategory: (...args: unknown[]) => createCategoryMock(...args),
    findActive: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("@/models/Project", () => ({
  Project: {
    countDocuments: (...args: unknown[]) => countDocumentsMock(...args),
  },
}));

import { ApiError } from "@/lib/api/errors";
import {
  createCategory,
  deactivateCategory,
} from "@/services/category.service";

describe("category.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates categories when name/slug are unique", async () => {
    findOneMock.mockResolvedValue(null);
    createCategoryMock.mockResolvedValue({
      _id: { toString: () => "cat-1" },
      name: "Software",
      slug: "software",
    });

    await createCategory({
      name: "Software",
      slug: "software",
      description: "Software opportunities",
      icon: "code",
    });

    expect(createCategoryMock).toHaveBeenCalled();
  });

  it("prevents duplicate category creation", async () => {
    findOneMock.mockResolvedValue({ slug: "software" });

    await expect(
      createCategory({
        name: "Software",
        slug: "software",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("deactivates categories instead of deleting them", async () => {
    const category = {
      _id: "cat-1",
      isActive: true,
      save: vi.fn().mockResolvedValue(undefined),
    };
    findByIdMock.mockResolvedValue(category);
    countDocumentsMock.mockResolvedValue(2);

    const result = await deactivateCategory("507f1f77bcf86cd799439011");
    expect(result.isActive).toBe(false);
    expect(category.save).toHaveBeenCalled();
  });
});
