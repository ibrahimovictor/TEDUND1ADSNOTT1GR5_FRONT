import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlteracaoPrograma, Programa } from '../../models/programa.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/programas`;

  getProgramas(): Observable<Programa[]> {
    return this.http.get<Programa[]>(this.apiUrl);
  }

  getPrograma(id: number): Observable<Programa> {
    return this.http.get<Programa>(`${this.apiUrl}/${id}`);
  }

  addPrograma(programa: Programa): Observable<Programa> {
    return this.http.post<Programa>(this.apiUrl, programa);
  }

  updatePrograma(programa: Programa): Observable<Programa> {
    return this.http.put<Programa>(`${this.apiUrl}/${programa.id}`, programa);
  }

  deletePrograma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProgramasByDisciplina(disciplinaId: number): Observable<Programa[]> {
    return this.http.get<Programa[]>(`${this.apiUrl}/disciplina/${disciplinaId}`);
  }

  getAlteracoesPrograma(idPrograma: number): Observable<any[]> {
     return this.http.get<any[]>(`${this.apiUrl}/programa/${idPrograma}`);
  }

  addAlteracaoPrograma(alteracao: AlteracaoPrograma): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/programa`, alteracao);
  }
}
