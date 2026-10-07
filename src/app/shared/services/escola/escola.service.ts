import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Curso, Escola } from '../../models';
import { CursoService } from '../curso';

@Injectable({
  providedIn: 'root'
})
export class EscolaService {
  private apiUrl = `${environment.apiUrl}/escolas`;

  constructor(
    private http: HttpClient,
    private cursoService: CursoService
  ) { }

  getEscolas(): Observable<Escola[]> {
    return this.http.get<Escola[]>(this.apiUrl);
  }

  getEscola(id: number): Observable<Escola> {
    return this.http.get<Escola>(`${this.apiUrl}/${id}`);
  }

  addEscola(escola: Escola): Observable<Escola> {
    return this.http.post<Escola>(this.apiUrl, escola);
  }

  updateEscola(escola: Escola): Observable<Escola> {
    return this.http.put<Escola>(`${this.apiUrl}/${escola.id}`, escola);
  }

  deleteEscola(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCursosByEscola(escolaId: number): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${environment.apiUrl}/cursos`).pipe(
      map(cursos => cursos.filter(curso => curso.escolaId === escolaId))
    );
  }
}
