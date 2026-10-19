import { DiaSemana, SituacaoMonitoria, Status, TipoMonitoria, Turno } from './models';

export const STATUS_LABEL: Record<Status, string> = { ATIVO: 'Ativo', INATIVO: 'Inativo' };

export const TURNO_LABEL: Record<Turno, string> = {
  MATUTINO: 'Matutino',
  VESPERTINO: 'Vespertino',
  NOTURNO: 'Noturno',
};

export const DIA_LABEL: Record<DiaSemana, string> = {
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
  SABADO: 'Sábado',
};

export const TIPO_MONITORIA_LABEL: Record<TipoMonitoria, string> = { PRESENCIAL: 'Presencial', REMOTO: 'Remoto' };

export const SITUACAO_LABEL: Record<SituacaoMonitoria, string> = {
  AGENDADA: 'Agendada',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

export const TURNOS = Object.keys(TURNO_LABEL) as Turno[];
export const DIAS = Object.keys(DIA_LABEL) as DiaSemana[];

/** "2026-10-05" -> "05/10/2026" (sem conversão de fuso). */
export function dataBr(valor: string | null | undefined): string {
  if (!valor) return '';
  const [ano, mes, dia] = valor.substring(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Date do datepicker -> "yyyy-MM-dd" no fuso local. */
export function dataIso(valor: Date | string | null | undefined): string | null {
  if (!valor) return null;
  if (typeof valor === 'string') return valor.substring(0, 10);
  const mes = String(valor.getMonth() + 1).padStart(2, '0');
  const dia = String(valor.getDate()).padStart(2, '0');
  return `${valor.getFullYear()}-${mes}-${dia}`;
}

/** "yyyy-MM-dd" -> Date local (para preencher o datepicker). */
export function paraDate(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const [ano, mes, dia] = valor.substring(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}
