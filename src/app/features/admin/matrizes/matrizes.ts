import {Component, inject, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ProfessorForm} from '../../../shared';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TabelaMatrizes} from './components';
import { MatrizesForrm } from './components/matrizes-forrm/matrizes-forrm';

@Component({
  selector: 'app-matrizes',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, TabelaMatrizes],
  templateUrl: './matrizes.html',
  styleUrl: './matrizes.css',
})
export class Matrizes {
  filterText = signal<string>('');

  readonly novoDialogMatriz = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }

  openNovaMatrizDialog() {
    const dialogRef = this.novoDialogMatriz.open(MatrizesForrm, {
      disableClose: true,
      minWidth: '400px',
      minHeight: '500px',
      data: {

      },
    });
  }
}
