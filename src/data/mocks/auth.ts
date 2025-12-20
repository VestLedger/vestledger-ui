export function createMockUser<Role extends string>(email: string, role: Role) {
  return {
    name: 'Alex Morgan',
    email,
    role,
    avatar: 'https://i.pravatar.cc/150?u=alex',
  };
}

