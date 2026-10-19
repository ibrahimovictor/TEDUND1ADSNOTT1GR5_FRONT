import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuditLog, AuditoriaService, DynamicTable, DynamicTableColumn, InfoBarService } from '../../../shared';

/** RF 4 — Monitorar logs de auditoria de todas as ações executadas no sistema. */
@Component({
  selector: 'app-auditoria',
  imports: [DynamicTable, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <div class="pagina">
      <div class="pagina-header">
        <h1>Logs de auditoria</h1>
        <p class="subtitulo">Todas as ações executadas no sistema (as 500 mais recentes).</p>
      </div>
      <div class="barra">
        <mat-form-field class="busca" subscriptSizing="dynamic">
          <mat-label>Pesquisar</mat-label>
          <input matInput (keyup)="busca.set($any($event.target).value)" placeholder="Usuário, rota, status...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <span class="espaco"></span>
        <button mat-button (click)="carregar()"><mat-icon>refresh</mat-icon> Atualizar</button>
      </div>
      <app-dynamic-table [data]="dados()" [filter]="busca()" [columns]="colunas" [pageSize]="25"></app-dynamic-table>
    </div>
  `,
})
export class Auditoria {
  private service = inject(AuditoriaService);
  private infoBar = inject(InfoBarService);
  dados = signal<AuditLog[]>([]);
  busca = signal('');

  colunas: DynamicTableColumn[] = [
    { key: 'dataHora', label: 'Data/hora', type: 'datetime' },
    { key: 'username', label: 'Usuário' },
    { key: 'metodo', label: 'Ação', format: (v) => ({ GET: 'Consulta', POST: 'Cadastro', PUT: 'Alteração', PATCH: 'Status', DELETE: 'Exclusão' } as any)[v] ?? v },
    { key: 'caminho', label: 'Rota' },
    { key: 'status', label: 'Resultado', format: (v: number) => `${v} ${v < 400 ? '✔' : '✖'}` },
    { key: 'detalhe', label: 'Detalhe' },
    { key: 'ip', label: 'IP' },
  ];

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.service.listar().subscribe({
      next: (d) => this.dados.set(d),
      error: (err) => this.infoBar.error(err, 'Erro ao carregar a auditoria.'),
    });
  }
}
