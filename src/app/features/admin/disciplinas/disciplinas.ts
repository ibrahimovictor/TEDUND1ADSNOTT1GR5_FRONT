import {Component, inject, signal, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TabelaDisciplinas} from './components';
import {DisciplinaForm} from './components';

@Component({
  selector: 'app-disciplinas',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    TabelaDisciplinas
  ],
  templateUrl: './disciplinas.html',
  styleUrl: './disciplinas.css'
})
export class Disciplinas {

  filterText = signal<string>('');
  @ViewChild(TabelaDisciplinas) tabelaDisciplinas!: TabelaDisciplinas;

  readonly novaDisciplinaDialog = inject(MatDialog);

  constructor() {}

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterText.set(value);
  }

  openNovaDisciplinaDialog(){
    const dialogRef = this.novaDisciplinaDialog.open(DisciplinaForm, {
      disableClose: true,
      minWidth: '450px',
      minHeight: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Recarrega a tabela após fechar o dialog (independente se salvou ou cancelou)
      if (this.tabelaDisciplinas) {
        this.tabelaDisciplinas.carregarDisciplinas();
      }
    });
  }
}
