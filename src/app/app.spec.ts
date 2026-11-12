import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { AuthService } from './core/auth.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('affiche le lien de connexion pour un visiteur', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Connexion');
  });

  it("affiche le lien du back-office seulement pour un administrateur (US 4)", () => {
    const auth = TestBed.inject(AuthService);
    auth.utilisateur.set({ id: 1, email: 'admin@grandcinema.fr', nom: 'Admin', prenom: 'Admin', role: 'ADMIN', token: 'x' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Back-office');
  });
});
