import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  COLUNA_CADASTRO, COLUNA_STATUS, CadastroBase, CentroAcademico, CentroAcademicoService, Curso, CursoRequest,
  CursoService, DynamicTableColumn, FormularioBase, PaginaCadastro, TURNOS, TURNO_LABEL, Turno,
} from '../../../shared';

@Component({
  selector: 'app-curso-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Curso</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field class="col-2">
          <mat-label>Centro Acadêmico</mat-label>
          <mat-select formControlName="centroAcademicoId">
            @for (ca of cas(); track ca.id) {
              <mat-option [value]="ca.id" [disabled]="ca.status === 'INATIVO' && ca.id !== item?.centroAcademicoId">
                {{ ca.iesSigla }} / {{ ca.sigla }} — {{ ca.nome }}{{ ca.status === 'INATIVO' ? ' (inativo)' : '' }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Sigla</mat-label><input matInput formControlName="sigla" placeholder="Ex.: BES"></mat-form-field>
        <mat-form-field><mat-label>Descrição</mat-label><input matInput formControlName="descricao" placeholder="Ex.: Bacharelado em Engenharia de Software"></mat-form-field>
        <mat-form-field>
          <mat-label>Turnos oferecidos</mat-label>
          <mat-select formControlName="turnos" multiple>
            @for (t of turnos; track t) { <mat-option [value]="t">{{ turnoLabel[t] }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Coordenador(a) do curso</mat-label><input matInput formControlName="coordenadorNome"></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
})
export class CursoForm extends FormularioBase<Curso> {
  private fb = inject(FormBuilder);
  private service = inject(CursoService);
  readonly turnos = TURNOS;
  readonly turnoLabel = TURNO_LABEL;
  cas = signal<CentroAcademico[]>([]);

  form = this.fb.group({
    centroAcademicoId: [this.item?.centroAcademicoId ?? null, Validators.required],
    sigla: [this.item?.sigla ?? '', Validators.required],
    descricao: [this.item?.descricao ?? '', Validators.required],
    turnos: [(this.item?.turnos ?? []) as Turno[], Validators.required],
    coordenadorNome: [this.item?.coordenadorNome ?? '', Validators.required],
  });

  constructor() {
    super();
    inject(CentroAcademicoService).listar().subscribe((cas) => this.cas.set(cas));
  }

  enviar(): void {
    const req = this.form.getRawValue() as CursoRequest;
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}

@Component({
  selector: 'app-cursos',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro titulo="Cursos"
      subtitulo="Cursos vinculados a um único Centro Acadêmico. Inative o curso quando ele deixar de ser oferecido."
      [dados]="dados()" [colunas]="colunas"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class Cursos extends CadastroBase<Curso> {
  protected readonly service = inject(CursoService);
  protected readonly tipo = 'CURSO' as const;
  protected readonly formulario = CursoForm;

  colunas: DynamicTableColumn[] = [
    { key: 'iesSigla', label: 'IES' },
    { key: 'centroAcademicoSigla', label: 'CA' },
    { key: 'sigla', label: 'Sigla' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'turnos', label: 'Turnos', format: (v: Turno[]) => v.map((t) => TURNO_LABEL[t]).join(', ') },
    { key: 'coordenadorNome', label: 'Coordenador(a)' },
    COLUNA_CADASTRO,
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    this.carregar();
  }

  protected descrever(item: Curso): string {
    return `o curso ${item.sigla} — ${item.descricao}`;
  }
}
