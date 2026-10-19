import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  COLUNA_CADASTRO, COLUNA_STATUS, CadastroBase, CentroAcademico, CentroAcademicoService, Docente, DocenteRequest,
  DocenteService, DynamicTableColumn, FormularioBase, PaginaCadastro,
} from '../../../shared';

@Component({
  selector: 'app-docente-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Docente (perfil Colaborador)</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field><mat-label>Número do registro (matrícula)</mat-label><input matInput formControlName="matricula"></mat-form-field>
        <mat-form-field><mat-label>Nome completo</mat-label><input matInput formControlName="nomeCompleto"></mat-form-field>
        <mat-form-field><mat-label>E-mail de contato</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
        <mat-form-field><mat-label>Telefone de contato</mat-label><input matInput formControlName="telefone"></mat-form-field>
        <mat-form-field class="col-2">
          <mat-label>Centro Acadêmico vinculado</mat-label>
          <mat-select formControlName="centroAcademicoId">
            @for (ca of cas(); track ca.id) {
              <mat-option [value]="ca.id" [disabled]="ca.status === 'INATIVO' && ca.id !== item?.centroAcademicoId">
                {{ ca.iesSigla }} / {{ ca.sigla }} — {{ ca.nome }}{{ ca.status === 'INATIVO' ? ' (inativo)' : '' }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="secao-form">Acesso ao sistema</div>
        <mat-form-field>
          <mat-label>Login</mat-label>
          <input matInput formControlName="login" placeholder="Se vazio, usa a matrícula">
          <mat-hint>Se o login já existir, o perfil Colaborador é acumulado nessa conta</mat-hint>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Senha</mat-label>
          <input matInput formControlName="senha" type="password"
                 [placeholder]="editando ? 'Deixe em branco para manter' : 'Mínimo de 6 caracteres'">
          @if (form.controls.senha.hasError('minlength')) { <mat-error>Mínimo de 6 caracteres</mat-error> }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
})
export class DocenteForm extends FormularioBase<Docente> {
  private fb = inject(FormBuilder);
  private service = inject(DocenteService);
  cas = signal<CentroAcademico[]>([]);

  form = this.fb.group({
    matricula: [this.item?.matricula ?? '', Validators.required],
    nomeCompleto: [this.item?.nomeCompleto ?? '', Validators.required],
    email: [this.item?.email ?? '', [Validators.required, Validators.email]],
    telefone: [this.item?.telefone ?? '', Validators.required],
    centroAcademicoId: [this.item?.centroAcademicoId ?? null, Validators.required],
    login: [this.item?.login ?? ''],
    senha: ['', Validators.minLength(6)],
  });

  constructor() {
    super();
    inject(CentroAcademicoService).listar().subscribe((cas) => this.cas.set(cas));
  }

  enviar(): void {
    const v = this.form.getRawValue();
    const req: DocenteRequest = { ...(v as any), login: v.login || null, senha: v.senha || null };
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}

@Component({
  selector: 'app-docentes',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro titulo="Docentes"
      subtitulo="Docentes com perfil Colaborador, vinculados a um único Centro Acadêmico. A inativação (afastamento, desligamento, suspensão contratual...) fica registrada no histórico."
      [dados]="dados()" [colunas]="colunas"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class Docentes extends CadastroBase<Docente> {
  protected readonly service = inject(DocenteService);
  protected readonly tipo = 'DOCENTE' as const;
  protected readonly formulario = DocenteForm;

  colunas: DynamicTableColumn[] = [
    { key: 'matricula', label: 'Matrícula' },
    { key: 'nomeCompleto', label: 'Nome completo' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'centroAcademicoSigla', label: 'CA', format: (v, row: Docente) => `${row.iesSigla} / ${v}` },
    { key: 'login', label: 'Login' },
    COLUNA_CADASTRO,
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    this.carregar();
  }

  protected descrever(item: Docente): string {
    return `o(a) docente ${item.nomeCompleto} (${item.matricula})`;
  }
}
