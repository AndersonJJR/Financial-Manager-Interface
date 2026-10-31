export type RoleUsuario = 'ROLE_USER' | 'ROLE_ADMIN';

export interface LoginRequest {
  readonly email: string;
  readonly senha: string;
}

export interface CadastroUsuarioRequest {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}

export interface UsuarioResponse {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
  readonly role: RoleUsuario;
  readonly ativo: boolean;
  readonly criadoEm: string | null;
}

export interface TokenResponse {
  readonly token: string;
  readonly tipo: string;
  readonly expiraEm: string;
  readonly usuario: UsuarioResponse;
}
