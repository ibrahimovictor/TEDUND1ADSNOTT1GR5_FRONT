import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../constants/roles.type';

export const roleGuard = (allowed: UserRole[]): CanMatchFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Sem decodificar: busca/cached da role via API
    return auth.ensureRole().pipe(
      map((role) => {
        if (!auth.getToken()) return router.createUrlTree(['/login']);
        if (role && allowed.includes(role)) return true;
        return router.createUrlTree(['/login']); // ou ['/forbidden'] se tiver página
      })
    );
  };
};
