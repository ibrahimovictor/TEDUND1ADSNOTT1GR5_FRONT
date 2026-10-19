import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InfoBarService, UsuarioService } from '../../shared';

@Component({
  selector: 'app-alterar-senha-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Alterar minha senha</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field class="col-2"><mat-label>Senha atual</mat-label><input matInput type="password" formControlName="senhaAtual"></mat-form-field>
        <mat-form-field class="col-2">
          <mat-label>Nova senha</mat-label><input matInput type="password" formControlName="novaSenha">
          @if (form.controls.novaSenha.hasError('minlength')) { <mat-error>Mínimo de 6 caracteres</mat-error> }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="salvar()">Alterar</button>
    </mat-dialog-actions>
  `,
})
export class AlterarSenhaDialog {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioService);
  private infoBar = inject(InfoBarService);
  private dialogRef = inject(MatDialogRef<AlterarSenhaDialog>);
  salvando = signal(false);

  form = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
  });

  salvar(): void {
    const { senhaAtual, novaSenha } = this.form.getRawValue();
    this.salvando.set(true);
    this.service.alterarMinhaSenha(senhaAtual, novaSenha).subscribe({
      next: () => {
        this.infoBar.show({ message: 'Senha alterada.', type: 'success' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.salvando.set(false);
        this.infoBar.error(err, 'Erro ao alterar a senha.');
      },
    });
  }
}
