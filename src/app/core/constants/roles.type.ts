/** Perfis de acesso. Um usuário pode acumular mais de um perfil. */
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  COLABORADOR = 'ROLE_COLABORADOR',
  USUARIO = 'ROLE_USUARIO',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COLABORADOR]: 'Colaborador (docente)',
  [UserRole.USUARIO]: 'Usuário (discente)',
};
