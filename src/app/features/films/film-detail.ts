import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { FilmDetail as FilmDetailModel, messageErreur } from '../../core/models';

/** US 10 et 11 – Fiche du film et ses séances des 7 prochains jours. */
@Component({
  selector: 'app-film-detail',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  template: `
    @if (fiche(); as f) {
      <a routerLink="/" class="retour">← Tous les films</a>
      <h1>{{ f.film.titre }}</h1>
      <p class="meta">
        {{ f.film.genre }} · {{ f.film.dureeMinutes }} min · Réalisé par {{ f.film.realisateur }}
        @if (f.film.ageMinimum > 0) { · Interdit aux moins de {{ f.film.ageMinimum }} ans }
      </p>
      <p>{{ f.film.synopsis }}</p>

      <h2>Séances</h2>
      <table class="tableau">
        <thead>
          <tr><th>Date</th><th>Heure</th><th>Salle</th><th>Version</th><th>Prix</th><th></th></tr>
        </thead>
        <tbody>
          @for (s of f.seances; track s.id) {
            <tr>
              <td>{{ s.debut | date: 'EEEE d MMMM' }}</td>
              <td>{{ s.debut | date: 'HH:mm' }}</td>
              <td>{{ s.salleNom }} ({{ s.typeSalle }})</td>
              <td>{{ s.version }}</td>
              <td>{{ s.prix | currency: 'EUR' }}</td>
              <td>
                @if (s.complet) {
                  <span class="badge complet">Complet</span>
                } @else {
                  <a class="bouton" [routerLink]="['/seances', s.id, 'reserver']">
                    Réserver ({{ s.placesDisponibles }} places)
                  </a>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6">Aucune séance programmée dans les 7 prochains jours.</td></tr>
          }
        </tbody>
      </table>
    } @else if (erreur()) {
      <p class="erreur">{{ erreur() }}</p>
    } @else {
      <p class="info">Chargement…</p>
    }
  `,
})
export class FilmDetail implements OnInit {
  private readonly api = inject(ApiService);
  /** Paramètre de route :id (liaison automatique grâce à withComponentInputBinding). */
  readonly id = input.required<string>();
  readonly fiche = signal<FilmDetailModel | null>(null);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.api.ficheFilm(Number(this.id())).subscribe({
      next: (f) => this.fiche.set(f),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }
}
