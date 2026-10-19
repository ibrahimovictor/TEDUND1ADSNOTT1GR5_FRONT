export interface DynamicTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'boolean' | 'number' | 'date' | 'datetime';
  /** Formatação customizada do valor exibido (ex.: rótulos de enums). */
  format?: (value: any, row: any) => string;
}
