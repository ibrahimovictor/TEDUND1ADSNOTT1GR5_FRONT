export interface Matriz{
  id: number;
  nomeCurso: string;
  turno: 'Matutino' | 'Vespertino' | 'Noturno';
  campus: 'Pituaçu' | 'Camaçari';
  habilitacao: 'Bacharelado' | 'Licenciatura';
  horasAtividadesComplementares: number;
  horasDisciplinasObrigatorias: number;
  horasDisciplinasEletivas: number;
  horasTrabalhoConclusaoCurso: number;
}
