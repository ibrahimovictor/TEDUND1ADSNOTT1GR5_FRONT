import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { roleGuard } from './core/auth/guards/role-guard';
import { UserRole } from './core';
import { roleRedirectGuard } from './core/auth/guards/role-redirect-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./features/side-nav-bar/side-nav-bar').then(m => m.SideNavBar),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [roleRedirectGuard],
        children: []
      },

      // ADMIN
      {
        path: 'admin',
        canMatch: [roleGuard([UserRole.ADMIN])],
        children: [
          {
            path: 'escolas',
            loadComponent: () => import('./features/admin/escola/escola').then(m => m.Escola)
          },
          {
            path: 'escolas/detalhes/:id',
            loadComponent: () => import('./features/admin/escola/components/visualizar-escola/visualizar-escola').then(m => m.VisualizarEscola)
          },
          {
            path: 'disciplinas',
            loadComponent: () => import('./features/admin/disciplinas/disciplinas').then(m => m.Disciplinas),
          },
          {
            path: 'disciplinas/detalhes/:id',
            loadComponent: () => import('./features/admin/disciplinas/components/visualizar-disciplina/visualizar-disciplina').then(m => m.VisualizarDisciplina)
          },
          {
            path: 'matrizes',
            loadComponent: () => import('./features/admin/matrizes/matrizes').then(m => m.Matrizes)
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./features/admin/usuario/usuario').then(m => m.Usuario)
          },
          {
            path: 'professores',
            loadComponent: () => import('./features/admin/professores/professores').then(m => m.Professores)
          },
          {
            path: 'programas',
            loadComponent: () => import('./features/admin/programas/programas').then(m => m.Programas)
          },
          {
            path: 'programas/detalhes/:idPrograma',
            loadComponent: () => import('./shared/components/visualizar-programa/visualizar-programa').then(m => m.VisualizarPrograma)
          },
        ]
      },

      // PROFESSOR
      {
        path: 'professor',
        canMatch: [roleGuard([UserRole.PROFESSOR])],
        children: [
          {
            path: 'disciplinas',
            loadComponent: () => import('./features/professor/disciplinas/disciplinas').then(m => m.Disciplinas)
          },
          {
            path: 'programas',
            loadComponent: () => import('./features/professor/professor-programas/professor-programas').then(m => m.ProfessorProgramas)
          },
        ]
      }
    ]
  }
];
