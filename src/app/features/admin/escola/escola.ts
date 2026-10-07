import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EscolaForm, TabelaEscolas } from './components';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-escola',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, TabelaEscolas],
  templateUrl: './escola.html',
  styleUrl: './escola.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Escola {
  filterText = signal<string>('');

  readonly dialog = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }

  openNovaEscolaDialog() {
    const dialogRef = this.dialog.open(EscolaForm, {
      disableClose: true,
      minWidth: '500px',
      minHeight: '250px',
      data: {},
    });
  }
}
