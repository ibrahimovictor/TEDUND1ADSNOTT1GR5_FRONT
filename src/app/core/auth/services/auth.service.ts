import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../constants/roles.type';

/** Usuário logado: perfis efetivos e cadastros vinculados (GET /api/user/me). */
export interface UsuarioLogado {
  id: number;
  name: string;
  username: string;
  roles: UserRole[];
  docenteId: number | null;
  discenteId: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private http = inject(HttpClient);
  private me$: Observable<UsuarioLogado | null> | null = null;

  login(credentials: { username: string; password: string }): Observable<void> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/signin`, credentials).pipe(
      tap((res) => {
        this.me$ = null;
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.me$ = null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Dados do usuário logado, em cache até o próximo login/logout. */
  me(): Observable<UsuarioLogado | null> {
    if (!this.getToken()) {
      return of(null);
    }
    if (!this.me$) {
      this.me$ = this.http.get<UsuarioLogado>(`${environment.apiUrl}/user/me`).pipe(
        catchError(() => {
          this.logout();
          return of(null);
        }),
        shareReplay(1)
      );
    }
    return this.me$;
  }

  ensureRoles(): Observable<UserRole[]> {
    return this.me().pipe(map((me) => me?.roles ?? []));
  }

  isAuthenticated(): Observable<boolean> {
    return this.me().pipe(map((me) => !!me));
  }

  /** Página inicial de acordo com o perfil principal. */
  static rotaInicial(roles: UserRole[]): string {
    if (roles.includes(UserRole.ADMIN)) return '/ies';
    if (roles.includes(UserRole.COLABORADOR)) return '/disciplinas';
    if (roles.includes(UserRole.USUARIO)) return '/minhas-monitorias';
    return '/login';
  }
}
