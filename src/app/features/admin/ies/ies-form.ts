import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormularioBase, Ies, IesRequest, IesService, ProReitoria, dataIso, paraDate } from '../../../shared';

@Component({
  selector: 'app-ies-form',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatDatepickerModule, MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Instituição de Ensino Superior</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field><mat-label>Sigla</mat-label><input matInput formControlName="sigla" placeholder="Ex.: UCSAL"></mat-form-field>
        <mat-form-field><mat-label>Nome</mat-label><input matInput formControlName="nome"></mat-form-field>
        <mat-form-field><mat-label>E-mail central</mat-label><input matInput formControlName="emailCentral" type="email"></mat-form-field>
        <mat-form-field><mat-label>Telefone central</mat-label><input matInput formControlName="telefoneCentral"></mat-form-field>

        <div class="secao-form">Reitor(a) — um único por IES</div>
        <mat-form-field><mat-label>Nome do(a) reitor(a)</mat-label><input matInput formControlName="reitorNome"></mat-form-field>
        <mat-form-field><mat-label>E-mail do(a) reitor(a)</mat-label><input matInput formControlName="reitorEmail" type="email"></mat-form-field>

        <div class="secao-form">
          Pró-reitorias e nomeações
          <button mat-button type="button" (click)="adicionarProReitoria()"><mat-icon>add</mat-icon> Adicionar</button>
        </div>
        @if (proReitorias.length === 0) {
          <p class="dica col-2">Nenhuma pró-reitoria cadastrada.</p>
        }
        <ng-container formArrayName="proReitorias">
          @for (pr of proReitorias.controls; track pr; let i = $index) {
            <div class="linha-lista" [formGroupName]="i">
              <mat-form-field><mat-label>Pró-reitoria</mat-label><input matInput formControlName="nome" placeholder="Ex.: Pró-Reitoria de Graduação"></mat-form-field>
              <mat-form-field><mat-label>Pró-reitor(a) nomeado(a)</mat-label><input matInput formControlName="proReitorNome"></mat-form-field>
              <mat-form-field>
                <mat-label>Data da nomeação</mat-label>
                <input matInput [matDatepicker]="dp" formControlName="dataNomeacao">
                <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
                <mat-datepicker #dp></mat-datepicker>
              </mat-form-field>
              <button mat-icon-button type="button" matTooltip="Remover" (click)="proReitorias.removeAt(i)"><mat-icon>delete</mat-icon></button>
            </div>
          }
        </ng-container>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
})
export class IesForm extends FormularioBase<Ies> {
  private fb = inject(FormBuilder);
  private service = inject(IesService);

  form = this.fb.group({
    sigla: [this.item?.sigla ?? '', Validators.required],
    nome: [this.item?.nome ?? '', Validators.required],
    emailCentral: [this.item?.emailCentral ?? '', [Validators.required, Validators.email]],
    telefoneCentral: [this.item?.telefoneCentral ?? '', Validators.required],
    reitorNome: [this.item?.reitorNome ?? '', Validators.required],
    reitorEmail: [this.item?.reitorEmail ?? '', Validators.email],
    proReitorias: this.fb.array((this.item?.proReitorias ?? []).map((p) => this.grupo(p))),
  });

  get proReitorias(): FormArray {
    return this.form.get('proReitorias') as FormArray;
  }

  private grupo(p?: ProReitoria) {
    return this.fb.group({
      nome: [p?.nome ?? '', Validators.required],
      proReitorNome: [p?.proReitorNome ?? '', Validators.required],
      dataNomeacao: [paraDate(p?.dataNomeacao) as Date | null],
    });
  }

  adicionarProReitoria(): void {
    this.proReitorias.push(this.grupo());
  }

  enviar(): void {
    const v = this.form.getRawValue();
    const req: IesRequest = {
      sigla: v.sigla!,
      nome: v.nome!,
      emailCentral: v.emailCentral!,
      telefoneCentral: v.telefoneCentral!,
      reitorNome: v.reitorNome!,
      reitorEmail: v.reitorEmail || null,
      proReitorias: (v.proReitorias as any[]).map((p) => ({ ...p, dataNomeacao: dataIso(p.dataNomeacao) })),
    };
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}
