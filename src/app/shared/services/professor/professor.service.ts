import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Professor } from '../..';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/professores`;

  getProfessor(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.apiUrl}/${id}`);
  }

  getProfessores(): Observable<Professor[]> {
    return this.http.get<Professor[]>(this.apiUrl);
  }

  addProfessor(prof: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.apiUrl, prof);
  }

  updateProfessor(prof: Professor): Observable<Professor> {
    return this.http.put<Professor>(`${this.apiUrl}/${prof.id}`, prof);
  }

  deleteProfessor(prof: Professor): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${prof.id}`);
  }

  toggleAtivo(id: number): Observable<Professor> {
    return this.http.patch<Professor>(`${this.apiUrl}/${id}/toggle-ativo`, {});
  }
}
