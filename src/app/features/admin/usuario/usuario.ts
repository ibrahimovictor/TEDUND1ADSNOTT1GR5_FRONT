import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {TabelaUsuarios} from './components';
import { UsuarioForm } from './components/usuario-form';


@Component({
  selector: 'app-usuario',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    TabelaUsuarios
  ],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css'
})
export class Usuario {
  filterText = signal<string>('');

  readonly dialog = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }

  openNovoUsuarioDialog(){
    const dialogRef = this.dialog.open(UsuarioForm, {
      disableClose: true,
      minWidth: '650px',
      minHeight: '600px',
      data: {
        idUsuario: null,
        idProfessor: null
      }
    });
  }
}
