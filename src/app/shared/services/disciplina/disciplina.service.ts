import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Disciplina } from '../../models';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DisciplinaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/disciplinas`;

  getDisciplinas(): Observable<Disciplina[]> {
    return this.http.get<Disciplina[]>(this.apiUrl);
  }

  getDisciplina(id: number): Observable<Disciplina> {
    return this.http.get<Disciplina>(`${this.apiUrl}/${id}`);
  }

  addDisciplina(disciplina: Disciplina): Observable<Disciplina> {
    return this.http.post<Disciplina>(this.apiUrl, disciplina);
  }

  updateDisciplina(disciplina: Disciplina): Observable<Disciplina> {
    return this.http.put<Disciplina>(`${this.apiUrl}/${disciplina.id}`, disciplina);
  }

  deleteDisciplina(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alterna o status preservando os demais campos da disciplina
  toggleAtiva(id: number): Observable<Disciplina> {
    return this.getDisciplina(id).pipe(
      switchMap((disciplina) => {
        const atualizada: Disciplina = {
          ...disciplina,
          ativa: !disciplina.ativa
        };
        return this.updateDisciplina(atualizada);
      })
    );
  }

}
