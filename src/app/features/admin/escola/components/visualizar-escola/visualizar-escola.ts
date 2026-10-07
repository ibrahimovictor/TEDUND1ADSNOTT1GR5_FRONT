import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent, Curso, DynamicTable, DynamicTableColumn, Escola, EscolaService, InfoBarService } from '../../../../../shared';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CursoForm } from './components/curso-form';

@Component({
  selector: 'app-visualizar-escola',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DynamicTable,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './visualizar-escola.html',
  styleUrl: './visualizar-escola.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizarEscola {
  escolaForm!: FormGroup;
  escola = signal<Escola | null>(null);

  readonly dialog = inject(MatDialog);
  data = signal<Curso[]>([]);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' as const },
    { key: 'nome', label: 'Nome', type: 'text' as const },
  ];

  @Input() filter: string = '';

  constructor(
    private fb: FormBuilder,
    private escolaService: EscolaService,
    private route: ActivatedRoute,
    private router: Router,
    private infoBarService: InfoBarService
  ) {
    this.escolaForm = this.fb.group({
      id: ['', Validators.required],
      nome: ['', Validators.required],
    });

    const escolaId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarEscola(escolaId);
  }

  carregarEscola(id: number): void {
    this.escolaService.getEscola(id).subscribe({
      next: (escola) => {
        console.log('Escola carregada:', escola);
        this.escola.set(escola);
        this.escolaForm.patchValue({
          id: escola.id,
          nome: escola.nome,
        });
        this.carregarCursos();
      },
      error: (err) => {
        console.error('Erro ao carregar escola:', err);
        this.infoBarService.show({ message: 'Erro ao carregar escola.', type: 'error' });
        this.escola.set(null);
        this.router.navigate(['/admin/escolas']);
      },
    });
  }

  carregarCursos(): void {
    this.escolaService.getCursosByEscola(this.escolaForm.value.id).subscribe({
      next: (cursos) => {
        this.data.set(cursos);
      },
      error: (err) => {
        console.error('Erro ao carregar cursos da escola:', err);
        this.infoBarService.show({ message: 'Erro ao carregar cursos da escola.', type: 'error' });
      },
    });
  }

  onSubmit(): void {
    if (this.escolaForm.valid) {
      const escolaData: Escola = {
        id: this.escola()?.id,
        nome: this.escolaForm.value.nome,
      };
      this.escolaService.updateEscola(escolaData).subscribe({
        next: (response) => {
          this.infoBarService.show({ message: 'Escola atualizada com sucesso.', type: 'success' });
          this.router.navigate(['/admin/escolas/detalhes', response.id]);
        },
        error: (error) => {
          this.infoBarService.show({ message: 'Erro ao salvar dados da escola.', type: 'error' });
          console.error('Erro ao adicionar escola:', error);
        },
      });
    }
  }

  deletarEscola(idEscola: number): void {
    this.escolaService.deleteEscola(idEscola).subscribe({
      next: () => {
        this.infoBarService.show({ message: 'Escola excluída com sucesso.', type: 'success' });
        this.router.navigate(['/admin/escolas']);
      },
      error: (err) => {
        console.error('Erro ao deletar escola:', err);
      },
    });
  }

  openConfirmDeleteDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir esta escola?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deletarEscola(this.escola()?.id!);
      }
    });
  }

  openCursoFormDialog(curso: Curso) {
    const dialogRef = this.dialog.open(CursoForm, {
      disableClose: true,
      minWidth: '500px',
      minHeight: '250px',
      data: { idCurso: curso.id, idEscola: this.escola()?.id },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.carregarCursos();
    });
  }

  openNovoCursoDialog() {
    const dialogRef = this.dialog.open(CursoForm, {
      disableClose: true,
      minWidth: '500px',
      minHeight: '250px',
      data: { idCurso: null, idEscola: this.escola()?.id },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.carregarCursos();
    });
  }
}

