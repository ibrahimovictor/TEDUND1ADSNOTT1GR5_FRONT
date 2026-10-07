import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  ConfirmDialogComponent,
  Disciplina,
  DisciplinaService,
  InfoBarService,
  Matriz,
  MatrizService,
  Programa,
  ProgramaService,
  HistoricoAlteracoes,
  TabelaReferencias
} from '../../index';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import {UserRole} from '../../../core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {AuthService} from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-visualizar-programa',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    TabelaReferencias,
    HistoricoAlteracoes,
    MatCheckboxModule
],
  templateUrl: './visualizar-programa.html',
  styleUrl: './visualizar-programa.css'
})
export class VisualizarPrograma {
  formPrograma!: FormGroup;
  authService = inject(AuthService);

  readonly dialog = inject(MatDialog);
  role = signal<UserRole>(UserRole.ADMIN);

  programa = signal<Programa | null>(null);
  disciplina = signal<Disciplina | null>(null);
  matriz = signal<Matriz | null>(null);
  matrizesPossiveis = signal<Matriz[]>([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private programaService: ProgramaService,
    private disciplinaService: DisciplinaService,
    private matrizService: MatrizService,
    private infoBarService: InfoBarService
  ){
    this.authService.ensureRole().subscribe({
      next: (userRole) => {
        this.role.set(userRole!);
      }
    });

    this.carregarComponente();
  }

  carregarComponente(): void{
    this.route.params.subscribe(params => {
        const idPrograma = params['idPrograma'];
        if (idPrograma) {
          this.carregarPrograma(idPrograma);
          this.carregarFormulario();
        }else{
          this.infoBarService.show({
            message: 'id do programa não fornecido',
            type: 'error',
          });
          const rota = this.role() == UserRole.ADMIN ? 'admin' : 'professor';
          this.router.navigateByUrl(rota + '/programas');
        }
      });
  }

  carregarFormulario(): void{
    this.formPrograma = this.fb.group({
        disciplinaId: [this.programa()?.disciplinaId, Validators.required],
        matrizId: [this.programa()?.matrizId, Validators.required],
        ativo: [this.programa()?.ativo, Validators.required],
        ementa: [this.programa()?.ementa],
        objetivos: [this.programa()?.objetivos],
        conteudoProgramatico: [Array.isArray(this.programa()?.conteudoProgramatico) ? (this.programa()?.conteudoProgramatico as any).join('\n') : this.programa()?.conteudoProgramatico],
        sistemaAvaliacao: [this.programa()?.sistemaAvaliacao],
        metodologia: [this.programa()?.metodologia],
        observacoesAlteracao: ['', Validators.required],
    });
  }

  carregarPrograma(idPrograma: number): void {
      // this.programaService.getPrograma(idPrograma).subscribe({
      //   next: (programa) => {
      //     if (!programa) {
      //       this.infoBarService.show({
      //         message: 'Programa não encontrado',
      //         type: 'error',
      //       });
      //       return;
      //     }

      //     this.programa.set(programa);

  //     // Ajustar quando endpoint por disciplinaId estiver disponível
  //     this.disciplinaService.getDisciplina(programa.disciplinaId).subscribe({
      //       next: (disciplina) => {
      //         this.disciplina.set(disciplina ?? null);
      //       },
      //       error: (error) => {
      //         console.error('Erro ao carregar disciplina:', error);
      //         this.infoBarService.show({
      //           message: 'Erro ao carregar disciplina',
      //           type: 'error',
      //         });
      //       }
      //     });

  //     this.matrizService.getMatrizesByDisciplinaSigla('' as any).subscribe({
      //       next: (matrizes) => {
      //         this.matrizesPossiveis.set(matrizes);
      //       },
      //       error: (error) => {
      //         console.error('Erro ao carregar matrizes possíveis:', error);
      //         this.infoBarService.show({
      //           message: 'Erro ao carregar matrizes possíveis',
      //           type: 'error',
      //         });
      //       }
      //     });

  //     this.matrizService.getMatriz(programa.matrizId).subscribe({
      //       next: (matriz) => {
      //         this.matriz.set(matriz ?? null);
      //       },
      //       error: (error) => {
      //         console.error('Erro ao carregar matriz:', error);
      //         this.infoBarService.show({
      //           message: 'Erro ao carregar matriz',
      //           type: 'error',
      //         });
      //       }
      //     });

      //   },
      //   error: (error) => {
      //     console.error('Erro ao carregar programa:', error);
      //     this.infoBarService.show({
      //       message: 'Erro ao carregar programa',
      //       type: 'error',
      //     });

      //     const rota = this.role() == UserRole.ADMIN ? 'admin' : 'professor';
      //     this.router.navigateByUrl(rota + '/programas');
      //   }
      // });
  }

  deletarPrograma(): void {
    const programaAtual = this.programa();
    if (!programaAtual) {
      this.infoBarService.show({
        message: 'Programa não carregado',
        type: 'error',
      });
      return;
    }

    this.programaService.deletePrograma(programaAtual.id!);
    this.infoBarService.show({
      message: 'Programa apagado com sucesso',
      type: 'success',
    });

    const rota = this.role() == UserRole.ADMIN ? 'admin' : 'professor';
    this.router.navigateByUrl(rota + '/programas');
  }

  openConfirmDeleteDialog(){
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
          this.deletarPrograma();
        }
      });
  }

  onSubmit(): void {
    if (!this.formPrograma.valid) {
      return;
    }
    const valores = this.formPrograma.value;
    const updatedPrograma: Programa = {
      id: this.programa()!.id,
      disciplinaId: valores.disciplinaId,
      matrizId: valores.matrizId,
      ativo: valores.ativo,
      ementa: valores.ementa,
      objetivos: valores.objetivos,
      conteudoProgramatico: Array.isArray(valores.conteudoProgramatico)
        ? valores.conteudoProgramatico
        : (valores.conteudoProgramatico ? String(valores.conteudoProgramatico).split('\n') : []),
      sistemaAvaliacao: valores.sistemaAvaliacao,
      metodologia: valores.metodologia,
    };
    console.log('Updated Programa:', updatedPrograma);
    this.programaService.updatePrograma(updatedPrograma);
    // this.programaService.addAtualizacaoPrograma({
    //   id: 0,
    //   idProfessor: 1,
    //   idPrograma: this.programa()!.id!,
    //   descricaoAtualizacao: valores.observacoesAlteracao,
    //   dataFinalizacao: new Date()
    // });
    this.infoBarService.show({
      message: 'Programa atualizado com sucesso',
      type: 'success',
    });
    this.observacoesAlteracaoControl.setValue(null);
    this.observacoesAlteracaoControl.markAsUntouched();
  }


  get disciplinaIdControl(): FormControl {
    return this.formPrograma.get('disciplinaId') as FormControl;
  }
  get matrizIdControl(): FormControl {
    return this.formPrograma.get('matrizId') as FormControl;
  }

  get ativoControl(): FormControl {
    return this.formPrograma.get('ativo') as FormControl;
  }

  get ementaControl(): FormControl {
    return this.formPrograma.get('ementa') as FormControl;
  }

  get objetivosControl(): FormControl {
    return this.formPrograma.get('objetivos') as FormControl;
  }

  get conteudoProgramaticoControl(): FormControl {
    return this.formPrograma.get('conteudoProgramatico') as FormControl;
  }

  get sistemaAvaliacaoControl(): FormControl {
    return this.formPrograma.get('sistemaAvaliacao') as FormControl;
  }

  get metodologiaControl(): FormControl {
    return this.formPrograma.get('metodologia') as FormControl;
  }

  get observacoesAlteracaoControl(): FormControl {
    return this.formPrograma.get('observacoesAlteracao') as FormControl;
  }

  protected readonly UserRole = UserRole;
}
