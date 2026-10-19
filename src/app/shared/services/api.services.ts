import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuditLog,
  CentroAcademico,
  CentroAcademicoRequest,
  Curso,
  CursoRequest,
  Discente,
  DiscenteRequest,
  Disciplina,
  DisciplinaRequest,
  Docente,
  DocenteRequest,
  Historico,
  Ies,
  IesRequest,
  Monitoria,
  MonitoriaRequest,
  RelatorioMonitoria,
  RelatorioRequest,
  StatusRequest,
  TipoEntidade,
  Usuario,
  UsuarioRequest,
} from '../models';

/** Operações padrão dos cadastros: listar, buscar, cadastrar, editar, inativar/reativar e excluir. */
export abstract class CrudService<T, R> {
  protected http = inject(HttpClient);
  protected readonly url: string;

  protected constructor(recurso: string) {
    this.url = `${environment.apiUrl}/${recurso}`;
  }

  listar(params?: Record<string, string | number | null | undefined>): Observable<T[]> {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<T[]>(this.url, { params: httpParams });
  }

  buscar(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  criar(req: R): Observable<T> {
    return this.http.post<T>(this.url, req);
  }

  atualizar(id: number, req: R): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, req);
  }

  alterarStatus(id: number, req: StatusRequest): Observable<T> {
    return this.http.patch<T>(`${this.url}/${id}/status`, req);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class IesService extends CrudService<Ies, IesRequest> {
  constructor() { super('ies'); }
}

@Injectable({ providedIn: 'root' })
export class CentroAcademicoService extends CrudService<CentroAcademico, CentroAcademicoRequest> {
  constructor() { super('centros-academicos'); }
}

@Injectable({ providedIn: 'root' })
export class CursoService extends CrudService<Curso, CursoRequest> {
  constructor() { super('cursos'); }
}

@Injectable({ providedIn: 'root' })
export class DocenteService extends CrudService<Docente, DocenteRequest> {
  constructor() { super('docentes'); }
}

@Injectable({ providedIn: 'root' })
export class DiscenteService extends CrudService<Discente, DiscenteRequest> {
  constructor() { super('discentes'); }
}

@Injectable({ providedIn: 'root' })
export class DisciplinaService extends CrudService<Disciplina, DisciplinaRequest> {
  constructor() { super('disciplinas'); }
}

@Injectable({ providedIn: 'root' })
export class MonitoriaService extends CrudService<Monitoria, MonitoriaRequest> {
  constructor() { super('monitorias'); }

  buscarRelatorio(monitoriaId: number): Observable<RelatorioMonitoria> {
    return this.http.get<RelatorioMonitoria>(`${this.url}/${monitoriaId}/relatorio`);
  }

  salvarRelatorio(monitoriaId: number, req: RelatorioRequest): Observable<RelatorioMonitoria> {
    return this.http.put<RelatorioMonitoria>(`${this.url}/${monitoriaId}/relatorio`, req);
  }

  alterarStatusRelatorio(monitoriaId: number, req: StatusRequest): Observable<RelatorioMonitoria> {
    return this.http.patch<RelatorioMonitoria>(`${this.url}/${monitoriaId}/relatorio/status`, req);
  }
}

@Injectable({ providedIn: 'root' })
export class UsuarioService extends CrudService<Usuario, UsuarioRequest> {
  constructor() { super('usuarios'); }

  alterarMinhaSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/user/me/senha`, { senhaAtual, novaSenha });
  }
}

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private http = inject(HttpClient);

  listar(tipo: TipoEntidade, id: number): Observable<Historico[]> {
    return this.http.get<Historico[]>(`${environment.apiUrl}/historico`, { params: { tipo, id } });
  }
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private http = inject(HttpClient);

  listar(size = 500): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${environment.apiUrl}/auditoria`, { params: { size } });
  }
}

/** Baixa os relatórios em PDF gerados pelo BACK-END. */
@Injectable({ providedIn: 'root' })
export class PdfService {
  private http = inject(HttpClient);

  baixar(caminho: string, nomeArquivo: string, params?: Record<string, string>): Observable<void> {
    return this.http
      .get(`${environment.apiUrl}/${caminho}`, { params, responseType: 'blob' })
      .pipe(
        tap((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = nomeArquivo;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }),
        map(() => void 0),
        // Erros de download chegam como Blob: converte para { message } como nas demais rotas
        catchError((err: HttpErrorResponse) =>
          err.error instanceof Blob
            ? from(err.error.text()).pipe(
                switchMap((texto) => {
                  let corpo: any = {};
                  try { corpo = JSON.parse(texto); } catch { /* corpo não-JSON */ }
                  return throwError(() => ({ ...err, error: corpo }));
                })
              )
            : throwError(() => err)
        )
      );
  }
}
