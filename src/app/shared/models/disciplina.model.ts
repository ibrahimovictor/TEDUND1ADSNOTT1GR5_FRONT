export interface Disciplina {
  id: number;
  sigla: string;
  descricao: string;
  cargaHoraria: number;
  tipo: string;
  classificacao: string;
  ativa: boolean;
  matrizIds: number[];
  prerequisitoIds: number[];
}

export enum TipoDisciplina {
  EAD = 'EAD',
  Presencial = 'Presencial'
}

export enum ClassificacaoDisciplina {
  Teorica = 'Teórica',
  Pratica = 'Prática',
  Estagio = 'Estágio'
}
