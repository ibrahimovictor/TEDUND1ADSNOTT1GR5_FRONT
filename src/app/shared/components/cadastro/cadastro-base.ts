import { Type, inject, signal } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ComStatus, Status, TipoEntidade } from '../../models';
import { STATUS_LABEL } from '../../labels';
import { DynamicTableColumn } from '../dynamic-table';
import { CrudService, InfoBarService } from '../../services';
import { ConfirmDialogComponent } from '../confirm-dialog';
import { HistoricoDialog } from './historico-dialog';
import { MotivoDialog } from './motivo-dialog';

/** Colunas presentes em todos os cadastros. */
export const COLUNA_CADASTRO: DynamicTableColumn = { key: 'dataCadastro', label: 'Cadastro', type: 'datetime' };
export const COLUNA_STATUS: DynamicTableColumn = { key: 'status', label: 'Status', format: (v: Status) => STATUS_LABEL[v] };

/** Comportamento comum das telas de cadastro. */
export abstract class CadastroBase<T extends ComStatus> {
  protected readonly dialog = inject(MatDialog);
  protected readonly infoBar = inject(InfoBarService);

  readonly dados = signal<T[]>([]);

  protected abstract readonly service: CrudService<T, any>;
  protected abstract readonly tipo: TipoEntidade;
  protected abstract readonly formulario: Type<unknown>;
  /** Descrição curta usada nas mensagens (ex.: "a IES UCSAL"). */
  protected abstract descrever(item: T): string;

  protected parametros(): Record<string, string | number | null> | undefined {
    return undefined;
  }

  carregar(): void {
    this.service.listar(this.parametros()).subscribe({
      next: (dados) => this.dados.set(dados),
      error: (err) => this.infoBar.error(err, 'Erro ao carregar os dados.'),
    });
  }

  novo(): void {
    this.abrirFormulario(null);
  }

  editar(item: T): void {
    this.abrirFormulario(item);
  }

  protected abrirFormulario(item: T | null, extras: Record<string, unknown> = {}): void {
    this.dialog
      .open(this.formulario, { data: { item, ...extras }, width: '760px', maxWidth: '95vw', disableClose: true })
      .afterClosed()
      .subscribe((salvou) => salvou && this.carregar());
  }

  /** Inativa/reativa pedindo o motivo, que é registrado no histórico associado. */
  alterarStatus(item: T): void {
    const inativar = item.status === 'ATIVO';
    this.dialog
      .open(MotivoDialog, {
        data: {
          titulo: inativar ? 'Inativar cadastro' : 'Reativar cadastro',
          mensagem: `${inativar ? 'Inativar' : 'Reativar'} ${this.descrever(item)}? O motivo ficará registrado no histórico.`,
          confirmar: inativar ? 'Inativar' : 'Reativar',
        },
      })
      .afterClosed()
      .subscribe((motivo?: string) => {
        if (!motivo) return;
        this.service.alterarStatus(item.id, { status: inativar ? 'INATIVO' : 'ATIVO', motivo }).subscribe({
          next: () => {
            this.infoBar.show({ message: inativar ? 'Cadastro inativado.' : 'Cadastro reativado.', type: 'success' });
            this.carregar();
          },
          error: (err) => this.infoBar.error(err, 'Erro ao alterar o status.'),
        });
      });
  }

  historico(item: T): void {
    this.dialog.open(HistoricoDialog, { data: { tipo: this.tipo, id: item.id, titulo: this.descrever(item) } });
  }

  excluir(item: T): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmação de exclusão',
          message: `Excluir ${this.descrever(item)}? Cadastros com histórico vinculado só podem ser inativados.`,
          confirmLabel: 'Excluir',
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.service.excluir(item.id).subscribe({
          next: () => {
            this.infoBar.show({ message: 'Cadastro excluído.', type: 'success' });
            this.carregar();
          },
          error: (err) => this.infoBar.error(err, 'Erro ao excluir.'),
        });
      });
  }
}

/** Comportamento comum dos formulários em diálogo. */
export abstract class FormularioBase<T> {
  protected readonly dialogRef = inject(MatDialogRef);
  protected readonly infoBar = inject(InfoBarService);
  readonly item: T | null = inject<{ item: T | null }>(MAT_DIALOG_DATA)?.item ?? null;
  readonly salvando = signal(false);

  get editando(): boolean {
    return this.item !== null;
  }

  protected salvar(requisicao: Observable<unknown>, mensagem = 'Dados salvos com sucesso.'): void {
    this.salvando.set(true);
    requisicao.subscribe({
      next: () => {
        this.infoBar.show({ message: mensagem, type: 'success' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.salvando.set(false);
        this.infoBar.error(err, 'Erro ao salvar.');
      },
    });
  }
}
