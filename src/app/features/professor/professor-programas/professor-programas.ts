import { MatIconModule } from '@angular/material/icon';
import { ProgramasTabela } from './components/programas-tabela/programas-tabela';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-professor-programas',
  imports: [
    MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatButtonModule,
      ProgramasTabela

  ],
  templateUrl: './professor-programas.html',
  styleUrl: './professor-programas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessorProgramas {
  filterText = signal<string>('');

  readonly novoProgramaDialog = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }
}
