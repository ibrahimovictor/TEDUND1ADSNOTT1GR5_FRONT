import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/** Datepicker em pt-BR: exibe e interpreta datas digitadas como dd/mm/aaaa. */
@Injectable()
export class DataBrAdapter extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    if (typeof value === 'string') {
      const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const data = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        return data.getMonth() === Number(m[2]) - 1 ? data : this.invalid();
      }
    }
    return super.parse(value, parseFormat);
  }

  override format(date: Date, displayFormat: object): string {
    if (!this.isValid(date)) {
      throw Error('DataBrAdapter: data inválida.');
    }
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    return (displayFormat as any)?.year && !(displayFormat as any)?.day
      ? super.format(date, displayFormat)
      : `${dia}/${mes}/${date.getFullYear()}`;
  }
}
