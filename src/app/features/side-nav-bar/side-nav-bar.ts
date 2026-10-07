import { Component, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { UserRole } from '../../core';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../core/auth/services/auth.service';
import { ConfirmDialogComponent } from '../../shared';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-side-nav-bar',
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage
  ],
  templateUrl: './side-nav-bar.html',
  styleUrl: './side-nav-bar.css'
})
export class SideNavBar {
  private currentUserRole = signal<UserRole>(UserRole.PROFESSOR);
  readonly dialog = inject(MatDialog);

  authService = inject(AuthService);
  private adminNavItems = [
    { label: 'Escolas', icon: 'school', route: '/admin/escolas' },
    { label: 'Disciplinas', icon: 'book', route: '/admin/disciplinas' },
    { label: 'Usuários', icon: 'person', route: '/admin/usuarios' },
    { label: 'Professores', icon: 'people', route: '/admin/professores' },
    { label: 'Matrizes', icon: 'grid_view', route: '/admin/matrizes' },
    { label: 'Programas', icon: 'description', route: '/admin/programas' }
  ];

  private professorNavItems = [
    { label: 'Minhas\nDisciplinas', icon: 'school', route: '/professor/disciplinas' },
    { label: 'Programas', icon: 'description', route: '/professor/programas' },
  ];

  constructor(
    private router: Router
  ) {
    const role = this.authService.ensureRole().subscribe({
      next: (userRole) => {
        this.currentUserRole.set(userRole!);
      }
    });
  }

  get navItems(){
    return this.currentUserRole() === UserRole.ADMIN ? this.adminNavItems : this.professorNavItems;
  }

  logout(){
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  openLogoutDialog(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
                title: 'Confirmação de Logout',
                message: 'Tem certeza que deseja efetuar logout?',
            confirmLabel: 'Sim',
            cancelLabel: 'Cancelar'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.logout();
          }
        });
      }
  }

