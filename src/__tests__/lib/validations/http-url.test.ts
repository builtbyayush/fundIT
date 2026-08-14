import { describe, expect, it } from "vitest";

import {
  httpHttpsUrlSchema,
  isHttpOrHttpsUrl,
  optionalHttpHttpsUrlSchema,
} from "@/lib/validations/http-url";

describe("http/https URL validation", () => {
  it("accepts valid HTTP and HTTPS URLs", () => {
    expect(isHttpOrHttpsUrl("https://example.com/image.jpg")).toBe(true);
    expect(isHttpOrHttpsUrl("http://example.com/image.jpg")).toBe(true);
    expect(httpHttpsUrlSchema.safeParse("https://cdn.example.com/a/b.png").success).toBe(
      true,
    );
  });

  it("rejects malformed and unsupported protocol URLs", () => {
    expect(isHttpOrHttpsUrl("not-a-url")).toBe(false);
    expect(isHttpOrHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpOrHttpsUrl("data:text/plain,hello")).toBe(false);
    expect(isHttpOrHttpsUrl("/demo/projects/cover.svg")).toBe(false);
    expect(httpHttpsUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });

  it("transforms empty optional URLs to null", () => {
    expect(optionalHttpHttpsUrlSchema.parse("")).toBeNull();
    expect(optionalHttpHttpsUrlSchema.parse(null)).toBeNull();
  });
});
