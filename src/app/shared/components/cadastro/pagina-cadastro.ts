import { Component, ContentChild, TemplateRef, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicTable, DynamicTableColumn } from '../dynamic-table';

/**
 * Layout padrão das telas de cadastro: título, busca, filtro de status, botão "Novo"
 * e tabela com as ações editar / inativar-reativar / histórico / excluir.
 * Ações específicas podem ser projetadas com <ng-template #acoesExtras let-row>.
 */
@Component({
  selector: 'app-pagina-cadastro',
  imports: [
    NgTemplateOutlet, DynamicTable, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatSelectModule, MatTooltipModule,
  ],
  template: `
    <div class="pagina">
      <div class="pagina-header">
        <h1>{{ titulo() }}</h1>
        @if (subtitulo()) { <p class="subtitulo">{{ subtitulo() }}</p> }
      </div>

      <div class="barra">
        <mat-form-field class="busca" subscriptSizing="dynamic">
          <mat-label>Pesquisar</mat-label>
          <input matInput (keyup)="busca.set($any($event.target).value)" placeholder="Digite para filtrar">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        @if (filtroStatus()) {
          <mat-form-field class="filtro" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [value]="status()" (selectionChange)="status.set($event.value)">
              <mat-option value="">Todos</mat-option>
              <mat-option value="ATIVO">Ativos</mat-option>
              <mat-option value="INATIVO">Inativos</mat-option>
            </mat-select>
          </mat-form-field>
        }
        <ng-content></ng-content>
        <span class="espaco"></span>
        @if (podeCriar()) {
          <button matButton="filled" (click)="novo.emit()">{{ rotuloNovo() }} <mat-icon>add</mat-icon></button>
        }
      </div>

      <app-dynamic-table [data]="filtrados()" [filter]="busca()" [columns]="colunas()" [showActions]="true">
        <ng-template #actionsTemplate let-row>
          @if (acoesExtras) {
            <ng-container *ngTemplateOutlet="acoesExtras; context: { $implicit: row }"></ng-container>
          }
          @if (podeEditar()) {
            <button mat-icon-button matTooltip="Editar" (click)="$event.stopPropagation(); editar.emit(row)">
              <mat-icon>edit</mat-icon>
            </button>
          }
          @if (podeAlterarStatus()) {
            <button mat-icon-button [matTooltip]="row.status === 'ATIVO' ? 'Inativar' : 'Reativar'"
                    (click)="$event.stopPropagation(); alterarStatus.emit(row)">
              <mat-icon>{{ row.status === 'ATIVO' ? 'block' : 'check_circle' }}</mat-icon>
            </button>
          }
          @if (podeVerHistorico()) {
            <button mat-icon-button matTooltip="Histórico" (click)="$event.stopPropagation(); historico.emit(row)">
              <mat-icon>history</mat-icon>
            </button>
          }
          @if (podeExcluir()) {
            <button mat-icon-button matTooltip="Excluir" (click)="$event.stopPropagation(); excluir.emit(row)">
              <mat-icon>delete</mat-icon>
            </button>
          }
        </ng-template>
      </app-dynamic-table>
    </div>
  `,
})
export class PaginaCadastro {
  titulo = input.required<string>();
  subtitulo = input<string>('');
  dados = input<any[]>([]);
  colunas = input<DynamicTableColumn[]>([]);
  rotuloNovo = input<string>('Novo');
  podeCriar = input<boolean>(true);
  podeEditar = input<boolean>(true);
  podeAlterarStatus = input<boolean>(true);
  podeVerHistorico = input<boolean>(true);
  podeExcluir = input<boolean>(true);
  filtroStatus = input<boolean>(true);

  novo = output<void>();
  editar = output<any>();
  alterarStatus = output<any>();
  historico = output<any>();
  excluir = output<any>();

  @ContentChild('acoesExtras', { read: TemplateRef }) acoesExtras?: TemplateRef<any>;

  busca = signal('');
  status = signal('');
  filtrados = computed(() => {
    const s = this.status();
    return s ? this.dados().filter((d) => d.status === s) : this.dados();
  });
}
