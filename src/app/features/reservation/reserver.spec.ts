import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Reserver } from './reserver';
import { Place } from '../../core/models';

describe('Reserver (US 17, 18)', () => {
  const place = (id: number): Place => ({ id, rangee: 'A', numero: id, pmr: false, libre: true });

  function creer() {
    TestBed.configureTestingModule({
      imports: [Reserver],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(Reserver);
    fixture.componentRef.setInput('id', '1');
    const c = fixture.componentInstance;
    c.plan.set({ seanceId: 1, salleNom: 'Salle 7', typeSalle: 'VIP', prixPlace: 18, placesLibres: 20, places: [] });
    return c;
  }

  it('calcule le total selon le nombre de places sélectionnées', () => {
    const c = creer();
    c.basculer(place(1));
    c.basculer(place(2));
    expect(c.total()).toBe(36);
  });

  it('désélectionne une place au second clic', () => {
    const c = creer();
    c.basculer(place(1));
    c.basculer(place(1));
    expect(c.selection().size).toBe(0);
  });

  it('refuse plus de 10 places', () => {
    const c = creer();
    for (let i = 1; i <= 11; i++) {
      c.basculer(place(i));
    }
    expect(c.selection().size).toBe(10);
    expect(c.erreur()).toContain('10 places maximum');
  });
});
