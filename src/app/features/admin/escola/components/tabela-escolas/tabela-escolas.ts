import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { ConfirmDialogComponent, DynamicTable, DynamicTableColumn, InfoBarService, EscolaService, Escola } from '../../../../../shared';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabela-escolas',
  imports: [DynamicTable, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule],
  templateUrl: './tabela-escolas.html',
  styleUrl: './tabela-escolas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabelaEscolas {
  readonly dialog = inject(MatDialog);
  data = signal<Escola[]>([]);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' as const },
    { key: 'nome', label: 'Nome Completo', type: 'text' as const },
  ];

  @Input() filter: string = '';

  constructor(
    private escolaService: EscolaService,
    private infoBarService: InfoBarService,
    private router: Router
  ) {
    this.carregarEscolas();
  }

  private carregarEscolas(): void {
    this.escolaService.getEscolas().subscribe({
      next: (escolas) => {
        this.data.set(escolas);
      },
      error: (err) => {
        console.error('Erro ao carregar escolas:', err);
      },
    });
  }

  deletarEscola(idEscola: number): void {
    this.escolaService.deleteEscola(idEscola).subscribe({
      next: () => {
        this.carregarEscolas(); // Recarrega após deletar
        this.infoBarService.show({ message: 'Escola excluída com sucesso.', type: 'success' });
      },
      error: (err) => {
        console.error('Erro ao deletar escola:', err);
      },
    });
  }

  openEscolaDetalhesDialog(escola: Escola) {
    this.router.navigate(['/admin/escolas/detalhes', escola.id]);
  }

  openConfirmDeleteDialog(escola: Escola) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir esta escola?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deletarEscola(escola.id!);
      }
    });
  }
}
