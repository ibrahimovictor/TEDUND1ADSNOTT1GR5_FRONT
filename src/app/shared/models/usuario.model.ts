import {UserRole} from '../../core';
import {Disciplina} from './disciplina.model';

export interface Usuario {
  id?: number;
  name?: string;
  username?: string;
  role?: UserRole;
}

export class Professor implements Usuario {
  id?: number;
  name?: string;
  username?: string;
  numeroRegistro?: string;
  role?: UserRole = UserRole.PROFESSOR;
  escolaId?: number;
  ativo?: boolean;

  constructor(params: Omit<Professor, 'role'>) {
    Object.assign(this, params);
  }
}

export class Admin implements Usuario {
  id?: number;
  name?: string;
  username?: string;
  role: UserRole = UserRole.ADMIN;

  constructor(params: Omit<Admin, 'role'>) {
    Object.assign(this, params);
  }
}
