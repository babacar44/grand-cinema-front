/** Types identiques aux DTO renvoyés par l'API Spring Boot. */

export type Role = 'CLIENT' | 'AGENT' | 'ADMIN';

export interface AuthResponse {
  token?: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
}

export interface Film {
  id: number;
  titre: string;
  synopsis?: string;
  dureeMinutes: number;
  genre?: string;
  realisateur?: string;
  ageMinimum: number;
  afficheUrl?: string;
}

export interface Seance {
  id: number;
  filmId: number;
  filmTitre: string;
  debut: string;
  fin: string;
  version: 'VF' | 'VOSTFR';
  salleId: number;
  salleNom: string;
  typeSalle: string;
  prix: number;
  placesDisponibles: number;
  complet: boolean;
}

export interface FilmDetail {
  film: Film;
  seances: Seance[];
}

export interface Place {
  id: number;
  rangee: string;
  numero: number;
  pmr: boolean;
  libre: boolean;
}

export interface PlanSalle {
  seanceId: number;
  salleNom: string;
  typeSalle: string;
  prixPlace: number;
  placesLibres: number;
  places: Place[];
}

export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'EXPIREE' | 'UTILISEE';

export interface Reservation {
  id: number;
  statut: StatutReservation;
  seanceId: number;
  filmTitre: string;
  debut: string;
  salleNom: string;
  typeSalle: string;
  places: string[];
  montantTotal: number;
  dateExpiration: string;
  codeBillet?: string;
}

/** Message d'erreur renvoyé par l'API (format Problem Details). */
export function messageErreur(err: unknown): string {
  const e = err as { error?: { detail?: string; erreurs?: Record<string, string> }; status?: number };
  if (e?.status === 0) {
    return "Le serveur ne répond pas. S'il était en veille, réessayez dans une minute.";
  }
  if (e?.error?.erreurs) {
    return Object.values(e.error.erreurs).join(' · ');
  }
  return e?.error?.detail ?? 'Une erreur est survenue';
}
