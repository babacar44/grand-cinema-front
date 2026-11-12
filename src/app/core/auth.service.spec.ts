import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('ouvre une session après une connexion réussie (US 2)', () => {
    service.connecter('client@grandcinema.fr', 'Client123!').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/connexion`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jeton', id: 2, email: 'client@grandcinema.fr', nom: 'Dupont', prenom: 'Marie', role: 'CLIENT' });

    expect(service.estConnecte()).toBeTrue();
    expect(service.estAdmin()).toBeFalse();
    expect(service.token).toBe('jeton');
  });

  it('supprime le jeton à la déconnexion (US 3)', () => {
    service.utilisateur.set({ id: 1, email: 'a@b.fr', nom: 'A', prenom: 'B', role: 'CLIENT', token: 'jeton' });

    service.deconnecter();

    expect(service.estConnecte()).toBeFalse();
    expect(localStorage.getItem('grand-cinema-session')).toBeNull();
  });
});
