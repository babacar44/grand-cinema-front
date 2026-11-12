import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { messageErreur } from '../../core/models';

/** Même règle que l'API : 8 caractères, une majuscule, un chiffre, un caractère spécial. */
const REGLE_MOT_DE_PASSE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/** US 1 – Création de compte. */
@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="formulaire">
      <h1>Créer un compte</h1>
      <form [formGroup]="form" (ngSubmit)="valider()">
        <label>Nom <input formControlName="nom" autocomplete="family-name" /></label>
        <label>Prénom <input formControlName="prenom" autocomplete="given-name" /></label>
        <label>E-mail <input type="email" formControlName="email" autocomplete="email" /></label>
        <label>Mot de passe <input type="password" formControlName="motDePasse" autocomplete="new-password" /></label>
        @if (form.controls.motDePasse.touched && form.controls.motDePasse.invalid) {
          <p class="aide">8 caractères minimum, avec une majuscule, un chiffre et un caractère spécial.</p>
        }
        <label class="case">
          <input type="checkbox" formControlName="cgu" /> J'accepte les CGU et la politique de confidentialité
        </label>
        @if (erreur()) { <p class="erreur">{{ erreur() }}</p> }
        <button type="submit" [disabled]="form.invalid || envoi()">Créer mon compte</button>
      </form>
      <p>Déjà inscrit ? <a routerLink="/connexion">Se connecter</a></p>
    </section>
  `,
})
export class Inscription {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = inject(FormBuilder).nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.pattern(REGLE_MOT_DE_PASSE)]],
    cgu: [false, Validators.requiredTrue],
  });
  readonly erreur = signal<string | null>(null);
  readonly envoi = signal(false);

  valider(): void {
    this.envoi.set(true);
    this.erreur.set(null);
    const { nom, prenom, email, motDePasse } = this.form.getRawValue();
    this.auth.inscrire({ nom, prenom, email, motDePasse }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.envoi.set(false);
      },
    });
  }
}
