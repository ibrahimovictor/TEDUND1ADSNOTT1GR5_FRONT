import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EscolaService, InfoBarService } from '../../../../../shared';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-escola-form',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './escola-form.html',
  styleUrl: './escola-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EscolaForm {
  escolaForm!: FormGroup;

  constructor(
    private escolaService: EscolaService,
    private fb: FormBuilder,
    private infoBarService: InfoBarService,
    private router: Router,
    private dialogRef: MatDialogRef<EscolaForm>
  ) {
    this.carregarFormulario();
  }

  carregarFormulario(): void {
    this.escolaForm = this.fb.group({
      nome: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.escolaForm.valid) {
      const escolaData = this.escolaForm.value;
      this.escolaService.addEscola(escolaData).subscribe({
        next: (response) => {
          this.infoBarService.show({ message: 'Escola adicionada com sucesso.', type: 'success' });
          this.router.navigate(['/admin/escolas/detalhes', response.id]);
        },
        error: (error) => {
          this.infoBarService.show({ message: 'Erro ao adicionar escola.', type: 'error' });
          console.error('Erro ao adicionar escola:', error);
        },
        complete: () => {
          this.dialogRef.close();
        }
      });
    }
  }
}
