export interface DynamicTableColumn{
    key: string;
    label: string;
    type?: 'text' | 'boolean' | 'number' | 'date';
}