export function createMockUser<Role extends string, Extra extends Record<string, unknown> = Record<string, never>>(
  email: string,
  role: Role,
  overrides?: Extra
) {
  return {
    name: 'Alex Morgan',
    email,
    role,
    avatar: 'https://i.pravatar.cc/150?u=alex',
    ...(overrides ?? {}),
  };
}
