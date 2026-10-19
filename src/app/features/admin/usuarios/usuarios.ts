import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ROLE_LABELS, UserRole } from '../../../core';
import {
  ConfirmDialogComponent, DynamicTableColumn, FormularioBase, InfoBarService, PaginaCadastro, Usuario,
  UsuarioRequest, UsuarioService,
} from '../../../shared';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar usuário' : 'Novo administrador' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field><mat-label>Nome</mat-label><input matInput formControlName="name"></mat-form-field>
        <mat-form-field><mat-label>Usuário (login)</mat-label><input matInput formControlName="username"></mat-form-field>
        <mat-form-field class="col-2">
          <mat-label>Senha</mat-label>
          <input matInput type="password" formControlName="password"
                 [placeholder]="editando ? 'Deixe em branco para manter' : 'Mínimo de 6 caracteres'">
          @if (form.controls.password.hasError('minlength')) { <mat-error>Mínimo de 6 caracteres</mat-error> }
        </mat-form-field>

        <div class="secao-form">Perfis de acesso</div>
        <div class="col-2">
          <mat-checkbox formControlName="admin">Administrador</mat-checkbox>
          <p class="dica">
            Os perfis Colaborador e Usuário são concedidos pelos cadastros de docente e discente.
            @if (item?.docenteMatricula) { Esta conta é do docente {{ item?.docenteMatricula }}. }
            @if (item?.discenteMatricula) { Esta conta é do discente {{ item?.discenteMatricula }}. }
          </p>
        </div>
        <div class="col-2"><mat-checkbox formControlName="enabled">Conta ativa</mat-checkbox></div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
})
export class UsuarioForm extends FormularioBase<Usuario> {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioService);

  form = this.fb.nonNullable.group({
    name: [this.item?.name ?? '', Validators.required],
    username: [this.item?.username ?? '', Validators.required],
    password: ['', this.editando ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
    admin: [this.item ? this.item.roles.includes(UserRole.ADMIN) : true],
    enabled: [this.item?.enabled ?? true],
  });

  enviar(): void {
    const v = this.form.getRawValue();
    const req: UsuarioRequest = { ...v, password: v.password || null };
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}

@Component({
  selector: 'app-usuarios',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro titulo="Usuários e perfis de acesso"
      subtitulo="Um usuário pode acumular perfis (ex.: docente que também é administrador)."
      rotuloNovo="Novo administrador" [dados]="dados()" [colunas]="colunas"
      [filtroStatus]="false" [podeAlterarStatus]="false" [podeVerHistorico]="false"
      (novo)="abrir(null)" (editar)="abrir($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class Usuarios {
  private service = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private infoBar = inject(InfoBarService);
  dados = signal<Usuario[]>([]);

  colunas: DynamicTableColumn[] = [
    { key: 'name', label: 'Nome' },
    { key: 'username', label: 'Login' },
    { key: 'roles', label: 'Perfis', format: (v: string[]) => v.map((r) => ROLE_LABELS[r as UserRole] ?? r).join(', ') },
    {
      key: 'docenteMatricula', label: 'Vínculos',
      format: (_v, u: Usuario) => [u.docenteMatricula && `Docente ${u.docenteMatricula}`, u.discenteMatricula && `Discente ${u.discenteMatricula}`].filter(Boolean).join(' · '),
    },
    { key: 'enabled', label: 'Ativo', type: 'boolean' },
    { key: 'dataCadastro', label: 'Cadastro', type: 'datetime' },
  ];

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.service.listar().subscribe({
      next: (d) => this.dados.set(d),
      error: (err) => this.infoBar.error(err, 'Erro ao carregar usuários.'),
    });
  }

  abrir(item: Usuario | null): void {
    this.dialog.open(UsuarioForm, { data: { item }, width: '640px', disableClose: true })
      .afterClosed().subscribe((ok) => ok && this.carregar());
  }

  excluir(item: Usuario): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir usuário', message: `Excluir a conta ${item.username}?`, confirmLabel: 'Excluir' },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.service.excluir(item.id).subscribe({
        next: () => {
          this.infoBar.show({ message: 'Usuário excluído.', type: 'success' });
          this.carregar();
        },
        error: (err) => this.infoBar.error(err, 'Erro ao excluir usuário.'),
      });
    });
  }
}
