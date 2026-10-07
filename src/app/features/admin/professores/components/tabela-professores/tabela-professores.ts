import { Component, inject, Input, signal } from '@angular/core';
import { ConfirmDialogComponent, DynamicTable, DynamicTableColumn, ProfessorForm } from '../../../../../shared/components';
import { Professor } from '../../../../../shared';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ProfessorService } from '../../../../../shared/services';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tabela-professores',
  standalone: true,
  imports: [
    DynamicTable,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './tabela-professores.html',
  styleUrl: './tabela-professores.css'
})
export class TabelaProfessores  {

  readonly dialog = inject(MatDialog);
  data = signal<Professor[]>([]);

  @Input() professor = signal<Professor | null>(null);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' as const },
    { key: 'nome', label: 'Nome Completo', type: 'text' as const },
    { key: 'escola', label: 'Escola', type: 'text' as const },
    { key: 'ativo', label: 'Ativo', type: 'boolean' as const }
  ];

  @Input() filter: string = '';

  constructor(
    private professorService: ProfessorService,
  ) {
     this.carregarProfessores();
  }

  private carregarProfessores(): void{
    this.professorService.getProfessores().subscribe({
      next: (professores) => {
        this.data.set(professores);
      },
      error: (err) => {
        console.error('Erro ao carregar professores:', err);
      }
    })
  }

  deleteProfessor(professor: any): void {
    console.log('Excluindo professor:', professor);
    this.professorService.deleteProfessor(professor);
  }

  toggleStatus(professor: any): void {
    professor.ativo = !professor.ativo;
    console.log('Status alterado:', professor);
    this.professorService.toggleAtivo(professor);
  }

  openEditarProfessorDialog(professor: any): void {
    console.log('Editando professor:', professor);
    const dialogRef = this.dialog.open(ProfessorForm, {
      disableClose: true,
      minWidth: '400px',
      minHeight: '500px',
      data: {
        professor: professor
      }
    });
  }

  openConfirmDeleteDialog(prof: Professor){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir este professor?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProfessor(prof);
      }
    });
  }

  openConfirmAlternarDialog(prof: Professor){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Alteração',
        message: 'Tem certeza que deseja alterar o status deste professor?',
        confirmLabel: 'Alterar',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toggleStatus(prof);
      }
    });
  }
}
