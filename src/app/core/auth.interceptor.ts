import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Ajoute « Authorization: Bearer <jeton> » à chaque appel de l'API ; déconnecte si le jeton a expiré. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const requete = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(requete).pipe(
    catchError((err) => {
      if (err.status === 401 && token) {
        auth.deconnecter();
      }
      return throwError(() => err);
    }),
  );
};
