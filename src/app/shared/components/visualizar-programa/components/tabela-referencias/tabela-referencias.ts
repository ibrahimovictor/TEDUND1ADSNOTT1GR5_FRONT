import {Component, effect, inject, input, signal} from '@angular/core';
import {DynamicTable, DynamicTableColumn} from "../../../dynamic-table";
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {Programa, Referencia, TipoReferencia} from '../../../../models';
import {InfoBarService, ProgramaService, ReferenciaService} from '../../../../services';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {UserRole} from '../../../../../core';
import {ReferenciaForm} from '../referencia-form';
import {ConfirmDialogComponent} from '../../../confirm-dialog';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-tabela-referencias',
  imports: [
    DynamicTable,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './tabela-referencias.html',
  styleUrl: './tabela-referencias.css',
})
export class TabelaReferencias {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  role = signal<UserRole>(UserRole.PROFESSOR);

  data = signal<Referencia[]>([]);
  programa = input<Programa | null>(null);
  filter = signal<string>('');

  quantidadeComplementar = signal<number>(0);
  quantidadeBasica = signal<number>(0);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'autores', label: 'Autores', type: 'text' },
    { key: 'editora', label: 'Editora', type: 'text' },
    { key: 'acervo', label: 'Acervo', type: 'text' },
    { key: 'tipoReferencia', label: 'Tipo de Referência', type: 'text' },
  ];

  constructor(
    private infoBarService: InfoBarService,
    private referenciaService: ReferenciaService,
    private programaService: ProgramaService
  ){
    this.authService.ensureRole().pipe(take(1)).subscribe({
      next: (userRole) => {
        this.role.set(userRole!);
      }
    });

    // Recarrega referências ao mudar o programa
    effect(() => {
      const prog = this.programa();
      const id = prog?.id;
      if (id == null) {
        this.data.set([]);
        return;
      }
      this.referenciaService.getReferenciasByPrograma(id).subscribe((refs) => {
          this.data.set(refs)
          this.quantidadeBasica.set(refs.filter(r => r.tipoReferencia == TipoReferencia.BASICA).length);
          this.quantidadeComplementar.set(refs.filter(r => r.tipoReferencia == TipoReferencia.COMPLEMENTAR).length);
        }
      );
    });
  }

  openReferenciaForm(referencia: Referencia): void {
    this.referenciaService.getReferencia(referencia.id!).pipe(take(1)).subscribe((ref) => {
      const dialogRef = this.dialog.open(ReferenciaForm, {
        disableClose: true,
        minWidth: '650px',
        minHeight: '600px',
        data: {
          idReferencia: ref?.id,
        }
      });
    });
  }

  openNovaReferenciaForm(){
    const dialogRef = this.dialog.open(ReferenciaForm, {
      disableClose: true,
      minWidth: '650px',
      minHeight: '600px',
      data: {
        idReferencia: null,
        programaId: this.programa()?.id ?? null
      }
    });
  }

  deletarReferencia(referencia: Referencia): void {
    this.referenciaService.deleteReferencia(referencia.id!);
    // this.programaService.addAtualizacaoPrograma({
    //   id: 0,
    //   idProfessor: 0,
    //   dataFinalizacao: new Date(),
    //   idPrograma: this.programa()!.id!,
    //   descricaoAtualizacao: `Referência de titulo "${referencia.titulo}" excluída.`,
    // });
    this.infoBarService.show({
      message: 'Referência excluída com sucesso.',
      type: 'success',
    });
  }

  openConfirmDeleteDialog(referencia: Referencia){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir esta referência?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletarReferencia(referencia);
      }
    });
  }

  protected readonly UserRole = UserRole;
}
