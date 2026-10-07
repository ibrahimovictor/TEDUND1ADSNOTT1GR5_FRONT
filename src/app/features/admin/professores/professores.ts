import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProfessorForm } from '../../../shared';
import { MatDialog } from '@angular/material/dialog';
import {TabelaProfessores} from './components';


@Component({
  selector: 'app-professores',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    TabelaProfessores,
],
  templateUrl: './professores.html',
  styleUrl: './professores.css'
})
export class Professores {

  filterText = signal<string>('');

  readonly novoProfessorDialog = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }

  openNovoProfessorDialog() {
      const dialogRef = this.novoProfessorDialog.open(ProfessorForm, {
        disableClose: true,
        minWidth: '400px',
        minHeight: '500px',
      });
  }
}
