// Tipos espelhando os DTOs do BACK-END.

export type Status = 'ATIVO' | 'INATIVO';
export type Turno = 'MATUTINO' | 'VESPERTINO' | 'NOTURNO';
export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO';
export type TipoMonitoria = 'PRESENCIAL' | 'REMOTO';
export type SituacaoMonitoria = 'AGENDADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
export type TipoEntidade =
  | 'IES' | 'CENTRO_ACADEMICO' | 'CURSO' | 'DOCENTE' | 'DISCENTE' | 'DISCIPLINA' | 'MONITORIA' | 'RELATORIO_MONITORIA';

/** Cadastros que possuem status e data de cadastramento. */
export interface ComStatus {
  id: number;
  status: Status;
  dataCadastro: string;
}

export interface StatusRequest {
  status: Status;
  motivo: string;
}

export interface Historico {
  id: number;
  tipoEntidade: TipoEntidade;
  entidadeId: number;
  acao: 'INATIVACAO' | 'REATIVACAO';
  motivo: string;
  username: string | null;
  dataHora: string;
}

// ------------------------------ IES ------------------------------
export interface ProReitoria {
  id?: number;
  nome: string;
  proReitorNome: string;
  dataNomeacao: string | null;
}

export interface Ies extends ComStatus {
  sigla: string;
  nome: string;
  emailCentral: string;
  telefoneCentral: string;
  reitorNome: string;
  reitorEmail: string | null;
  proReitorias: ProReitoria[];
}

export type IesRequest = Omit<Ies, keyof ComStatus>;

// ------------------------- Centro Acadêmico -------------------------
export interface CentroAcademico extends ComStatus {
  sigla: string;
  nome: string;
  emailCentral: string;
  telefoneCentral: string;
  coordenadorNome: string;
  iesId: number;
  iesSigla: string;
}

export type CentroAcademicoRequest = Omit<CentroAcademico, keyof ComStatus | 'iesSigla'>;

// ------------------------------ Curso ------------------------------
export interface Curso extends ComStatus {
  sigla: string;
  descricao: string;
  centroAcademicoId: number;
  centroAcademicoSigla: string;
  iesSigla: string;
  turnos: Turno[];
  coordenadorNome: string;
}

export interface CursoRequest {
  sigla: string;
  descricao: string;
  centroAcademicoId: number;
  turnos: Turno[];
  coordenadorNome: string;
}

// ----------------------------- Docente -----------------------------
export interface Docente extends ComStatus {
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  centroAcademicoId: number;
  centroAcademicoSigla: string;
  iesSigla: string;
  login: string | null;
}

export interface DocenteRequest {
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  centroAcademicoId: number;
  login?: string | null;
  senha?: string | null;
}

// ----------------------------- Discente -----------------------------
export interface Discente extends ComStatus {
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  cursoId: number;
  cursoSigla: string;
  cursoDescricao: string;
  login: string | null;
}

export interface DiscenteRequest {
  matricula: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  cursoId: number;
  login?: string | null;
  senha?: string | null;
}

// ---------------------------- Disciplina ----------------------------
export interface Disciplina extends ComStatus {
  sigla: string;
  descricao: string;
  cursoId: number;
  cursoSigla: string;
  cargaHoraria: number;
  docenteId: number;
  docenteNome: string;
}

export interface DisciplinaRequest {
  sigla: string;
  descricao: string;
  cursoId: number;
  cargaHoraria: number;
  docenteId?: number | null;
}

// ----------------------------- Monitoria -----------------------------
export interface Monitoria extends ComStatus {
  docenteId: number;
  docenteNome: string;
  docenteMatricula: string;
  discenteId: number;
  discenteNome: string;
  discenteMatricula: string;
  discenteCurso: string;
  disciplinaId: number;
  disciplinaSigla: string;
  disciplinaDescricao: string;
  diasSemana: DiaSemana[];
  horarioInicio: string;
  horarioFim: string;
  dataInicio: string;
  dataEncerramento: string;
  semestre: string;
  situacao: SituacaoMonitoria;
  possuiRelatorio: boolean;
}

export interface MonitoriaRequest {
  docenteId?: number | null;
  discenteId: number;
  disciplinaId: number;
  diasSemana: DiaSemana[];
  horarioInicio: string;
  horarioFim: string;
  dataInicio: string;
  dataEncerramento: string;
}

// ------------------------ Relatório da monitoria ------------------------
export interface Frequencia {
  id?: number;
  data: string;
  quantidadeAlunos: number;
  alunos: string | null;
}

export interface RelatorioMonitoria extends ComStatus {
  monitoriaId: number;
  tipo: TipoMonitoria;
  localAtuacao: string;
  ocorrencias: string | null;
  consideracoesFinais: string | null;
  frequencias: Frequencia[];
  dataAtualizacao: string;
  monitoria: Monitoria;
}

export interface RelatorioRequest {
  tipo: TipoMonitoria;
  localAtuacao: string;
  ocorrencias: string | null;
  consideracoesFinais: string | null;
  frequencias: Frequencia[];
}

// ------------------------------ Usuários ------------------------------
export interface Usuario {
  id: number;
  name: string;
  username: string;
  enabled: boolean;
  roles: string[];
  docenteId: number | null;
  docenteMatricula: string | null;
  discenteId: number | null;
  discenteMatricula: string | null;
  dataCadastro: string;
}

export interface UsuarioRequest {
  name: string;
  username: string;
  password?: string | null;
  admin: boolean;
  enabled: boolean;
}

export interface AuditLog {
  id: number;
  dataHora: string;
  username: string | null;
  metodo: string;
  caminho: string;
  status: number;
  ip: string;
  detalhe: string | null;
}
