import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Film, FilmDetail, PlanSalle, Reservation, Seance } from './models';

/** Appels de l'API pour le catalogue, la réservation et le back-office. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  // ---------- Catalogue (US 9 à 11) ----------
  films(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.url}/films`);
  }

  ficheFilm(id: number): Observable<FilmDetail> {
    return this.http.get<FilmDetail>(`${this.url}/films/${id}`);
  }

  seance(id: number): Observable<Seance> {
    return this.http.get<Seance>(`${this.url}/seances/${id}`);
  }

  // ---------- Réservation (US 16 à 20, 30, 31) ----------
  planDeSalle(seanceId: number): Observable<PlanSalle> {
    return this.http.get<PlanSalle>(`${this.url}/seances/${seanceId}/plan`);
  }

  reserver(seanceId: number, placeIds: number[]): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.url}/reservations`, { seanceId, placeIds });
  }

  confirmer(reservationId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.url}/reservations/${reservationId}/confirmer`, {});
  }

  annuler(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/reservations/${reservationId}`);
  }

  mesReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.url}/reservations/mes`);
  }

  // ---------- Back-office (US 36, 38) ----------
  tousLesFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.url}/admin/films`);
  }

  creerFilm(film: Omit<Film, 'id'>): Observable<Film> {
    return this.http.post<Film>(`${this.url}/admin/films`, film);
  }

  archiverFilm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/admin/films/${id}`);
  }

  creerSeance(seance: { filmId: number; salleId: number; debut: string; version: string }): Observable<Seance> {
    return this.http.post<Seance>(`${this.url}/admin/seances`, seance);
  }
}
