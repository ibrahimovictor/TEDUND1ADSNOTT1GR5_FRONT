import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService, UserRole } from '../../../core';
import {
  COLUNA_CADASTRO, COLUNA_STATUS, CadastroBase, Curso, CursoService, Disciplina, DisciplinaRequest,
  DisciplinaService, Docente, DocenteService, DynamicTableColumn, FormularioBase, PaginaCadastro,
} from '../../../shared';

@Component({
  selector: 'app-disciplina-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Disciplina</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field><mat-label>Sigla</mat-label><input matInput formControlName="sigla" placeholder="Ex.: POO"></mat-form-field>
        <mat-form-field><mat-label>Carga horária (h)</mat-label><input matInput type="number" min="1" formControlName="cargaHoraria"></mat-form-field>
        <mat-form-field class="col-2"><mat-label>Descrição</mat-label><input matInput formControlName="descricao"></mat-form-field>
        <mat-form-field class="col-2">
          <mat-label>Curso a que pertence</mat-label>
          <mat-select formControlName="cursoId">
            @for (c of cursos(); track c.id) {
              <mat-option [value]="c.id" [disabled]="c.status === 'INATIVO' && c.id !== item?.cursoId">
                {{ c.sigla }} — {{ c.descricao }} ({{ c.centroAcademicoSigla }}/{{ c.iesSigla }}){{ c.status === 'INATIVO' ? ' (inativo)' : '' }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (admin()) {
          <mat-form-field class="col-2">
            <mat-label>Docente que leciona</mat-label>
            <mat-select formControlName="docenteId">
              @for (d of docentes(); track d.id) {
                <mat-option [value]="d.id">{{ d.nomeCompleto }} ({{ d.matricula }})</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
})
export class DisciplinaForm extends FormularioBase<Disciplina> {
  private fb = inject(FormBuilder);
  private service = inject(DisciplinaService);
  cursos = signal<Curso[]>([]);
  docentes = signal<Docente[]>([]);
  admin = signal(false);

  form = this.fb.group({
    sigla: [this.item?.sigla ?? '', Validators.required],
    descricao: [this.item?.descricao ?? '', Validators.required],
    cursoId: [this.item?.cursoId ?? null, Validators.required],
    cargaHoraria: [this.item?.cargaHoraria ?? null, [Validators.required, Validators.min(1)]],
    docenteId: [this.item?.docenteId ?? null],
  });

  constructor() {
    super();
    inject(CursoService).listar().subscribe((c) => this.cursos.set(c));
    const docenteService = inject(DocenteService);
    inject(AuthService).me().subscribe((me) => {
      // O ADMIN escolhe o docente; para o colaborador o docente é ele mesmo
      if (me?.roles.includes(UserRole.ADMIN)) {
        this.admin.set(true);
        this.form.controls.docenteId.setValidators(me.docenteId ? [] : [Validators.required]);
        this.form.controls.docenteId.updateValueAndValidity();
        docenteService.listar({ status: 'ATIVO' }).subscribe((d) => this.docentes.set(d));
      }
    });
  }

  enviar(): void {
    const req = this.form.getRawValue() as DisciplinaRequest;
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}

@Component({
  selector: 'app-disciplinas',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro [titulo]="admin() ? 'Disciplinas' : 'Minhas disciplinas'"
      subtitulo="Disciplinas lecionadas, vinculadas a um único curso. Inative a disciplina quando ela deixar de ser oferecida."
      [dados]="dados()" [colunas]="colunas"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class Disciplinas extends CadastroBase<Disciplina> {
  protected readonly service = inject(DisciplinaService);
  protected readonly tipo = 'DISCIPLINA' as const;
  protected readonly formulario = DisciplinaForm;
  admin = signal(false);

  colunas: DynamicTableColumn[] = [
    { key: 'sigla', label: 'Sigla' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'cursoSigla', label: 'Curso' },
    { key: 'cargaHoraria', label: 'Carga horária', format: (v) => `${v}h` },
    { key: 'docenteNome', label: 'Docente' },
    COLUNA_CADASTRO,
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    inject(AuthService).me().subscribe((me) => this.admin.set(!!me?.roles.includes(UserRole.ADMIN)));
    this.carregar();
  }

  protected descrever(item: Disciplina): string {
    return `a disciplina ${item.sigla} — ${item.descricao}`;
  }
}
