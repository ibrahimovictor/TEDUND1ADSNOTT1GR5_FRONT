import {Component, Inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  ClassificacaoDisciplina,
  Disciplina,
  DisciplinaService,
  InfoBarService,
  TipoDisciplina
} from '../../../../../shared';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  selector: 'app-disciplina-form',
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule
  ],
  templateUrl: './disciplina-form.html',
  styleUrl: './disciplina-form.css'
})
export class DisciplinaForm {
  tiposDisciplina = Object.values(TipoDisciplina);
  classifacoesDisciplina = Object.values(ClassificacaoDisciplina);
  formDisciplina!: FormGroup;

  constructor(
    private infoBarService: InfoBarService,
    private disciplinaService: DisciplinaService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DisciplinaForm>,
    @Inject(MAT_DIALOG_DATA) public data: { disciplina: Disciplina }
  ) {
    this.formDisciplina = fb.group({
      sigla: ['', Validators.required],
      descricao: ['', Validators.required],
      cargaHoraria: ['', Validators.required],
      tipo: [TipoDisciplina.Presencial, Validators.required],
      classificacao: [ClassificacaoDisciplina.Teorica, Validators.required]
    });
  }

  onSubmit(): void {

    if (this.formDisciplina.valid) {
      const novaDisciplina: Disciplina = {
        id: 0, // Será gerado pelo backend
        sigla: this.siglaControl.value,
        descricao: this.descricaoControl.value,
        cargaHoraria: this.cargaHorariaControl.value,
        tipo: this.tipoControl.value,
        classificacao: this.classificacaoControl.value,
        ativa: true,
        matrizIds: [],
        prerequisitoIds: []
      };

      this.disciplinaService.addDisciplina(novaDisciplina).subscribe({
        next: () => {
          this.infoBarService.show({
            message: "Disciplina criada com sucesso!",
            type: "success"
          });
          this.dialogRef.close();
        },
        error: (err) => {
          console.error('Erro ao criar disciplina:', err);
          this.infoBarService.show({
            message: "Erro ao criar disciplina",
            type: "error"
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

}
