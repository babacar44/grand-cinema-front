import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Pages réservées aux utilisateurs connectés : redirige vers la connexion en mémorisant la page demandée. */
export const connecteGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.estConnecte()
    ? true
    : inject(Router).createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** US 4 : back-office réservé au rôle ADMIN (la vraie protection reste côté API). */
export const adminGuard: CanActivateFn = () => {
  return inject(AuthService).estAdmin() ? true : inject(Router).createUrlTree(['/']);
};
