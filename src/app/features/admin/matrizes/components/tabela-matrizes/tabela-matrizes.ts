import { Component, inject, Input, signal } from '@angular/core';
import {
  ConfirmDialogComponent,
  DynamicTable,
  DynamicTableColumn,
  MatrizService,
  ProfessorForm
} from '../../../../../shared';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {Matriz} from '../../../../../shared';

@Component({
  selector: 'app-tabela-matrizes',
  standalone: true,
  imports: [
    DynamicTable,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './tabela-matrizes.html',
  styleUrl: './tabela-matrizes.css'
})
export class TabelaMatrizes {

  readonly dialog = inject(MatDialog);
  data = signal<Matriz[]>([]);

  @Input() matriz = signal<Matriz | null>(null);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' as const},
    { key: 'nomeCurso', label: 'Nome', type: 'text' as const},
    { key: 'habilitacao', label: 'Habilitacao', type: 'text' as const},
    { key: 'turno', label: 'Turno', type: 'text' as const},
    { key: 'campus', label: 'Campus', type: 'text' as const},
  ];

  @Input() filter: string = '';

  constructor(
    private matrizService: MatrizService,
  ) {
     this.carregarMatrizes();
  }

  private carregarMatrizes(): void{
    this.matrizService.getMatrizes().subscribe({
      next: (matrizes) => {
        this.data.set(matrizes);
      },
      error: (err) => {
        console.error('Erro ao carregar matrizes:', err);
      }
    })
  }

  deletarMatriz(matriz: Matriz): void {
    console.log('Excluindo matriz:', matriz);
    this.matrizService.deleteMatriz(matriz.id);
  }

  openEditarProfessorDialog(matriz: Matriz): void {
    console.log('Editando matriz:', matriz);
    const dialogRef = this.dialog.open(ProfessorForm, {
      disableClose: true,
      minWidth: '400px',
      minHeight: '500px',
      data: {
        matriz: matriz
      }
    });
  }

  openConfirmDeleteDialog(matriz: Matriz){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir esta matriz?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletarMatriz(matriz);
      }
    });
  }
}
