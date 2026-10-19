import { AfterViewInit, Component, ViewChild, effect, input, computed, output, ContentChild, TemplateRef } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DynamicTableColumn } from './dynamic-table.model';
import { dataBr } from '../../labels';

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
  columns = input<DynamicTableColumn[]>([]);
  showActions = input<boolean>(false);
  actionsLabel = input<string>('Ações');
  pageSize = input<number>(10);

  // Template para ações
  @ContentChild('actionsTemplate', { read: TemplateRef }) actionsTemplate!: TemplateRef<any>;

  rowClick = output<any>();

  displayedColumns = computed(() => {
    const cols = this.columns().map(col => col.key);
    if (this.showActions()) {
      cols.push('actions');
    }
    return cols;
  });

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Filtra pelo texto exibido (inclusive valores formatados)
    this.dataSource.filterPredicate = (row, filtro) =>
      this.columns().some(col => this.formatValue(row[col.key], col, row).toLowerCase().includes(filtro));

    effect(() => {
      this.dataSource.data = this.data() ?? [];
    });

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

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  formatValue(value: any, col: DynamicTableColumn, row: any): string {
    if (col.format) {
      return col.format(value, row) ?? '';
    }
    switch (col.type) {
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        return typeof value === 'string' ? dataBr(value) : value ? new Date(value).toLocaleDateString('pt-BR') : '';
      case 'datetime': {
        if (!value) return '';
        const d = new Date(value);
        return isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      }
      case 'number':
        return value === null || value === undefined ? '' : Number(value).toLocaleString('pt-BR');
      default:
        return value === null || value === undefined ? '' : String(value);
    }
  }
}
