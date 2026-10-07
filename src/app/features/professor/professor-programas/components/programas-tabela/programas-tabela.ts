import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicTable } from '../../../../../shared';
import { DynamicTableColumn } from '../../../../../shared';
import { Programa } from '../../../../../shared';
import { ProgramaService } from '../../../../../shared';
import { MatDialog } from '@angular/material/dialog';
import { ProfessorForm } from '../../../../../shared';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { Input, inject, signal } from '@angular/core';

@Component({
  selector: 'app-programas-tabela',
  imports: [
    DynamicTable,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './programas-tabela.html',
  styleUrl: './programas-tabela.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramasTabela {
   readonly dialog = inject(MatDialog);
  data = signal<Programa[]>([]);
  @Input() programa = signal<Programa | null>(null);

  tableColumns: DynamicTableColumn[] = [
    { key: 'disciplinaId', label: 'Disciplina (ID)', type: 'number' as const },
    { key: 'objetivos', label: 'Objetivos', type: 'text' as const },
    { key: 'sistemaAvaliacao',label: 'Sistema Avaliação', type: 'text' as const },
    { key: 'ativo', label: 'Ativo', type: 'boolean' as const },
  ];

  @Input() filter: string = '';

  constructor(
    private progrmaService: ProgramaService,
    private router: Router
  ) {
    this.carregarProgramas();
  }

  private carregarProgramas(): void{
    this.progrmaService.getProgramas().subscribe({
      next: (programas) => {
        this.data.set(programas);
      },
      error: (err) => {
        console.error('Erro ao carregar programas:', err);
      }
    })
  }

  deletarPrograma(programa: Programa): void {
    console.log('Excluindo professor:', programa);
    this.progrmaService.deletePrograma(<number>programa.id);
  }

  openEditarProgramaDialog(programa: any): void {
    console.log('Editando programa:', programa);
    const dialogRef = this.dialog.open(ProfessorForm, {
      disableClose: true,
      minWidth: '400px',
      minHeight: '500px',
      data: {
        programa: programa
      }
    });
  }

  openProgramaDetalhes(programa: Programa): void {
    this.router.navigate(['/admin/programas/detalhes', programa.id]);
  }

  openConfirmDeleteDialog(programa: Programa): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir este programa?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletarPrograma(programa);
      }
    });
  }
}
