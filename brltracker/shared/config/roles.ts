const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

type RoleValues = typeof ROLES[keyof typeof ROLES];

const ALL_ROLES: RoleValues[] = Object.values(ROLES);

export {
  ROLES,
  ALL_ROLES,
  type RoleValues
};