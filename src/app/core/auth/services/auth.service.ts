import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { UserRole } from '../../constants/roles.type';
import type { Usuario } from '../../../shared/models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlApi = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_ROLE = 'auth_user_role';

  private http = inject(HttpClient);

  login(credentials: { username: string; password: string }): Observable<void> {
    return this.http.post<any>(`${this.urlApi}/signin`, credentials).pipe(
      tap((res) => {
        if (res?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.accessToken);
          this.ensureRole().subscribe();
        }
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE);
  }

  isAuthenticated(): Observable<boolean> {
    if (!this.getToken() || this.getToken() === '') {
      return of(false);
    }

    return this.ensureRole().pipe(
      map(() => !!this.getToken()),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private mapBackendToUserRole(roles: Array<{ id: number; name: string }>): UserRole | null {
    if (!Array.isArray(roles) || roles.length === 0) return null;

    for (const role of roles) {
      const name = role.name?.toUpperCase();
      if (name === 'ROLE_ADMIN') return UserRole.ADMIN;
      if (name === 'ROLE_USER') return UserRole.PROFESSOR;
    }
    return null;
  }

  ensureRole(): Observable<UserRole | null> {
    if (this.getToken() === null) {
      return of(null);
    }

    return this.http
      .get<Array<{ id: number; name: string }>>(`${environment.apiUrl}/user/permissao`)
      .pipe(
        map((roles) => this.mapBackendToUserRole(roles)),
        tap((role) => {
          if (role) localStorage.setItem(this.USER_ROLE, role);
        }),
        catchError(() => {
          this.logout();
          throw new Error('Erro ao garantir o papel do usuário.');
        })
      );
  }
}

