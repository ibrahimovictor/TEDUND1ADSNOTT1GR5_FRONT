import {Component, effect, inject, input, signal} from '@angular/core';
import {
  ConfirmDialogComponent,
  Disciplina,
  DisciplinaService,
  DynamicTable,
  DynamicTableColumn, MatrizService,
  Programa,
  ProgramaService
} from '../../../../../shared';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {ProgramaForm} from '../../../../../shared';

interface TabelaProgramasDisciplinaProps {
  id?: number,
  matrizNome?: string,
  ativo?: boolean,
  sistemaAvaliacao?: string,
  metodologia?: string,
}


@Component({
  selector: 'app-programas-disciplina',
  imports: [
    MatIconModule,
    MatButtonModule,
    DynamicTable,
    MatTooltipModule,

  ],
  templateUrl: './programas-disciplina.html',
  styleUrl: './programas-disciplina.css'
})
export class ProgramasDisciplina {
    disciplina = input<Disciplina | null>(null);
    private programas = signal<Programa[]>([]);
    programasDataMontado = signal<TabelaProgramasDisciplinaProps[]>([]);

    dialog = inject(MatDialog);

    tableColumns: DynamicTableColumn[] = [
      { key: 'id', label: 'ID', type: 'number' as const },
      { key: 'matrizNome', label: 'Matriz', type: 'text' as const },
      { key: 'ativo', label: 'Ativo', type: 'boolean' as const },
      { key: 'sistemaAvaliacao', label: 'Sistema de Avaliação', type: 'text' as const },
      { key: 'metodologia', label: 'Metodologia', type: 'text' as const },
    ]

    constructor(
      private disciplinaService: DisciplinaService,
      private matrizService: MatrizService,
      private programaService: ProgramaService,
      private router: Router,
    ) {
      effect(() => {
        if (this.disciplina()) {
          this.carregarProgramas(this.disciplina()!);
          this.montarDadosProgramas();
        } else {
          this.programas.set([]);
          this.programasDataMontado.set([]);
        }
      });

    }

    carregarProgramas(disciplina: Disciplina): void {
      // this.programaService.getProgramasByDisciplina(disciplina.id).subscribe({
      //   next: (programas) => {
      //     this.programas.set(programas);
      //     this.montarDadosProgramas();
      //   },
      //   error: (err) => {
      //     console.error('Erro ao carregar programas:', err);
      //     this.programas.set([]);
      //     this.programasDataMontado.set([]);
      //   }
      // });

    }

    montarDadosProgramas(): void {
      const dadosMontados: TabelaProgramasDisciplinaProps[] = [];
      this.programasDataMontado.set([]);
      this.programas().forEach(programa => {
        this.matrizService.getMatriz(programa.matrizId).subscribe({
          next: (matriz) => {
            dadosMontados.push({
              id: programa.id,
              matrizNome: matriz ? matriz.nomeCurso : '-',
              ativo: programa.ativo,
              sistemaAvaliacao: programa.sistemaAvaliacao,
              metodologia: programa.metodologia,
            });
            this.programasDataMontado.set(dadosMontados);
          },
          error: (err) => {
            console.error('Erro ao carregar matriz:', err);
            this.programasDataMontado.set([]);
          }
        });
      });
    }

    deletarPrograma(programa: TabelaProgramasDisciplinaProps): void {
      this.programaService.deletePrograma(programa.id!);

    }

    openProgramaDetalhes(programa: TabelaProgramasDisciplinaProps): void {
      this.router.navigate(['/admin/programas/detalhes', programa.id]);
    }

    openConfirmDeleteDialog(programa: TabelaProgramasDisciplinaProps){
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

    openNovoProgramaDialog(): void{
      const dialogRef = this.dialog.open(ProgramaForm, {
        disableClose: true,
        minWidth: '650px',
        minHeight: '600px',
        maxHeight: '95%',
        maxWidth: '85%',
        data: {
          disciplina: this.disciplina()
        }
      });
    }
}
