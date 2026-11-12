import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from './models';

const CLE_STOCKAGE = 'grand-cinema-session';

/** US 1 à 4 : inscription, connexion, déconnexion et rôle de l'utilisateur connecté. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Utilisateur connecté (null si visiteur), conservé après un rechargement de la page. */
  readonly utilisateur = signal<AuthResponse | null>(this.lireSession());
  readonly estConnecte = computed(() => this.utilisateur() !== null);
  readonly estAdmin = computed(() => this.utilisateur()?.role === 'ADMIN');

  get token(): string | null {
    return this.utilisateur()?.token ?? null;
  }

  inscrire(donnees: { nom: string; prenom: string; email: string; motDePasse: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/inscription`, donnees)
      .pipe(tap((r) => this.ouvrirSession(r)));
  }

  connecter(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/connexion`, { email, motDePasse })
      .pipe(tap((r) => this.ouvrirSession(r)));
  }

  /** US 3 : avec un JWT, se déconnecter = supprimer le jeton côté navigateur. */
  deconnecter(): void {
    localStorage.removeItem(CLE_STOCKAGE);
    this.utilisateur.set(null);
    this.router.navigate(['/']);
  }

  private ouvrirSession(r: AuthResponse): void {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(r));
    this.utilisateur.set(r);
  }

  private lireSession(): AuthResponse | null {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      return brut ? (JSON.parse(brut) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
