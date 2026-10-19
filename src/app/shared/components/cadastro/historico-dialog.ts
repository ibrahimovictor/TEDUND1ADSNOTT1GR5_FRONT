import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DynamicTable, DynamicTableColumn } from '../dynamic-table';
import { Historico, TipoEntidade } from '../../models';
import { HistoricoService, InfoBarService } from '../../services';

export interface HistoricoDialogData {
  tipo: TipoEntidade;
  id: number;
  titulo: string;
}

/** Histórico de inativações/reativações de um cadastro. */
@Component({
  selector: 'app-historico-dialog',
  imports: [MatDialogModule, MatButtonModule, DynamicTable],
  template: `
    <h2 mat-dialog-title>Histórico — {{ data.titulo }}</h2>
    <mat-dialog-content>
      @if (carregado() && itens().length === 0) {
        <p>Nenhuma inativação ou reativação registrada.</p>
      } @else {
        <app-dynamic-table [data]="itens()" [columns]="colunas" [pageSize]="5"></app-dynamic-table>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`mat-dialog-content { min-width: 640px; }`],
})
export class HistoricoDialog {
  readonly data = inject<HistoricoDialogData>(MAT_DIALOG_DATA);
  private infoBar = inject(InfoBarService);
  itens = signal<Historico[]>([]);
  carregado = signal(false);

  colunas: DynamicTableColumn[] = [
    { key: 'dataHora', label: 'Data/hora', type: 'datetime' },
    { key: 'acao', label: 'Ação', format: (v) => (v === 'INATIVACAO' ? 'Inativação' : 'Reativação') },
    { key: 'motivo', label: 'Motivo' },
    { key: 'username', label: 'Usuário' },
  ];

  constructor() {
    inject(HistoricoService).listar(this.data.tipo, this.data.id).subscribe({
      next: (itens) => {
        this.itens.set(itens);
        this.carregado.set(true);
      },
      error: (err) => this.infoBar.error(err, 'Erro ao carregar o histórico.'),
    });
  }
}
