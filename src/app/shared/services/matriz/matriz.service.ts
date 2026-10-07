import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Matriz } from '../../models/matriz.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MatrizService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/matrizes`;

  getMatrizes(): Observable<Matriz[]> {
    return this.http.get<Matriz[]>(this.apiUrl);
  }

  getMatriz(id: number): Observable<Matriz> {
    return this.http.get<Matriz>(`${this.apiUrl}/${id}`);
  }

  addMatriz(matriz: Matriz): Observable<Matriz> {
    return this.http.post<Matriz>(this.apiUrl, matriz);
  }

  updateMatriz(matriz: Matriz): Observable<Matriz> {
    return this.http.put<Matriz>(`${this.apiUrl}/${matriz.id}`, matriz);
  }

  deleteMatriz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMatrizesByDisciplinaSigla(sigla: string | undefined): Observable<Matriz[]> {
    return this.http.get<Matriz[]>(`${this.apiUrl}/disciplina/${sigla}`);
  }
}
