import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs';
import { InfoBarService } from '../../../shared';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map((isAuth) =>
      isAuth ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
    ),
    catchError((err) => {
      console.error('Auth guard error:', err);
      authService.logout(); // limpa estado se quiser
      return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    })
  );
};
