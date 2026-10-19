import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core';
import {
  DIA_LABEL, Frequencia, HistoricoDialog, InfoBarService, Monitoria, MonitoriaService, MotivoDialog, PdfService,
  RelatorioMonitoria, RelatorioRequest, SITUACAO_LABEL, STATUS_LABEL, dataBr, dataIso, paraDate,
} from '../../shared';

/** RF 10 e 11 — Relatório da monitoria (cadastro pelo discente) e emissão do relatório final em PDF. */
@Component({
  selector: 'app-relatorio-monitoria',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatRadioModule, MatTooltipModule,
  ],
  template: `
    <div class="pagina">
      <div class="pagina-header">
        <h1>Relatório da monitoria</h1>
        <p class="subtitulo">
          @if (podeEditar()) {
            Registre as informações da monitoria para emitir o relatório final em PDF.
          } @else if (ehMonitor()) {
            {{ motivoBloqueio() }}
          } @else {
            Consulta do relatório preenchido pelo(a) discente monitor(a).
          }
        </p>
      </div>

      @if (monitoria(); as m) {
        <div class="dados-resumo">
          <div><span>Discente (monitor)</span><strong>{{ m.discenteNome }} ({{ m.discenteMatricula }})</strong></div>
          <div><span>Docente responsável</span><strong>{{ m.docenteNome }}</strong></div>
          <div><span>Disciplina</span><strong>{{ m.disciplinaSigla }} — {{ m.disciplinaDescricao }}</strong></div>
          <div><span>Semestre</span><strong>{{ m.semestre }}</strong></div>
          <div><span>Período</span><strong>{{ data(m.dataInicio) }} a {{ data(m.dataEncerramento) }}</strong></div>
          <div><span>Dias e horário</span><strong>{{ dias(m) }}, {{ m.horarioInicio }}–{{ m.horarioFim }}</strong></div>
          <div><span>Situação da monitoria</span><strong>{{ situacao(m) }}</strong></div>
          <div><span>Relatório</span><strong>{{ relatorio() ? statusLabel[relatorio()!.status] + ' — atualizado em ' + atualizado() : 'Ainda não cadastrado' }}</strong></div>
        </div>
      }

      @if (carregado()) {
        @if (relatorio() || podeEditar()) {
          <form [formGroup]="form" class="form-grid">
            <div class="col-2">
              <label class="dica">Tipo de monitoria</label><br>
              <mat-radio-group formControlName="tipo">
                <mat-radio-button value="PRESENCIAL">Presencial</mat-radio-button>
                <mat-radio-button value="REMOTO">Remoto</mat-radio-button>
              </mat-radio-group>
            </div>
            <mat-form-field class="col-2">
              <mat-label>Local de atuação da monitoria</mat-label>
              <input matInput formControlName="localAtuacao" placeholder="Ex.: Laboratório 3 — campus Pituaçu / Microsoft Teams">
            </mat-form-field>
            <mat-form-field class="col-2">
              <mat-label>Ocorrências identificadas durante o período</mat-label>
              <textarea matInput formControlName="ocorrencias" rows="4"></textarea>
            </mat-form-field>

            <div class="secao-form">
              Frequência dos alunos que participaram
              @if (podeEditar()) {
                <button mat-button type="button" (click)="adicionarFrequencia()"><mat-icon>add</mat-icon> Adicionar encontro</button>
              }
            </div>
            @if (frequencias.length === 0) { <p class="dica col-2">Nenhum encontro registrado.</p> }
            <ng-container formArrayName="frequencias">
              @for (f of frequencias.controls; track f; let i = $index) {
                <div class="linha-lista" [formGroupName]="i">
                  <mat-form-field style="max-width: 190px">
                    <mat-label>Data</mat-label>
                    <input matInput [matDatepicker]="dp" formControlName="data"
                           [min]="minData()" [max]="maxData()">
                    <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
                    <mat-datepicker #dp></mat-datepicker>
                  </mat-form-field>
                  <mat-form-field style="max-width: 150px">
                    <mat-label>Nº de alunos</mat-label>
                    <input matInput type="number" min="0" formControlName="quantidadeAlunos">
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Alunos participantes</mat-label>
                    <input matInput formControlName="alunos" placeholder="Nomes ou matrículas, separados por vírgula">
                  </mat-form-field>
                  @if (podeEditar()) {
                    <button mat-icon-button type="button" matTooltip="Remover" (click)="frequencias.removeAt(i)"><mat-icon>delete</mat-icon></button>
                  }
                </div>
              }
            </ng-container>
            @if (frequencias.length) {
              <p class="dica col-2">Total: {{ frequencias.length }} encontro(s), {{ totalAlunos() }} participação(ões).</p>
            }

            <mat-form-field class="col-2">
              <mat-label>Considerações finais sobre a monitoria</mat-label>
              <textarea matInput formControlName="consideracoesFinais" rows="4"></textarea>
            </mat-form-field>
          </form>
        } @else {
          <p>O(A) discente monitor(a) ainda não cadastrou o relatório desta monitoria.</p>
        }

        <div class="barra">
          <button mat-button (click)="voltar()"><mat-icon>arrow_back</mat-icon> Voltar</button>
          <span class="espaco"></span>
          @if (relatorio()) {
            <button mat-button (click)="historico()"><mat-icon>history</mat-icon> Histórico</button>
            @if (ehMonitor() && monitoria()?.status === 'ATIVO') {
              <button mat-button (click)="alterarStatus()">
                <mat-icon>{{ relatorio()!.status === 'ATIVO' ? 'block' : 'check_circle' }}</mat-icon>
                {{ relatorio()!.status === 'ATIVO' ? 'Inativar relatório' : 'Reativar relatório' }}
              </button>
            }
            <button mat-stroked-button (click)="emitirPdf()"><mat-icon>picture_as_pdf</mat-icon> Emitir relatório final (PDF)</button>
          }
          @if (podeEditar()) {
            <button matButton="filled" [disabled]="form.invalid || salvando()" (click)="salvar()">Salvar relatório</button>
          }
        </div>
      }
    </div>
  `,
})
export class RelatorioMonitoriaPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(MonitoriaService);
  private pdf = inject(PdfService);
  private dialog = inject(MatDialog);
  private infoBar = inject(InfoBarService);
  readonly statusLabel = STATUS_LABEL;

  private id = Number(this.route.snapshot.paramMap.get('id'));
  monitoria = signal<Monitoria | null>(null);
  relatorio = signal<RelatorioMonitoria | null>(null);
  ehMonitor = signal(false);
  carregado = signal(false);
  salvando = signal(false);

  podeEditar = computed(() =>
    this.ehMonitor() && this.monitoria()?.status === 'ATIVO' && (this.relatorio()?.status ?? 'ATIVO') === 'ATIVO');
  motivoBloqueio = computed(() =>
    this.monitoria()?.status !== 'ATIVO'
      ? 'A monitoria foi cancelada: o relatório não pode mais ser alterado.'
      : 'O relatório está inativo. Reative-o para voltar a editar.');
  minData = computed(() => paraDate(this.monitoria()?.dataInicio));
  maxData = computed(() => paraDate(this.monitoria()?.dataEncerramento));

  form = this.fb.group({
    tipo: ['PRESENCIAL', Validators.required],
    localAtuacao: ['', Validators.required],
    ocorrencias: [''],
    consideracoesFinais: [''],
    frequencias: this.fb.array([] as any[]),
  });

  get frequencias(): FormArray {
    return this.form.get('frequencias') as FormArray;
  }

  constructor() {
    forkJoin({ me: inject(AuthService).me(), monitoria: this.service.buscar(this.id) }).subscribe({
      next: ({ me, monitoria }) => {
        this.monitoria.set(monitoria);
        this.ehMonitor.set(!!me?.discenteId && me.discenteId === monitoria.discenteId);
        this.carregarRelatorio();
      },
      error: (err) => {
        this.infoBar.error(err, 'Erro ao carregar a monitoria.');
        this.voltar();
      },
    });
  }

  private carregarRelatorio(): void {
    this.service.buscarRelatorio(this.id).subscribe({
      next: (r) => this.preencher(r),
      error: (err: HttpErrorResponse) => {
        if (err.status !== 404) this.infoBar.error(err, 'Erro ao carregar o relatório.');
        this.preencher(null);
      },
    });
  }

  private preencher(r: RelatorioMonitoria | null): void {
    this.relatorio.set(r);
    this.frequencias.clear();
    if (r) {
      this.form.patchValue({
        tipo: r.tipo,
        localAtuacao: r.localAtuacao,
        ocorrencias: r.ocorrencias ?? '',
        consideracoesFinais: r.consideracoesFinais ?? '',
      });
      r.frequencias.forEach((f) => this.frequencias.push(this.grupo(f)));
    }
    if (this.podeEditar()) this.form.enable(); else this.form.disable();
    this.carregado.set(true);
  }

  private grupo(f?: Frequencia) {
    return this.fb.group({
      data: [paraDate(f?.data) ?? null as Date | null, Validators.required],
      quantidadeAlunos: [f?.quantidadeAlunos ?? 0, [Validators.required, Validators.min(0)]],
      alunos: [f?.alunos ?? ''],
    });
  }

  adicionarFrequencia(): void {
    this.frequencias.push(this.grupo());
  }

  totalAlunos(): number {
    return (this.frequencias.getRawValue() as any[]).reduce((s, f) => s + (Number(f.quantidadeAlunos) || 0), 0);
  }

  salvar(): void {
    const v = this.form.getRawValue();
    const req: RelatorioRequest = {
      tipo: v.tipo as any,
      localAtuacao: v.localAtuacao!,
      ocorrencias: v.ocorrencias || null,
      consideracoesFinais: v.consideracoesFinais || null,
      frequencias: (v.frequencias as any[]).map((f) => ({
        data: dataIso(f.data)!, quantidadeAlunos: Number(f.quantidadeAlunos), alunos: f.alunos || null,
      })),
    };
    this.salvando.set(true);
    this.service.salvarRelatorio(this.id, req).subscribe({
      next: (r) => {
        this.salvando.set(false);
        this.infoBar.show({ message: 'Relatório salvo.', type: 'success' });
        this.atualizarMonitoria();
        this.preencher(r);
      },
      error: (err) => {
        this.salvando.set(false);
        this.infoBar.error(err, 'Erro ao salvar o relatório.');
      },
    });
  }

  alterarStatus(): void {
    const inativar = this.relatorio()!.status === 'ATIVO';
    this.dialog.open(MotivoDialog, {
      data: {
        titulo: inativar ? 'Inativar relatório' : 'Reativar relatório',
        mensagem: 'O motivo ficará registrado no histórico do relatório.',
        confirmar: inativar ? 'Inativar' : 'Reativar',
      },
    }).afterClosed().subscribe((motivo?: string) => {
      if (!motivo) return;
      this.service.alterarStatusRelatorio(this.id, { status: inativar ? 'INATIVO' : 'ATIVO', motivo }).subscribe({
        next: (r) => {
          this.infoBar.show({ message: inativar ? 'Relatório inativado.' : 'Relatório reativado.', type: 'success' });
          this.preencher(r);
        },
        error: (err) => this.infoBar.error(err, 'Erro ao alterar o status do relatório.'),
      });
    });
  }

  historico(): void {
    this.dialog.open(HistoricoDialog, {
      data: { tipo: 'RELATORIO_MONITORIA', id: this.relatorio()!.id, titulo: 'Relatório da monitoria' },
    });
  }

  emitirPdf(): void {
    this.pdf.baixar(`monitorias/${this.id}/relatorio/pdf`, `relatorio-monitoria-${this.id}.pdf`).subscribe({
      error: (err) => this.infoBar.error(err, 'Erro ao emitir o relatório em PDF.'),
    });
  }

  voltar(): void {
    this.router.navigate([this.route.snapshot.data['modo'] === 'discente' ? '/minhas-monitorias' : '/monitorias']);
  }

  private atualizarMonitoria(): void {
    this.service.buscar(this.id).subscribe((m) => this.monitoria.set(m));
  }

  data(v: string): string {
    return dataBr(v);
  }

  dias(m: Monitoria): string {
    return m.diasSemana.map((d) => DIA_LABEL[d]).join(', ');
  }

  situacao(m: Monitoria): string {
    return SITUACAO_LABEL[m.situacao];
  }

  atualizado(): string {
    const r = this.relatorio();
    return r ? new Date(r.dataAtualizacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';
  }
}
