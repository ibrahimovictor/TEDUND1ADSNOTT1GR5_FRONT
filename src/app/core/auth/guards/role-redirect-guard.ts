import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../constants/roles.type';

export const roleRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureRole().pipe(
    map((role) => {
      if (role === UserRole.ADMIN) {
        return router.createUrlTree(['/admin/disciplinas']);
      }
      if (role === UserRole.PROFESSOR) {
        return router.createUrlTree(['/professor/disciplinas']);
      }

      return router.createUrlTree(['/login']);
    })
  );
};
