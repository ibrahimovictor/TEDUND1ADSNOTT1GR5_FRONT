export interface Programa{
  id?: number;
  disciplinaId: number;
  matrizId: number;
  ementa: string;
  objetivos: string;
  conteudoProgramatico: string[];
  metodologia: string;
  sistemaAvaliacao: string;
  ativo: boolean;
}

export interface AlteracaoPrograma {
  id: number;
  idProfessor: number;
  idPrograma: number;
  descricaoAtualizacao: string;
  dataFinalizacao: Date;
}
