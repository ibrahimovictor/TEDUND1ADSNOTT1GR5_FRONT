import { AfterViewInit, Component, ViewChild, effect, input, computed, output, ContentChild, TemplateRef } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'boolean' | 'number' | 'date';
}

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './dynamic-table.html',
  styleUrl: './dynamic-table.css'
})
export class DynamicTable implements AfterViewInit {
  // Inputs
  data = input<any[]>([]);
  filter = input<string>('');
  columns = input<TableColumn[]>([]);
  showActions = input<boolean>(false);
  actionsLabel = input<string>('Ações');

  // Template para ações
  @ContentChild('actionsTemplate', { read: TemplateRef }) actionsTemplate!: TemplateRef<any>;

  // Outputs para ações customizadas
  rowClick = output<any>();

  // Computed para colunas incluindo ações
  displayedColumns = computed(() => {
    const providedColumns = this.columns();
    let cols: string[] = [];

    if (providedColumns.length > 0) {
      cols = providedColumns.map(col => col.key);
    } else {
      // Gera automaticamente baseado no primeiro objeto
      const firstItem = this.data()[0];
      if (firstItem) {
        cols = Object.keys(firstItem);
      }
    }

    // Adiciona coluna de ações se habilitada
    if (this.showActions()) {
      cols.push('actions');
    }

    return cols;
  });

  // Computed para metadados das colunas
  columnMetadata = computed(() => {
    const providedColumns = this.columns();
    if (providedColumns.length > 0) {
      return providedColumns;
    }

    // Gera metadados automaticamente
    const firstItem = this.data()[0];
    if (firstItem) {
      return Object.keys(firstItem).map(key => ({
        key,
        label: this.formatLabel(key),
        type: this.detectType(firstItem[key])
      }));
    }
    return [];
  });

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Atualiza dados quando o input "data" muda
    effect(() => {
      this.dataSource.data = this.data() ?? [];
    });

    // Aplica filtro quando o input "filter" muda
    effect(() => {
      const value = (this.filter() ?? '').trim().toLowerCase();
      this.dataSource.filter = value;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Método para emitir clique na linha
  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  // Formata o label da coluna
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Detecta o tipo do valor automaticamente
  private detectType(value: any): 'text' | 'boolean' | 'number' | 'date' {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) return 'date';
    return 'text';
  }

  // Formata o valor baseado no tipo
  formatValue(value: any, type: string): string {
    switch (type) {
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        if (value === null || value === undefined || value === '') return '';
        const date = value instanceof Date ? value : new Date(value);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
      case 'number':
        return value?.toLocaleString('pt-BR') || '0';
      default:
        return value?.toString() || '';
    }
  }
}
