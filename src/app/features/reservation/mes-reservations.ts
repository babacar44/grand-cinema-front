import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { ApiService } from '../../core/api.service';
import { Reservation, messageErreur } from '../../core/models';

/** US 31 – Mes réservations, et US 30 – billet dématérialisé avec QR code. */
@Component({
  selector: 'app-mes-reservations',
  imports: [CurrencyPipe, DatePipe, QRCodeComponent],
  template: `
    <h1>Mes réservations</h1>
    @if (erreur()) { <p class="erreur">{{ erreur() }}</p> }
    <div class="billets">
      @for (r of reservations(); track r.id) {
        <article class="billet" [class.inactif]="r.statut !== 'CONFIRMEE'">
          <div>
            <h2>{{ r.filmTitre }}</h2>
            <p>{{ r.debut | date: 'EEEE d MMMM à HH:mm' }}</p>
            <p>{{ r.salleNom }} ({{ r.typeSalle }}) · Places {{ r.places.join(', ') }}</p>
            <p>{{ r.montantTotal | currency: 'EUR' }} · <span class="badge">{{ libelle(r.statut) }}</span></p>
          </div>
          @if (r.statut === 'CONFIRMEE' && r.codeBillet) {
            <div class="qr">
              <qrcode [qrdata]="r.codeBillet" [width]="140" errorCorrectionLevel="M" />
              <small>N° {{ r.id }}</small>
            </div>
          }
        </article>
      } @empty {
        @if (!chargement()) { <p class="info">Vous n'avez pas encore de réservation.</p> }
      }
    </div>
  `,
})
export class MesReservations implements OnInit {
  private readonly api = inject(ApiService);
  readonly reservations = signal<Reservation[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.api.mesReservations().subscribe({
      next: (r) => {
        this.reservations.set(r);
        this.chargement.set(false);
      },
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }

  libelle(statut: Reservation['statut']): string {
    return {
      EN_ATTENTE: 'En attente de paiement',
      CONFIRMEE: 'Confirmée',
      ANNULEE: 'Annulée',
      EXPIREE: 'Expirée',
      UTILISEE: 'Utilisée',
    }[statut];
  }
}
