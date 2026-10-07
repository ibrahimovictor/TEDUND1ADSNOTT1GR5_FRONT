import { Component, inject, Input, signal } from '@angular/core';
import { ConfirmDialogComponent, DynamicTable, DynamicTableColumn, ProfessorForm } from '../../../../../shared/components';
import {Disciplina, Professor, Usuario} from '../../../../../shared';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {DisciplinaService, InfoBarService} from '../../../../../shared/services';
import {UsuarioService} from '../../services/usuario.service';
import { UserRole } from '../../../../../core';

interface UsuatioTableProps {
  id: number | string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-tabela-usuarios',
  standalone: true,
  imports: [DynamicTable, MatIconModule, MatButtonModule, MatTooltipModule, CommonModule],
  templateUrl: './tabela-usuarios.html',
  styleUrl: './tabela-usuarios.css',
})
export class TabelaUsuarios {
  readonly dialog = inject(MatDialog);
  private data = signal<Usuario[]>([]);
  dadosMontados = signal<UsuatioTableProps[]>([]);

  tableColumns: DynamicTableColumn[] = [
    { key: 'id', label: 'ID', type: 'number' as const },
    { key: 'name', label: 'Nome Completo', type: 'text' as const },
    { key: 'role', label: 'Função', type: 'text' as const },
  ];

  @Input() filter: string = '';

  constructor(private usuarioService: UsuarioService, private infoBarService: InfoBarService) {
    this.carregarUsuarios();
  }

  private carregarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.data.set(usuarios);
        this.montarDadosUsuarios();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      },
    });
  }

  montarDadosUsuarios(): void {
    const dadosMontados: UsuatioTableProps[] = [];
    this.data().forEach((usuario) => {
      dadosMontados.push({
        id: usuario?.id ?? 0,
        name: usuario?.name ?? '',
        role: usuario?.role ? UserRole.ADMIN === usuario.role ? 'Administrador' : 'Professor' : 'Indefinido'
      });
    });
    this.dadosMontados.set(dadosMontados);
  }

  deleteUsuario(usuario: any): void {
    console.log('Excluindo usuário:', usuario);
    this.usuarioService.deleteUsuario(usuario.id).subscribe({
      next: () => {
        this.carregarUsuarios(); // Recarrega após deletar
        this.infoBarService.show({ message: 'Usuário excluído com sucesso.', type: 'success' });
      },
      error: (err) => {
        console.error('Erro ao deletar usuário:', err);
      }
    });
  }

  openEditarDisciplinaDialog(usuario: any): void {
    console.log('Editando usuário:', usuario);
    const dialogRef = this.dialog.open(ProfessorForm, {
      disableClose: true,
      minWidth: '400px',
      minHeight: '500px',
      data: {
        usuario: usuario,
      },
    });
  }

  openConfirmDeleteDialog(usuario: Usuario) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação de Exclusão',
        message: 'Tem certeza que deseja excluir esta usuário?',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteUsuario(usuario);
      }
    });
  }
}
