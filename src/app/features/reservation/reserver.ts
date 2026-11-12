import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Place, PlanSalle, Reservation, Seance, messageErreur } from '../../core/models';

const MAX_PLACES = 10;

/**
 * US 16 à 20 et paiement simulé :
 * plan de salle → choix des places → blocage 10 min avec compte à rebours → récapitulatif → paiement.
 */
@Component({
  selector: 'app-reserver',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    @if (seance(); as s) {
      <a [routerLink]="['/films', s.filmId]" class="retour">← {{ s.filmTitre }}</a>
      <h1>{{ s.filmTitre }}</h1>
      <p class="meta">{{ s.debut | date: 'EEEE d MMMM à HH:mm' }} · {{ s.salleNom }} ({{ s.typeSalle }}) · {{ s.version }}</p>
    }
    @if (erreur()) { <p class="erreur">{{ erreur() }}</p> }

    @if (reservation(); as r) {
      <!-- US 20 : récapitulatif avant paiement -->
      <section class="recap">
        @if (r.statut === 'EN_ATTENTE') {
          <h2>Récapitulatif</h2>
          <p>Places : <strong>{{ r.places.join(', ') }}</strong></p>
          <p>Total : <strong>{{ r.montantTotal | currency: 'EUR' }}</strong></p>
          <p class="compte-a-rebours">Vos places sont bloquées encore <strong>{{ tempsRestant() }}</strong></p>
          <div class="actions">
            <button (click)="payer(r)" [disabled]="envoi() || expiree()">Payer {{ r.montantTotal | currency: 'EUR' }}</button>
            <button class="secondaire" (click)="modifier(r)" [disabled]="envoi()">Modifier mes places</button>
          </div>
          <p class="aide">Paiement simulé pour cette version (le paiement par carte est prévu en V2).</p>
        } @else if (r.statut === 'CONFIRMEE') {
          <h2>✅ Réservation confirmée</h2>
          <p>Votre billet est disponible dans <a routerLink="/mes-reservations">Mes réservations</a>.</p>
        }
      </section>
    } @else if (plan(); as p) {
      <!-- US 16 et 17 : plan de salle et sélection -->
      <p>{{ p.placesLibres }} places libres · {{ p.prixPlace | currency: 'EUR' }} la place · 10 places maximum</p>
      <div class="ecran">ÉCRAN</div>
      <div class="plan">
        @for (rangee of rangees(); track rangee.nom) {
          <div class="rangee">
            <span class="lettre">{{ rangee.nom }}</span>
            @for (place of rangee.places; track place.id) {
              <button type="button" class="siege"
                      [class.occupe]="!place.libre"
                      [class.selectionne]="selection().has(place.id)"
                      [class.pmr]="place.pmr"
                      [disabled]="!place.libre"
                      [attr.aria-label]="'Place ' + place.rangee + place.numero + (place.libre ? '' : ' occupée')"
                      [title]="place.rangee + place.numero + (place.pmr ? ' (PMR)' : '')"
                      (click)="basculer(place)">
                {{ place.numero }}
              </button>
            }
          </div>
        }
      </div>
      <p class="legende">
        <span class="siege"></span> Libre <span class="siege selectionne"></span> Sélectionnée
        <span class="siege occupe"></span> Occupée <span class="siege pmr"></span> PMR
      </p>
      <!-- US 18 : prix total mis à jour à chaque sélection -->
      <div class="barre-total">
        <span>{{ selection().size }} place(s) · <strong>{{ total() | currency: 'EUR' }}</strong></span>
        <button (click)="reserver()" [disabled]="selection().size === 0 || envoi()">Réserver</button>
      </div>
    } @else if (!erreur()) {
      <p class="info">Chargement du plan de salle…</p>
    }
  `,
})
export class Reserver implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Paramètre de route :id = identifiant de la séance. */
  readonly id = input.required<string>();

  readonly seance = signal<Seance | null>(null);
  readonly plan = signal<PlanSalle | null>(null);
  readonly selection = signal<Set<number>>(new Set());
  readonly reservation = signal<Reservation | null>(null);
  readonly erreur = signal<string | null>(null);
  readonly envoi = signal(false);
  private readonly maintenant = signal(Date.now());

  readonly total = computed(() => this.selection().size * (this.plan()?.prixPlace ?? 0));

  /** Places regroupées par rangée pour l'affichage. */
  readonly rangees = computed(() => {
    const groupes = new Map<string, Place[]>();
    for (const p of this.plan()?.places ?? []) {
      groupes.set(p.rangee, [...(groupes.get(p.rangee) ?? []), p]);
    }
    return [...groupes.entries()].map(([nom, places]) => ({ nom, places }));
  });

  readonly secondesRestantes = computed(() => {
    const r = this.reservation();
    return r ? Math.max(0, Math.floor((new Date(r.dateExpiration).getTime() - this.maintenant()) / 1000)) : 0;
  });
  readonly expiree = computed(() => this.secondesRestantes() === 0);
  readonly tempsRestant = computed(() => {
    const s = this.secondesRestantes();
    return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
  });

  ngOnInit(): void {
    const seanceId = Number(this.id());
    this.api.seance(seanceId).subscribe({ next: (s) => this.seance.set(s), error: (e) => this.erreur.set(messageErreur(e)) });
    this.chargerPlan();
    // US 19 : compte à rebours mis à jour chaque seconde
    const minuteur = setInterval(() => this.maintenant.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(minuteur));
  }

  basculer(place: Place): void {
    const s = new Set(this.selection());
    if (s.has(place.id)) {
      s.delete(place.id);
    } else if (s.size < MAX_PLACES) {
      s.add(place.id);
    } else {
      this.erreur.set(`${MAX_PLACES} places maximum par réservation`);
      return;
    }
    this.erreur.set(null);
    this.selection.set(s);
  }

  reserver(): void {
    this.envoi.set(true);
    this.erreur.set(null);
    this.api.reserver(Number(this.id()), [...this.selection()]).subscribe({
      next: (r) => {
        this.reservation.set(r);
        this.envoi.set(false);
      },
      error: (e) => {
        // 409 : une place vient d'être prise par un autre client → on rafraîchit le plan
        this.erreur.set(messageErreur(e));
        this.envoi.set(false);
        this.selection.set(new Set());
        this.chargerPlan();
      },
    });
  }

  payer(r: Reservation): void {
    this.envoi.set(true);
    this.api.confirmer(r.id).subscribe({
      next: (confirmee) => {
        this.reservation.set(confirmee);
        this.envoi.set(false);
        this.router.navigate(['/mes-reservations']);
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.envoi.set(false);
      },
    });
  }

  /** Retour au plan : la réservation en attente est abandonnée et les places libérées. */
  modifier(r: Reservation): void {
    this.api.annuler(r.id).subscribe({
      next: () => {
        this.reservation.set(null);
        this.selection.set(new Set());
        this.chargerPlan();
      },
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }

  private chargerPlan(): void {
    this.api.planDeSalle(Number(this.id())).subscribe({
      next: (p) => this.plan.set(p),
      error: (e) => this.erreur.set(messageErreur(e)),
    });
  }
}
