import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Curso, CursoService, EscolaService, InfoBarService, Escola } from '../../../../../../../shared';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-curso-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './curso-form.html',
  styleUrl: './curso-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursoForm {
  cursoForm!: FormGroup;
  curso = signal<Curso | null>(null);
  escola = signal<Escola | null>(null);

  constructor(
    private cursoService: CursoService,
    private escolaService: EscolaService,
    private fb: FormBuilder,
    private infoBarService: InfoBarService,
    private dialogRef: MatDialogRef<CursoForm>,
    @Inject(MAT_DIALOG_DATA) public data: { idCurso: number, idEscola: number }
  ) {
    this.carregarDadosCurso();
  }

  carregarDadosCurso(): void {

    this.escolaService.getEscola(this.data.idEscola).subscribe({
      next: (escola) => {
        this.escola.set(escola);
      }
    });

    if (this.data.idCurso) {
      this.cursoService.getCurso(this.data.idCurso).subscribe({
        next: (curso) => {
          this.curso.set(curso);
        }
      });
    }

    this.cursoForm = this.fb.group({
      nome: [this.curso()?.nome || '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.cursoForm.valid) {
      const cursoData: Curso = {
        nome: this.cursoForm.value.nome,
        id: this.curso()?.id ?? undefined,
        escolaId: this.escola()?.id!
      };
      if (this.curso()) {
        this.cursoService.updateCurso(cursoData).subscribe({
          next: (response) => {
            this.infoBarService.show({ message: 'Curso atualizado com sucesso.', type: 'success' });
          },
          error: (error) => {
            this.infoBarService.show({ message: 'Erro ao atualizar curso.', type: 'error' });
            console.error('Erro ao atualizar curso:', error);
          },
          complete: () => {
            this.dialogRef.close();
          },
        });
        return;
      }

      this.cursoService.addCurso(cursoData).subscribe({
        next: (response) => {
          this.infoBarService.show({ message: 'Curso adicionado com sucesso.', type: 'success' });
        },
        error: (error) => {
          this.infoBarService.show({ message: 'Erro ao adicionar curso.', type: 'error' });
          console.error('Erro ao adicionar curso:', error);
        },
        complete: () => {
          this.dialogRef.close();
        },
      });
    }
  }
}
