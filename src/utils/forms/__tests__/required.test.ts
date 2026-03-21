import { describe, expect, it } from "vitest";
import {
  findFirstMissingRequiredField,
  isRequiredValuePresent,
} from "@/utils/forms/required";

describe("required form helpers", () => {
  it("treats whitespace-only strings as missing", () => {
    expect(isRequiredValuePresent("   ")).toBe(false);
    expect(isRequiredValuePresent("value")).toBe(true);
  });

  it("returns first missing required field in order", () => {
    const missing = findFirstMissingRequiredField([
      { key: "name", label: "Name", value: "   " },
      { key: "email", label: "Email", value: "" },
    ]);

    expect(missing?.key).toBe("name");
    expect(missing?.label).toBe("Name");
  });
});
