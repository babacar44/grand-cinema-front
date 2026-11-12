import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Film, messageErreur } from '../../core/models';

/** US 36 et 38 – Back-office : gestion des films et programmation des séances (rôle ADMIN). */
@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Back-office</h1>
    @if (message()) { <p class="succes">{{ message() }}</p> }
    @if (erreur()) { <p class="erreur">{{ erreur() }}</p> }

    <div class="colonnes">
      <section>
        <h2>Ajouter un film</h2>
        <form [formGroup]="formFilm" (ngSubmit)="ajouterFilm()">
          <label>Titre <input formControlName="titre" /></label>
          <label>Durée (min) <input type="number" formControlName="dureeMinutes" /></label>
          <label>Genre <input formControlName="genre" /></label>
          <label>Réalisateur <input formControlName="realisateur" /></label>
          <label>Âge minimum <input type="number" formControlName="ageMinimum" /></label>
          <label>Synopsis <textarea formControlName="synopsis" rows="3"></textarea></label>
          <button type="submit" [disabled]="formFilm.invalid">Ajouter le film</button>
        </form>
      </section>

      <section>
        <h2>Programmer une séance</h2>
        <form [formGroup]="formSeance" (ngSubmit)="programmer()">
          <label>Film
            <select formControlName="filmId">
              @for (f of films(); track f.id) { <option [value]="f.id">{{ f.titre }}</option> }
            </select>
          </label>
          <label>Salle
            <select formControlName="salleId">
              @for (n of salles; track n) { <option [value]="n">Salle {{ n }}</option> }
            </select>
          </label>
          <label>Début <input type="datetime-local" formControlName="debut" /></label>
          <label>Version
            <select formControlName="version"><option>VF</option><option>VOSTFR</option></select>
          </label>
          <button type="submit" [disabled]="formSeance.invalid">Programmer</button>
          <p class="aide">La fin est calculée automatiquement (durée du film + 20 min). Une séance qui chevauche une autre est refusée.</p>
        </form>
      </section>
    </div>

    <h2>Films</h2>
    <table class="tableau">
      <thead><tr><th>Titre</th><th>Genre</th><th>Durée</th><th></th></tr></thead>
      <tbody>
        @for (f of films(); track f.id) {
          <tr>
            <td>{{ f.titre }}</td><td>{{ f.genre }}</td><td>{{ f.dureeMinutes }} min</td>
            <td><button class="secondaire" (click)="archiver(f)">Archiver</button></td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class Admin implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly salles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly films = signal<Film[]>([]);
  readonly message = signal<string | null>(null);
  readonly erreur = signal<string | null>(null);

  readonly formFilm = this.fb.group({
    titre: ['', Validators.required],
    dureeMinutes: [100, [Validators.required, Validators.min(1)]],
    genre: [''],
    realisateur: [''],
    ageMinimum: [0, [Validators.required, Validators.min(0)]],
    synopsis: [''],
  });

  readonly formSeance = this.fb.group({
    filmId: [0, Validators.min(1)],
    salleId: [1, Validators.required],
    debut: ['', Validators.required],
    version: ['VF'],
  });

  ngOnInit(): void {
    this.charger();
  }

  ajouterFilm(): void {
    this.api.creerFilm(this.formFilm.getRawValue()).subscribe({
      next: (f) => {
        this.succes(`Film « ${f.titre} » ajouté`);
        this.formFilm.reset();
        this.charger();
      },
      error: (e) => this.echec(e),
    });
  }

  programmer(): void {
    const v = this.formSeance.getRawValue();
    this.api.creerSeance({ ...v, filmId: Number(v.filmId), salleId: Number(v.salleId) }).subscribe({
      next: (s) => this.succes(`Séance programmée : ${s.filmTitre}, ${s.salleNom}`),
      error: (e) => this.echec(e),   // 409 si chevauchement
    });
  }

  archiver(f: Film): void {
    this.api.archiverFilm(f.id).subscribe({
      next: () => {
        this.succes(`Film « ${f.titre} » archivé`);
        this.charger();
      },
      error: (e) => this.echec(e),
    });
  }

  private charger(): void {
    this.api.tousLesFilms().subscribe({
      next: (f) => {
        this.films.set(f);
        if (f.length && !this.formSeance.value.filmId) {
          this.formSeance.patchValue({ filmId: f[0].id });
        }
      },
      error: (e) => this.echec(e),
    });
  }

  private succes(m: string): void {
    this.erreur.set(null);
    this.message.set(m);
  }

  private echec(e: unknown): void {
    this.message.set(null);
    this.erreur.set(messageErreur(e));
  }
}
