import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Redireciona a raiz para a página inicial do perfil do usuário. */
export const roleRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureRoles().pipe(map((roles) => router.createUrlTree([AuthService.rotaInicial(roles)])));
};
