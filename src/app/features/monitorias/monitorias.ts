import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, UserRole } from '../../core';
import {
  COLUNA_STATUS, CadastroBase, DIA_LABEL, DiaSemana, DynamicTableColumn, Monitoria, MonitoriaService,
  PaginaCadastro, SITUACAO_LABEL, SituacaoMonitoria, dataBr,
} from '../../shared';
import { MonitoriaForm } from './monitoria-form';

/**
 * modo "gestao": colaborador (as que orienta) ou admin (todas) — cadastrar, editar, inativar.
 * modo "discente": "Minhas monitorias" do discente monitor — consulta e acesso ao relatório.
 */
@Component({
  selector: 'app-monitorias',
  imports: [PaginaCadastro, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <app-pagina-cadastro [titulo]="discente ? 'Minhas monitorias' : 'Monitorias'"
      [subtitulo]="discente
        ? 'Monitorias em que você é o(a) monitor(a). Preencha o relatório e emita o relatório final em PDF.'
        : 'Cada monitoria tem um docente, um discente (único no semestre) e uma única disciplina, com até 50 minutos por dia.'"
      [dados]="dados()" [colunas]="colunas"
      [podeCriar]="!discente" [podeEditar]="!discente" [podeAlterarStatus]="!discente" [podeExcluir]="!discente"
      [podeVerHistorico]="!discente"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
      <ng-template #acoesExtras let-row>
        @if (discente || row.possuiRelatorio) {
          <button mat-icon-button [matTooltip]="discente ? 'Relatório da monitoria' : 'Ver relatório'"
                  (click)="$event.stopPropagation(); abrirRelatorio(row)">
            <mat-icon>{{ discente ? 'edit_note' : 'description' }}</mat-icon>
          </button>
        }
      </ng-template>
    </app-pagina-cadastro>
  `,
})
export class Monitorias extends CadastroBase<Monitoria> {
  protected readonly service = inject(MonitoriaService);
  protected readonly tipo = 'MONITORIA' as const;
  protected readonly formulario = MonitoriaForm;
  private router = inject(Router);
  readonly discente = inject(ActivatedRoute).snapshot.data['modo'] === 'discente';
  private perfil = signal<string | null>(null);

  colunas: DynamicTableColumn[] = [
    { key: 'semestre', label: 'Semestre' },
    { key: 'disciplinaSigla', label: 'Disciplina', format: (v, m: Monitoria) => `${v} — ${m.disciplinaDescricao}` },
    { key: 'discenteNome', label: 'Discente', format: (v, m: Monitoria) => `${v} (${m.discenteMatricula})` },
    { key: 'docenteNome', label: 'Docente' },
    { key: 'diasSemana', label: 'Dias', format: (v: DiaSemana[]) => v.map((d) => DIA_LABEL[d].substring(0, 3)).join(', ') },
    { key: 'horarioInicio', label: 'Horário', format: (v, m: Monitoria) => `${v}–${m.horarioFim}` },
    { key: 'dataInicio', label: 'Período', format: (v, m: Monitoria) => `${dataBr(v)} a ${dataBr(m.dataEncerramento)}` },
    { key: 'situacao', label: 'Situação', format: (v: SituacaoMonitoria) => SITUACAO_LABEL[v] },
    { key: 'possuiRelatorio', label: 'Relatório', type: 'boolean' },
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    inject(AuthService).me().subscribe((me) => {
      const admin = !!me?.roles.includes(UserRole.ADMIN);
      this.perfil.set(this.discente ? UserRole.USUARIO : admin ? null : UserRole.COLABORADOR);
      this.carregar();
    });
  }

  protected override parametros() {
    return { perfil: this.perfil() };
  }

  abrirRelatorio(m: Monitoria): void {
    this.router.navigate([this.discente ? '/minhas-monitorias' : '/monitorias', m.id, 'relatorio']);
  }

  protected descrever(item: Monitoria): string {
    return `a monitoria de ${item.discenteNome} em ${item.disciplinaSigla} (${item.semestre})`;
  }
}
