import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Referencia, TipoAcervo, TipoReferencia } from '../../models/referencia.model';

@Injectable({
  providedIn: 'root'
})

export class ReferenciaService {
  private referencias: Referencia[] = [
    {
      id: 1,
      programaId: 1,
      titulo: 'Algoritmos: Teoria e Prática',
      autores: 'Cormen, Leiserson, Rivest, Stein',
      edicao: 3,
      local: 'São Paulo',
      editora: 'Elsevier',
      isbn: '978-8535236996',
      acervo: TipoAcervo.FISICO,
      tipoReferencia: TipoReferencia.COMPLEMENTAR,
      urlAcesso: null,
      dataAcesso: null,
    },
    {
      id: 2,
      programaId: 1,
      titulo: 'Clean Code: Habilidades Práticas do Agile Software',
      autores: 'Robert C. Martin',
      edicao: 1,
      local: 'Rio de Janeiro',
      editora: 'Alta Books',
      isbn: '978-8576082675',
      acervo: TipoAcervo.DIGITAL,
      tipoReferencia: TipoReferencia.BASICA,
      urlAcesso: 'https://example.com/cleancode.pdf',
      dataAcesso: new Date('2025-01-10'),
    },
    {
      id: 3,
      programaId: 2,
      titulo: 'História da Civilização Ocidental',
      autores: 'Edward McNall Burns',
      edicao: 7,
      local: 'São Paulo',
      editora: 'Globo',
      isbn: '978-8525053865',
      acervo: TipoAcervo.FISICO,
      tipoReferencia: TipoReferencia.BASICA,
      urlAcesso: null,
      dataAcesso: null,
    },
  ];

  private referenciasSubject = new BehaviorSubject<Referencia[]>(this.referencias);

  getReferencias(): Observable<Referencia[]> {
    return this.referenciasSubject.asObservable();
  }

  getReferencia(id: number): Observable<Referencia | undefined> {
    return this.referenciasSubject.asObservable().pipe(
      map((refs) => refs.find((r) => r.id == id))
    );
  }

  getReferenciasByPrograma(programaId: number): Observable<Referencia[]> {
    return this.referenciasSubject.asObservable().pipe(
      map((refs) => refs.filter((r) => r.programaId == programaId))
    );
  }

  addReferencia(referencia: Referencia): void {
    const nextId = (this.referencias.at(-1)?.id ?? 0) + 1;
    const nova = { ...referencia, id: referencia.id ?? nextId };
    this.referencias.push(nova);
    this.referenciasSubject.next([...this.referencias]);
  }

  updateReferencia(referencia: Referencia): void {
    if (referencia.id == null) return;
    const idx = this.referencias.findIndex((r) => r.id == referencia.id);
    if (idx > -1) {
      this.referencias[idx] = { ...this.referencias[idx], ...referencia };
      this.referenciasSubject.next([...this.referencias]);
    }
  }

  deleteReferencia(id: number): void {
    const idx = this.referencias.findIndex((r) => r.id == id);
    if (idx > -1) {
      this.referencias.splice(idx, 1);
      this.referenciasSubject.next([...this.referencias]);
    }
  }
}
