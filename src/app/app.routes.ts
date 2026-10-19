import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { roleGuard } from './core/auth/guards/role-guard';
import { roleRedirectGuard } from './core/auth/guards/role-redirect-guard';
import { UserRole } from './core';

const ADMIN = [UserRole.ADMIN];
const GESTAO = [UserRole.ADMIN, UserRole.COLABORADOR];
const DISCENTE = [UserRole.USUARIO];

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
      { path: '', pathMatch: 'full', canActivate: [roleRedirectGuard], children: [] },

      // Administrador
      { path: 'ies', canMatch: [roleGuard(ADMIN)], loadComponent: () => import('./features/admin/ies/ies-page').then(m => m.IesPage) },
      { path: 'centros-academicos', canMatch: [roleGuard(ADMIN)], loadComponent: () => import('./features/admin/centros-academicos/centros-academicos').then(m => m.CentrosAcademicos) },
      { path: 'cursos', canMatch: [roleGuard(ADMIN)], loadComponent: () => import('./features/admin/cursos/cursos').then(m => m.Cursos) },
      { path: 'docentes', canMatch: [roleGuard(ADMIN)], loadComponent: () => import('./features/admin/docentes/docentes').then(m => m.Docentes) },
      { path: 'usuarios', canMatch: [roleGuard(ADMIN)], loadComponent: () => import('./features/admin/usuarios/usuarios').then(m => m.Usuarios) },
      { path: 'auditoria', canMatch: [roleGuard(ADMIN)], loadComponent: () => import('./features/admin/auditoria/auditoria').then(m => m.Auditoria) },

      // Colaborador (o administrador também gerencia)
      { path: 'disciplinas', canMatch: [roleGuard(GESTAO)], loadComponent: () => import('./features/colaborador/disciplinas/disciplinas').then(m => m.Disciplinas) },
      { path: 'discentes', canMatch: [roleGuard(GESTAO)], loadComponent: () => import('./features/colaborador/discentes/discentes').then(m => m.Discentes) },
      { path: 'monitorias', canMatch: [roleGuard(GESTAO)], data: { modo: 'gestao' }, loadComponent: () => import('./features/monitorias/monitorias').then(m => m.Monitorias) },
      { path: 'monitorias/:id/relatorio', canMatch: [roleGuard(GESTAO)], data: { modo: 'gestao' }, loadComponent: () => import('./features/monitorias/relatorio-monitoria').then(m => m.RelatorioMonitoriaPage) },
      { path: 'relatorios', canMatch: [roleGuard(GESTAO)], loadComponent: () => import('./features/relatorios/relatorios').then(m => m.Relatorios) },

      // Usuário (discente)
      { path: 'minhas-monitorias', canMatch: [roleGuard(DISCENTE)], data: { modo: 'discente' }, loadComponent: () => import('./features/monitorias/monitorias').then(m => m.Monitorias) },
      { path: 'minhas-monitorias/:id/relatorio', canMatch: [roleGuard(DISCENTE)], data: { modo: 'discente' }, loadComponent: () => import('./features/monitorias/relatorio-monitoria').then(m => m.RelatorioMonitoriaPage) },
    ]
  },
  { path: '**', redirectTo: '' },
];
