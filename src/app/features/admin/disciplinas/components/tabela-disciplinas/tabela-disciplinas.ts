import { Component, inject, Input, signal } from '@angular/core';
import { ConfirmDialogComponent, DynamicTable, DynamicTableColumn, ProfessorForm } from '../../../../../shared/components';
import {Disciplina, Professor} from '../../../../../shared';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {DisciplinaService, InfoBarService} from '../../../../../shared/services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tabela-disciplinas',
  standalone: true,
  imports: [
    DynamicTable,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './tabela-disciplinas.html',
  styleUrl: './tabela-disciplinas.css'
})
export class TabelaDisciplinas {

  readonly dialog = inject(MatDialog);
  data = signal<Disciplina[]>([]);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' as const },
    { key: 'sigla', label: 'Sigla', type: 'text' as const },
    { key: 'descricao', label: 'Descrição', type: 'text' as const },
    { key: 'cargaHoraria', label: 'Carga Horária', type: 'number' as const },
    { key: 'tipo', label: 'Tipo', type: 'text' as const },
    { key: 'classificacao', label: 'Classificação', type: 'text' as const },
    { key: 'ativa', label: 'Ativa', type: 'boolean' as const },
  ];

  @Input() filter: string = '';

  constructor(
    private disciplinaService: DisciplinaService,
    private router: Router,
    private infoBarService: InfoBarService
  ) {
     this.carregarDisciplinas();
  }

  carregarDisciplinas(): void{
    this.disciplinaService.getDisciplinas().subscribe({
      next: (disciplinas) => {
        this.data.set(disciplinas);
        console.log('Disciplinas carregadas:', disciplinas);
      },
      error: (err) => {
        console.error('Erro ao carregar disciplinas:', err);
      }
    })
  }

  deleteDisciplina(disciplina: Disciplina): void {
    console.log('Excluindo disciplina:', disciplina);
    this.disciplinaService.deleteDisciplina(disciplina.id).subscribe({
      next: () => {
        this.carregarDisciplinas(); // Recarrega após deletar
        this.infoBarService.show({ message: 'Disciplina excluída com sucesso.', type: 'success' });
      },
      error: (err) => console.error('Erro ao deletar:', err)
    });
  }

  openDisciplinaDetalhes(disciplina: Disciplina): void {
    console.log('Visualizando detalhes da disciplina:', disciplina);
    this.router.navigate(['/admin/disciplinas/detalhes', disciplina.id]);
  }

  openConfirmDeleteDialog(disciplina: Disciplina){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
            title: 'Confirmação de Exclusão',
            message: 'Tem certeza que deseja excluir esta disciplina?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDisciplina(disciplina);
      }
    });
  }

}
