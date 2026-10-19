import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../constants/roles.type';

/** Libera a rota se o usuário possuir ao menos um dos perfis informados. */
export const roleGuard = (allowed: UserRole[]): CanMatchFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.ensureRoles().pipe(
      map((roles) => {
        if (!auth.getToken() || roles.length === 0) return router.createUrlTree(['/login']);
        if (roles.some((r) => allowed.includes(r))) return true;
        return router.createUrlTree([AuthService.rotaInicial(roles)]);
      })
    );
  };
};
