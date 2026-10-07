import {Component, inject, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {TabelaProgramas} from './components';

@Component({
  selector: 'app-programas',
    imports: [
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatButtonModule,
      TabelaProgramas
    ],
  templateUrl: './programas.html',
  styleUrl: './programas.css'
})
export class Programas {
  filterText = signal<string>('');

  readonly novoProgramaDialog = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }

}
