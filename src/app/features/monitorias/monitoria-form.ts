import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { startWith } from 'rxjs';
import { AuthService, UserRole } from '../../core';
import {
  DIAS, DIA_LABEL, DiaSemana, Discente, DiscenteService, Disciplina, DisciplinaService, Docente, DocenteService,
  FormularioBase, Monitoria, MonitoriaRequest, MonitoriaService, dataIso, paraDate,
} from '../../shared';

const DURACAO_MAXIMA = 50;

function minutos(hora: string | null | undefined): number | null {
  if (!hora) return null;
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function semestreDe(data: Date | null | undefined): string {
  return data ? `${data.getFullYear()}.${data.getMonth() < 6 ? 1 : 2}` : '';
}

@Component({
  selector: 'app-monitoria-form',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Cadastrar' }} Monitoria</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        @if (admin()) {
          <mat-form-field class="col-2">
            <mat-label>Docente responsável</mat-label>
            <mat-select formControlName="docenteId">
              @for (d of docentes(); track d.id) { <mat-option [value]="d.id">{{ d.nomeCompleto }} ({{ d.matricula }})</mat-option> }
            </mat-select>
          </mat-form-field>
        } @else {
          <p class="dica col-2">O docente responsável é registrado automaticamente: você.</p>
        }
        <mat-form-field class="col-2">
          <mat-label>Disciplina monitorada</mat-label>
          <mat-select formControlName="disciplinaId">
            @for (d of disciplinasDoDocente(); track d.id) {
              <mat-option [value]="d.id">{{ d.sigla }} — {{ d.descricao }} ({{ d.cursoSigla }})</mat-option>
            }
          </mat-select>
          @if (disciplinasDoDocente().length === 0) { <mat-hint>Nenhuma disciplina ativa lecionada por este docente</mat-hint> }
        </mat-form-field>
        <mat-form-field class="col-2">
          <mat-label>Discente monitor(a)</mat-label>
          <mat-select formControlName="discenteId">
            @for (d of discentes(); track d.id) {
              <mat-option [value]="d.id">{{ d.nomeCompleto }} ({{ d.matricula }} — {{ d.cursoSigla }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="secao-form">Dias e horário (máximo de {{ maximo }} minutos por dia)</div>
        <mat-form-field class="col-2">
          <mat-label>Dias da semana</mat-label>
          <mat-select formControlName="diasSemana" multiple>
            @for (d of dias; track d) { <mat-option [value]="d">{{ diaLabel[d] }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field><mat-label>Horário inicial</mat-label><input matInput type="time" formControlName="horarioInicio"></mat-form-field>
        <mat-form-field>
          <mat-label>Horário final</mat-label>
          <input matInput type="time" formControlName="horarioFim">
          @if (duracao() !== null) {
            <mat-hint [class.erro]="duracaoInvalida()">Duração: {{ duracao() }} min{{ duracaoInvalida() ? ' — acima do limite de ' + maximo + ' min' : '' }}</mat-hint>
          }
        </mat-form-field>

        <div class="secao-form">Período {{ semestre() ? '— semestre ' + semestre() : '' }}</div>
        <mat-form-field>
          <mat-label>Data inicial</mat-label>
          <input matInput [matDatepicker]="dpInicio" formControlName="dataInicio">
          <mat-datepicker-toggle matIconSuffix [for]="dpInicio"></mat-datepicker-toggle>
          <mat-datepicker #dpInicio></mat-datepicker>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Data de encerramento</mat-label>
          <input matInput [matDatepicker]="dpFim" formControlName="dataEncerramento" [min]="form.controls.dataInicio.value">
          <mat-datepicker-toggle matIconSuffix [for]="dpFim"></mat-datepicker-toggle>
          <mat-datepicker #dpFim></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button matButton="filled" [disabled]="form.invalid || duracaoInvalida() || salvando()" (click)="enviar()">Salvar</button>
    </mat-dialog-actions>
  `,
  styles: [`.erro { color: var(--mat-sys-error); }`],
})
export class MonitoriaForm extends FormularioBase<Monitoria> {
  private fb = inject(FormBuilder);
  private service = inject(MonitoriaService);
  readonly dias = DIAS;
  readonly diaLabel = DIA_LABEL;
  readonly maximo = DURACAO_MAXIMA;

  admin = signal(false);
  docentes = signal<Docente[]>([]);
  disciplinas = signal<Disciplina[]>([]);
  discentes = signal<Discente[]>([]);
  private meuDocenteId = signal<number | null>(null);

  form = this.fb.group({
    docenteId: [this.item?.docenteId ?? null as number | null],
    disciplinaId: [this.item?.disciplinaId ?? null as number | null, Validators.required],
    discenteId: [this.item?.discenteId ?? null as number | null, Validators.required],
    diasSemana: [(this.item?.diasSemana ?? []) as DiaSemana[], Validators.required],
    horarioInicio: [this.item?.horarioInicio ?? '', Validators.required],
    horarioFim: [this.item?.horarioFim ?? '', Validators.required],
    dataInicio: [paraDate(this.item?.dataInicio), Validators.required],
    dataEncerramento: [paraDate(this.item?.dataEncerramento), Validators.required],
  });

  private valores = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  duracao = computed(() => {
    const ini = minutos(this.valores().horarioInicio);
    const fim = minutos(this.valores().horarioFim);
    return ini === null || fim === null ? null : fim - ini;
  });
  duracaoInvalida = computed(() => {
    const d = this.duracao();
    return d !== null && (d <= 0 || d > DURACAO_MAXIMA);
  });
  semestre = computed(() => semestreDe(this.valores().dataInicio as Date | null));

  /** Só as disciplinas ativas que o docente responsável leciona. */
  disciplinasDoDocente = computed(() => {
    const docenteId = this.admin() ? this.valores().docenteId : this.meuDocenteId();
    return this.disciplinas().filter(
      (d) => (d.status === 'ATIVO' || d.id === this.item?.disciplinaId) && (!docenteId || d.docenteId === docenteId)
    );
  });

  constructor() {
    super();
    const docenteService = inject(DocenteService);
    inject(DisciplinaService).listar().subscribe((d) => this.disciplinas.set(d));
    inject(DiscenteService).listar({ status: 'ATIVO' }).subscribe((d) => this.discentes.set(d));
    inject(AuthService).me().subscribe((me) => {
      this.meuDocenteId.set(me?.docenteId ?? null);
      if (me?.roles.includes(UserRole.ADMIN)) {
        this.admin.set(true);
        this.form.controls.docenteId.setValidators(Validators.required);
        this.form.controls.docenteId.updateValueAndValidity();
        if (!this.item && me.docenteId) this.form.controls.docenteId.setValue(me.docenteId);
        docenteService.listar({ status: 'ATIVO' }).subscribe((d) => this.docentes.set(d));
      }
    });
  }

  enviar(): void {
    const v = this.form.getRawValue();
    const req: MonitoriaRequest = {
      docenteId: this.admin() ? v.docenteId : null,
      discenteId: v.discenteId!,
      disciplinaId: v.disciplinaId!,
      diasSemana: v.diasSemana!,
      horarioInicio: v.horarioInicio!,
      horarioFim: v.horarioFim!,
      dataInicio: dataIso(v.dataInicio)!,
      dataEncerramento: dataIso(v.dataEncerramento)!,
    };
    this.salvar(this.editando ? this.service.atualizar(this.item!.id, req) : this.service.criar(req));
  }
}
