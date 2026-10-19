import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface MotivoDialogData {
  titulo: string;
  mensagem: string;
  confirmar: string;
}

/** Pede o motivo da inativação/reativação, que fica registrado no histórico. */
@Component({
  selector: 'app-motivo-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p class="mensagem">{{ data.mensagem }}</p>
      <mat-form-field class="largura-total">
        <mat-label>Motivo</mat-label>
        <textarea matInput [formControl]="motivo" rows="3" maxlength="500"
                  placeholder="Ex.: afastamento, desligamento, suspensão contratual, desistência..."></textarea>
        @if (motivo.invalid && motivo.touched) {
          <mat-error>Informe o motivo</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" (click)="confirmar()">{{ data.confirmar }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.largura-total { width: 100%; min-width: 420px; } .mensagem { margin-bottom: 12px; }`],
})
export class MotivoDialog {
  readonly data = inject<MotivoDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<MotivoDialog>);
  motivo = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  confirmar(): void {
    if (this.motivo.invalid || !this.motivo.value.trim()) {
      this.motivo.markAsTouched();
      this.motivo.setErrors({ required: true });
      return;
    }
    this.dialogRef.close(this.motivo.value.trim());
  }
}
