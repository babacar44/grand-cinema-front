import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Film, messageErreur } from '../../core/models';

/** US 9 – Films à l'affiche. */
@Component({
  selector: 'app-film-list',
  imports: [RouterLink],
  template: `
    <h1>À l'affiche</h1>
    @if (chargement()) {
      <p class="info">Chargement des films…</p>
    } @else if (erreur()) {
      <p class="erreur">{{ erreur() }}</p>
    } @else {
      <div class="grille">
        @for (film of films(); track film.id) {
          <a class="carte" [routerLink]="['/films', film.id]">
            <div class="affiche">
              @if (film.afficheUrl) {
                <img [src]="film.afficheUrl" [alt]="'Affiche de ' + film.titre" />
              } @else {
                <span>🎬</span>
              }
            </div>
            <h2>{{ film.titre }}</h2>
            <p class="meta">{{ film.genre }} · {{ film.dureeMinutes }} min
              @if (film.ageMinimum > 0) { · -{{ film.ageMinimum }} ans }
            </p>
          </a>
        } @empty {
          <p class="info">Aucun film à l'affiche pour le moment.</p>
        }
      </div>
    }
  `,
})
export class FilmList implements OnInit {
  private readonly api = inject(ApiService);
  readonly films = signal<Film[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.api.films().subscribe({
      next: (f) => {
        this.films.set(f);
        this.chargement.set(false);
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }
}
