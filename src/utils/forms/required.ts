export type RequiredFieldSpec = {
  key: string;
  label: string;
  value: string | null | undefined;
};

export function isRequiredValuePresent(
  value: string | null | undefined,
): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function findFirstMissingRequiredField(
  fields: RequiredFieldSpec[],
): RequiredFieldSpec | null {
  for (const field of fields) {
    if (!isRequiredValuePresent(field.value)) {
      return field;
    }
  }
  return null;
}
