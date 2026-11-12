import { Routes } from '@angular/router';
import { adminGuard, connecteGuard } from './core/auth.guards';

/** Chaque page est chargée à la demande (lazy loading) pour un premier affichage plus rapide. */
export const routes: Routes = [
  { path: '', title: "Le Grand Cinéma – À l'affiche", loadComponent: () => import('./features/films/film-list').then((m) => m.FilmList) },
  { path: 'films/:id', title: 'Le Grand Cinéma – Film', loadComponent: () => import('./features/films/film-detail').then((m) => m.FilmDetail) },
  { path: 'connexion', title: 'Le Grand Cinéma – Connexion', loadComponent: () => import('./features/auth/connexion').then((m) => m.Connexion) },
  { path: 'inscription', title: 'Le Grand Cinéma – Inscription', loadComponent: () => import('./features/auth/inscription').then((m) => m.Inscription) },
  {
    path: 'seances/:id/reserver',
    title: 'Le Grand Cinéma – Réservation',
    canActivate: [connecteGuard],
    loadComponent: () => import('./features/reservation/reserver').then((m) => m.Reserver),
  },
  {
    path: 'mes-reservations',
    title: 'Le Grand Cinéma – Mes réservations',
    canActivate: [connecteGuard],
    loadComponent: () => import('./features/reservation/mes-reservations').then((m) => m.MesReservations),
  },
  {
    path: 'admin',
    title: 'Le Grand Cinéma – Back-office',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  { path: '**', redirectTo: '' },
];
