import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService, ROLE_LABELS, UserRole } from '../../core';
import { ConfirmDialogComponent } from '../../shared';
import { AlterarSenhaDialog } from './alterar-senha-dialog';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const MENUS: Record<UserRole, NavItem[]> = {
  [UserRole.ADMIN]: [
    { label: 'IES', icon: 'account_balance', route: '/ies' },
    { label: 'Centros\nAcadêmicos', icon: 'apartment', route: '/centros-academicos' },
    { label: 'Cursos', icon: 'school', route: '/cursos' },
    { label: 'Docentes', icon: 'co_present', route: '/docentes' },
    { label: 'Usuários', icon: 'manage_accounts', route: '/usuarios' },
    { label: 'Disciplinas', icon: 'menu_book', route: '/disciplinas' },
    { label: 'Discentes', icon: 'groups', route: '/discentes' },
    { label: 'Monitorias', icon: 'event_note', route: '/monitorias' },
    { label: 'Relatórios', icon: 'picture_as_pdf', route: '/relatorios' },
    { label: 'Auditoria', icon: 'policy', route: '/auditoria' },
  ],
  [UserRole.COLABORADOR]: [
    { label: 'Minhas\nDisciplinas', icon: 'menu_book', route: '/disciplinas' },
    { label: 'Discentes', icon: 'groups', route: '/discentes' },
    { label: 'Monitorias', icon: 'event_note', route: '/monitorias' },
    { label: 'Relatórios', icon: 'picture_as_pdf', route: '/relatorios' },
  ],
  [UserRole.USUARIO]: [
    { label: 'Minhas\nMonitorias', icon: 'assignment_ind', route: '/minhas-monitorias' },
  ],
};

@Component({
  selector: 'app-side-nav-bar',
  imports: [MatSidenavModule, MatListModule, MatIconModule, RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './side-nav-bar.html',
  styleUrl: './side-nav-bar.css'
})
export class SideNavBar {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  navItems = signal<NavItem[]>([]);
  usuario = signal('');
  perfis = signal('');

  constructor() {
    this.authService.me().subscribe((me) => {
      const roles = me?.roles ?? [];
      // Perfis acumulados: une os menus sem repetir rotas
      const itens = new Map<string, NavItem>();
      [UserRole.ADMIN, UserRole.COLABORADOR, UserRole.USUARIO]
        .filter((r) => roles.includes(r))
        .forEach((r) => MENUS[r].forEach((i) => !itens.has(i.route) && itens.set(i.route, i)));
      this.navItems.set([...itens.values()]);
      this.usuario.set(me?.name ?? '');
      this.perfis.set(roles.map((r) => ROLE_LABELS[r].split(' ')[0]).join(' · '));
    });
  }

  alterarSenha(): void {
    this.dialog.open(AlterarSenhaDialog, { width: '420px' });
  }

  openLogoutDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Confirmação de Logout', message: 'Tem certeza que deseja sair?', confirmLabel: 'Sim', cancelLabel: 'Cancelar' }
    }).afterClosed().subscribe((ok) => {
      if (ok) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
