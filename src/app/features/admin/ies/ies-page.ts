import { Component, inject } from '@angular/core';
import { COLUNA_CADASTRO, COLUNA_STATUS, CadastroBase, DynamicTableColumn, Ies, IesService, PaginaCadastro } from '../../../shared';
import { IesForm } from './ies-form';

@Component({
  selector: 'app-ies-page',
  imports: [PaginaCadastro],
  template: `
    <app-pagina-cadastro titulo="Instituições de Ensino Superior"
      subtitulo="Cadastro das IES, com reitor(a) e pró-reitorias. IES com histórico vinculado só podem ser inativadas."
      [dados]="dados()" [colunas]="colunas"
      (novo)="novo()" (editar)="editar($event)" (alterarStatus)="alterarStatus($event)"
      (historico)="historico($event)" (excluir)="excluir($event)">
    </app-pagina-cadastro>
  `,
})
export class IesPage extends CadastroBase<Ies> {
  protected readonly service = inject(IesService);
  protected readonly tipo = 'IES' as const;
  protected readonly formulario = IesForm;

  colunas: DynamicTableColumn[] = [
    { key: 'sigla', label: 'Sigla' },
    { key: 'nome', label: 'Nome' },
    { key: 'emailCentral', label: 'E-mail central' },
    { key: 'telefoneCentral', label: 'Telefone' },
    { key: 'reitorNome', label: 'Reitor(a)' },
    { key: 'proReitorias', label: 'Pró-reitorias', format: (v: any[]) => String(v?.length ?? 0) },
    COLUNA_CADASTRO,
    COLUNA_STATUS,
  ];

  constructor() {
    super();
    this.carregar();
  }

  protected descrever(item: Ies): string {
    return `a IES ${item.sigla}`;
  }
}
