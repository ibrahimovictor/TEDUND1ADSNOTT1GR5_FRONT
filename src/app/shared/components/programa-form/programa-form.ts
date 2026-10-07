import {Component, effect, Inject, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {Disciplina, Matriz, Programa} from '../../models';
import {MatSelectModule} from '@angular/material/select';
import {InfoBarService, MatrizService, ProgramaService} from '../../services';


@Component({
  selector: 'app-programa-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogClose,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './programa-form.html',
  styleUrl: './programa-form.css'
})
export class ProgramaForm {
  programaForm!: FormGroup;
  private disciplina = signal<Disciplina | null>(null);

  matrizesPossiveis = signal<Matriz[]>([]);

  constructor(
    private fb: FormBuilder,
    private programaService: ProgramaService,
    private matrizService: MatrizService,
    private infoBarService: InfoBarService,
    private dialogRef: MatDialogRef<ProgramaForm>,
    @Inject(MAT_DIALOG_DATA) public data: { disciplina: Disciplina }
  ) {

    this.disciplina.set(data.disciplina);
    effect(() => {
      if (this.disciplina()?.id) {
        this.matrizService.getMatrizesByDisciplinaSigla(this.disciplina()?.sigla).subscribe(matrizes => {
          this.matrizesPossiveis.set(matrizes);
        });
      }
    });

    this.programaForm = this.fb.group({
      disciplinaId: [this.disciplina()?.id, Validators.required],
      matrizId: [null, Validators.required],
      ementa: [''],
      objetivos: [''],
      conteudoProgramatico: [''],
      sistemaAvaliacao: [''],
      metodologia: [''],
      ativo: [true]
    });
  }

  onSubmit(){
    if (this.programaForm.valid) {
      const formData = this.programaForm.value;
      const programaData: Programa = {
        id: undefined,
        disciplinaId: formData.disciplinaId,
        matrizId: formData.matrizId,
        ementa: formData.ementa,
        objetivos: formData.objetivos,
        conteudoProgramatico: Array.isArray(formData.conteudoProgramatico)
          ? formData.conteudoProgramatico
          : (formData.conteudoProgramatico ? String(formData.conteudoProgramatico).split('\n') : []),
        sistemaAvaliacao: formData.sistemaAvaliacao,
        metodologia: formData.metodologia,
        ativo: !!formData.ativo,
      }

      this.programaService.addPrograma(programaData).subscribe();

      this.infoBarService.show({
        message: 'Programa adicionado com sucesso!',
        type: 'success'
      });
      this.dialogRef.close();
    }
  }

  get disciplinaIdControl(): FormControl {
    return this.programaForm.get('disciplinaId') as FormControl;
  }

  get matrizIdControl(): FormControl {
    return this.programaForm.get('matrizId') as FormControl;
  }

  get ementaControl(): FormControl {
    return this.programaForm.get('ementa') as FormControl;
  }

  get objetivosControl(): FormControl {
    return this.programaForm.get('objetivos') as FormControl;
  }

  get conteudoProgramaticoControl(): FormControl {
    return this.programaForm.get('conteudoProgramatico') as FormControl;
  }

  get sistemaAvaliacaoControl(): FormControl {
    return this.programaForm.get('sistemaAvaliacao') as FormControl;
  }

  get metodologiaControl(): FormControl {
    return this.programaForm.get('metodologia') as FormControl;
  }

  get ativoControl(): FormControl {
    return this.programaForm.get('ativo') as FormControl;
  }

}
