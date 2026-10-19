import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  COLUNA_CADASTRO, COLUNA_STATUS, CadastroBase, CentroAcademico, CentroAcademicoRequest, CentroAcademicoService,
  DynamicTableColumn, FormularioBase, Ies, IesService, PaginaCadastro,
} from '../../../shared';

@Component({
  selector: 'app-centro-academico-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Centro Acadêmico</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field class="col-2">
          <mat-label>IES vinculada</mat-label>
          <mat-select formControlName="iesId">
            @for (i of ies(); track i.id) {
              <mat-option [value]="i.id" [disabled]="i.status === 'INATIVO' && i.id !== item?.iesId">
                {{ i.sigla }} — {{ i.nome }}{{ i.status === 'INATIVO' ? ' (inativa)' : '' }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Sigla</mat-label><input matInput formControlName="sigla" placeholder="Ex.: CCET"></mat-form-field>
        <mat-form-field><mat-label>Nome</mat-label><input matInput formControlName="nome"></mat-form-field>
        <mat-form-field><mat-label>E-mail central</mat-label><input matInput formControlName="emailCentral" type="email"></mat-form-field>
        <mat-form-field><mat-label>Telefone central</mat-label><input matInput formControlName="telefoneCentral"></mat-form-field>
        <mat-form-field class="col-2"><mat-label>Coordenador(a) — um único por escola</mat-label><input matInput formControlName="coordenadorNome"></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
})
export class CentroAcademicoForm extends FormularioBase<CentroAcademico> {
  private fb = inject(FormBuilder);
  private service = inject(CentroAcademicoService);
  ies = signal<Ies[]>([]);

  form = this.fb.group({
    iesId: [this.item?.iesId ?? null, Validators.required],
    sigla: [this.item?.sigla ?? '', Validators.required],
    nome: [this.item?.nome ?? '', Validators.required],
    emailCentral: [this.item?.emailCentral ?? '', [Validators.required, Validators.email]],
    telefoneCentral: [this.item?.telefoneCentral ?? '', Validators.required],
    coordenadorNome: [this.item?.coordenadorNome ?? '', Validators.required],
  });

  constructor() {
    super();
    inject(IesService).listar().subscribe((ies) => this.ies.set(ies));
  }

  enviar(): void {
    const req = this.form.getRawValue() as CentroAcademicoRequest;
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}

@Component({
  selector: 'app-centros-academicos',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro titulo="Centros Acadêmicos"
      subtitulo="Escolas vinculadas a uma única IES, com o(a) respectivo(a) coordenador(a)."
      [dados]="dados()" [colunas]="colunas"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class CentrosAcademicos extends CadastroBase<CentroAcademico> {
  protected readonly service = inject(CentroAcademicoService);
  protected readonly tipo = 'CENTRO_ACADEMICO' as const;
  protected readonly formulario = CentroAcademicoForm;

  colunas: DynamicTableColumn[] = [
    { key: 'iesSigla', label: 'IES' },
    { key: 'sigla', label: 'Sigla' },
    { key: 'nome', label: 'Nome' },
    { key: 'emailCentral', label: 'E-mail central' },
    { key: 'telefoneCentral', label: 'Telefone' },
    { key: 'coordenadorNome', label: 'Coordenador(a)' },
    COLUNA_CADASTRO,
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    this.carregar();
  }

  protected descrever(item: CentroAcademico): string {
    return `o Centro Acadêmico ${item.sigla} (${item.iesSigla})`;
  }
}
