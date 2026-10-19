import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  COLUNA_CADASTRO, COLUNA_STATUS, CadastroBase, Curso, CursoService, Discente, DiscenteRequest, DiscenteService,
  DynamicTableColumn, FormularioBase, PaginaCadastro,
} from '../../../shared';

@Component({
  selector: 'app-discente-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Discente (perfil Usuário)</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field><mat-label>Número de matrícula</mat-label><input matInput formControlName="matricula"></mat-form-field>
        <mat-form-field><mat-label>Nome completo</mat-label><input matInput formControlName="nomeCompleto"></mat-form-field>
        <mat-form-field><mat-label>E-mail de contato</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
        <mat-form-field><mat-label>Telefone de contato</mat-label><input matInput formControlName="telefone"></mat-form-field>
        <mat-form-field class="col-2">
          <mat-label>Curso vinculado</mat-label>
          <mat-select formControlName="cursoId">
            @for (c of cursos(); track c.id) {
              <mat-option [value]="c.id" [disabled]="c.status === 'INATIVO' && c.id !== item?.cursoId">
                {{ c.sigla }} — {{ c.descricao }} ({{ c.centroAcademicoSigla }}/{{ c.iesSigla }}){{ c.status === 'INATIVO' ? ' (inativo)' : '' }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="secao-form">Acesso ao sistema</div>
        <mat-form-field>
          <mat-label>Login</mat-label>
          <input matInput formControlName="login" placeholder="Se vazio, usa a matrícula">
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
export class DiscenteForm extends FormularioBase<Discente> {
  private fb = inject(FormBuilder);
  private service = inject(DiscenteService);
  cursos = signal<Curso[]>([]);

  form = this.fb.group({
    matricula: [this.item?.matricula ?? '', Validators.required],
    nomeCompleto: [this.item?.nomeCompleto ?? '', Validators.required],
    email: [this.item?.email ?? '', [Validators.required, Validators.email]],
    telefone: [this.item?.telefone ?? '', Validators.required],
    cursoId: [this.item?.cursoId ?? null, Validators.required],
    login: [this.item?.login ?? ''],
    senha: ['', Validators.minLength(6)],
  });

  constructor() {
    super();
    inject(CursoService).listar().subscribe((c) => this.cursos.set(c));
  }

  enviar(): void {
    const v = this.form.getRawValue();
    const req: DiscenteRequest = { ...(v as any), login: v.login || null, senha: v.senha || null };
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}

@Component({
  selector: 'app-discentes',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro titulo="Discentes"
      subtitulo="Alunos(as) com perfil Usuário, vinculados a um curso, que podem fazer monitoria. A inativação (afastamento, desligamento, desistência...) fica registrada no histórico."
      [dados]="dados()" [colunas]="colunas"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class Discentes extends CadastroBase<Discente> {
  protected readonly service = inject(DiscenteService);
  protected readonly tipo = 'DISCENTE' as const;
  protected readonly formulario = DiscenteForm;

  colunas: DynamicTableColumn[] = [
    { key: 'matricula', label: 'Matrícula' },
    { key: 'nomeCompleto', label: 'Nome completo' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cursoSigla', label: 'Curso' },
    { key: 'login', label: 'Login' },
    COLUNA_CADASTRO,
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    this.carregar();
  }

  protected descrever(item: Discente): string {
    return `o(a) discente ${item.nomeCompleto} (${item.matricula})`;
  }
}
