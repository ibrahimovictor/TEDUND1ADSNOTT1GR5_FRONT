import {Component, effect, input, signal} from '@angular/core';
import {DynamicTable, DynamicTableColumn} from '../../../dynamic-table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {AlteracaoPrograma} from '../../../../models';
import {MatInputModule} from '@angular/material/input';
import {ProfessorService, ProgramaService} from '../../../../services';


interface TabelaAlteracaoProgramaProps{
  id: number;
  dataAlteracao: Date;
  usuario: string;
  descricaoAlteracao: string;
}

@Component({
  selector: 'app-historico-alteracoes',
  imports: [
    DynamicTable,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './historico-alteracoes.html',
  styleUrl: './historico-alteracoes.css'
})
export class HistoricoAlteracoes {
  idPrgrama = input<number | null>(null);
  private data = signal<AlteracaoPrograma[]>([]);
  alteracoesProgramaDataMontado = signal<TabelaAlteracaoProgramaProps[]>([]);
  filter = signal<string>('');


  tableColumns: DynamicTableColumn[] = [
    {key: 'id', label: 'ID', type: 'number' as const},
    {key: 'dataAlteracao', label: 'Data da Alteração', type: 'date' as const},
    {key: 'usuario', label: 'Usuário', type: 'text' as const},
    {key: 'descricaoAlteracao', label: 'Descrição da Alteração', type: 'text' as const}
  ];

  constructor(
    private programaService: ProgramaService,
    private professorService: ProfessorService,
  ) {
    effect(() => {
      if (this.idPrgrama()) {
        this.carregarAlteracoesPrograma(this.idPrgrama()!);
        this.montarDadosAlteracoesPrograma();
      } else {
        this.data.set([]);
        this.alteracoesProgramaDataMontado.set([]);
      }
    });
  }

  carregarAlteracoesPrograma(idPrograma: number): void {
    // this.programaService.getAlteracoesPrograma(idPrograma).subscribe({
    //   next: (alteracoesPrograma) => {
    //     this.data.set(alteracoesPrograma);
    //     this.montarDadosAlteracoesPrograma();
    //   },
    //   error: (err) => {
    //     console.error('Erro ao carregar alterações do programa:', err);
    //     this.data.set([]);
    //     this.alteracoesProgramaDataMontado.set([]);
    //   }
    // });
  }

  montarDadosAlteracoesPrograma(): void {
    const dadosMontados: TabelaAlteracaoProgramaProps[] = [];
    this.alteracoesProgramaDataMontado.set([]);
    this.data().forEach(alteracaoPrograma => {
      this.professorService.getProfessor(alteracaoPrograma.idProfessor).subscribe({
        next: (professor) => {
          dadosMontados.push({
            id: alteracaoPrograma.id,
            dataAlteracao: alteracaoPrograma.dataFinalizacao,
            usuario: professor ? professor.name ?? 'Desconhecido' : 'Desconhecido',
            descricaoAlteracao: alteracaoPrograma.descricaoAtualizacao
          });
          this.alteracoesProgramaDataMontado.set(dadosMontados);
        },
        error: (err) => {
          console.error('Erro ao carregar matriz:', err);
          this.alteracoesProgramaDataMontado.set([]);
        }
      });
    });
  }
}
