import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserRole } from '../../../../../core';
import { Escola, ProfessorService } from '../../../../../shared';
import { EscolaService, InfoBarService, Professor, Usuario } from '../../../../../shared';
import { UsuarioService } from '../../services/usuario.service';


@Component({
  selector: 'app-usuario-form',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  protected readonly UserRole = UserRole;
  possiveisPerfis = [
    { value: UserRole.PROFESSOR, label: 'Professor' },
    { value: UserRole.ADMIN, label: 'Administrador' },
  ];
  possiveisEscolas = signal<Escola[]>([]);

  perfilEscolhido = signal<UserRole>(UserRole.ADMIN);

  usuarioForm!: FormGroup;

  usuario = signal<Usuario | null>(null);
  professor = signal<Professor | null>(null);

  constructor(
    private infoBarService: InfoBarService,
    private usuarioService: UsuarioService,
    private professorService: ProfessorService,
    private fb: FormBuilder,
    private escolaService: EscolaService,
    @Inject(MAT_DIALOG_DATA) public data: { idUsuario: number | null }
  ) {
    this.carregarFormulario();
    this.carregarEscolas();
  }

  carregarFormulario(): void {
    if (this.data.idUsuario) {
      debugger
      this.usuarioService.getUsuario(this.data.idUsuario!).subscribe({
        next: (usuario) => {
          if (usuario)  {
            if (usuario.role === UserRole.PROFESSOR) {
              this.usuarioService.getProfessorPorUsuarioId(usuario.id!).subscribe({
                next: (professor) => {
                  this.professor.set(professor);
                },
              });
            }else {
              this.usuario.set(usuario);
            }
          }
        },
      });
    }

    this.usuarioForm = this.fb.group({
      idUsuario: [this.usuario()?.id || ''],
      nome: [this.usuario()?.name || '', Validators.required],
      usuario: [this.usuario()?.username || '', Validators.required],
      senha: ['', Validators.minLength(6)],
      perfil: [this.usuario()?.role || UserRole.ADMIN, Validators.required],
      idProfessor: [this.professor()?.id || ''],
      numeroRegistro: [
        this.professor()?.numeroRegistro || '',
        { value: '', disabled: this.usuario()?.role !== UserRole.PROFESSOR },
        Validators.required,
      ],
      escola: [
        this.professor()?.escolaId || '',
        { value: '', disabled: this.usuario()?.role !== UserRole.PROFESSOR },
        Validators.required,
      ],
      ativo: [
        this.professor()?.ativo ?? true,
        { value: true, disabled: this.usuario()?.role !== UserRole.PROFESSOR },
      ],
    });

    this.perfilEscolhido.set(this.usuarioForm.value.perfil);
  }

  carregarEscolas(): void {
    this.escolaService.getEscolas().subscribe({
      next: (escolas) => {
        this.possiveisEscolas.set(escolas);
      },
      error: (err) => {
        console.error('Erro ao carregar escolas:', err);
        this.infoBarService.show({ message: 'Erro ao carregar escolas.', type: 'error' });
      }
    });
  }

  onSubmit(): void {}
}
