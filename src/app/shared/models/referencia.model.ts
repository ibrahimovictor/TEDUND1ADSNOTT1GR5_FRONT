export interface Referencia {
  id?: number;
  programaId?: number;
  titulo?: string;
  autores?: string;
  edicao?: number;
  local?: string;
  editora?: string;
  isbn?: string;
  acervo?: TipoAcervo;
  tipoReferencia?: TipoReferencia;
  urlAcesso?: string | null;
  dataAcesso?: Date | null;
}

export enum TipoAcervo {
  FISICO = 'FÍSICO',
  DIGITAL = 'DIGITAL',
}

export enum TipoReferencia {
  BASICA = 'BÁSICA',
  COMPLEMENTAR = 'COMPLEMENTAR',
}
