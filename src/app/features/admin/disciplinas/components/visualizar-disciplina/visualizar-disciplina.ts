import {Component, signal} from '@angular/core';
import {
  ClassificacaoDisciplina,
  Disciplina,
  DisciplinaService,
  InfoBarService,
  TipoDisciplina
} from '../../../../../shared';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ProgramasDisciplina} from '../programas-disciplina'


@Component({
  selector: 'app-visualizar-disciplina',
  imports: [
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    ProgramasDisciplina
  ],
  templateUrl: './visualizar-disciplina.html',
  styleUrl: './visualizar-disciplina.css'
})
export class VisualizarDisciplina {
    tiposDisciplina = Object.values(TipoDisciplina);
    classifacoesDisciplina = Object.values(ClassificacaoDisciplina);
    formDisciplina!: FormGroup;
    disciplina = signal<Disciplina | null>(null);

    constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private disciplinaService: DisciplinaService,
      private infoBarService: InfoBarService,
      private router: Router
    ) {
      this.route.params.subscribe(params => {
        const idParam = params['id'];
        const id = Number(idParam);
        if (id && !Number.isNaN(id)) {
          this.carregarDisciplina(id);
        } else {
          this.infoBarService.show({
            message: 'ID da disciplina não fornecido',
            type: 'error',
          });
          this.router.navigateByUrl('admin/disciplinas');
        }
      });


    }

    carregarFormulario(): void {
      if (this.disciplina()) {
        this.formDisciplina = this.fb.group({
          sigla: [this.disciplina()?.sigla, Validators.required],
          descricao: [this.disciplina()?.descricao, Validators.required],
          cargaHoraria: [this.disciplina()?.cargaHoraria, Validators.required],
          tipo: [this.disciplina()?.tipo, Validators.required],
          classificacao: [this.disciplina()?.classificacao, Validators.required],
          ativa: [this.disciplina()?.ativa, Validators.required]
        });
      }
    }

    carregarDisciplina(id: number): void {
      this.disciplinaService.getDisciplina(id).subscribe({
        next: (disciplina) => {

          if (!disciplina) {
            this.infoBarService.show({
              message: 'Disciplina não encontrada',
              type: 'error',
            });
            return;
          }

          this.disciplina.set(disciplina);
          this.carregarFormulario();
        },
        error: (error) => {
          console.error('Erro ao carregar disciplina:', error);
          this.infoBarService.show({
            message: 'Erro ao carregar disciplina',
            type: 'error',
          });

          this.router.navigateByUrl('admin/disciplinas');
        }
      });
    }

    onSubmit(): void {
      if (this.formDisciplina.valid && this.disciplina()) {
        const disciplinaAtualizada: Disciplina = {
          id: this.disciplina()!.id,
          sigla: this.siglaControl.value,
          descricao: this.descricaoControl.value,
          cargaHoraria: this.cargaHorariaControl.value,
          tipo: this.tipoControl.value,
          classificacao: this.classificacaoControl.value,
          ativa: this.ativaControl.value,
          matrizIds: this.disciplina()!.matrizIds || [],
          prerequisitoIds: this.disciplina()!.prerequisitoIds || []
        };

        this.disciplinaService.updateDisciplina(disciplinaAtualizada).subscribe({
          next: (disciplinaAtualizada) => {
            this.infoBarService.show({
              message: "Dados da Disciplina atualizados com sucesso!",
              type: "success"
            });
            this.disciplina.set(disciplinaAtualizada);
          },
          error: (err) => {
            console.error('Erro ao atualizar disciplina:', err);
            this.infoBarService.show({
              message: 'Erro ao atualizar disciplina',
              type: 'error',
            });
          }
        });
      }
    }

    get siglaControl(): FormControl{
      return this.formDisciplina.get('sigla') as FormControl;
    }

    get descricaoControl(): FormControl{
      return this.formDisciplina.get('descricao') as FormControl;
    }

    get cargaHorariaControl(): FormControl{
      return this.formDisciplina.get('cargaHoraria') as FormControl;
    }

    get tipoControl(): FormControl{
      return this.formDisciplina.get('tipo') as FormControl;
    }

    get classificacaoControl(): FormControl{
      return this.formDisciplina.get('classificacao') as FormControl;
    }

    get ativaControl(): FormControl{
      return this.formDisciplina.get('ativa') as FormControl;
    }
}
