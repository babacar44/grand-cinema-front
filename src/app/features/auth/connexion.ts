import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { messageErreur } from '../../core/models';

/** US 2 – Connexion. */
@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="formulaire">
      <h1>Connexion</h1>
      <form [formGroup]="form" (ngSubmit)="valider()">
        <label>E-mail <input type="email" formControlName="email" autocomplete="email" /></label>
        <label>Mot de passe <input type="password" formControlName="motDePasse" autocomplete="current-password" /></label>
        @if (erreur()) { <p class="erreur">{{ erreur() }}</p> }
        <button type="submit" [disabled]="form.invalid || envoi()">
          {{ envoi() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
      <p>Pas encore de compte ? <a routerLink="/inscription">Créer un compte</a></p>
    </section>
  `,
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });
  readonly erreur = signal<string | null>(null);
  readonly envoi = signal(false);

  valider(): void {
    this.envoi.set(true);
    this.erreur.set(null);
    const { email, motDePasse } = this.form.getRawValue();
    this.auth.connecter(email, motDePasse).subscribe({
      next: (u) => {
        const retour = this.route.snapshot.queryParamMap.get('retour');
        this.router.navigateByUrl(retour ?? (u.role === 'ADMIN' ? '/admin' : '/'));
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.envoi.set(false);
      },
    });
  }
}
