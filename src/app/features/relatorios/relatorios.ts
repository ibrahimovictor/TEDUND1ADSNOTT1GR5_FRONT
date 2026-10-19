import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService, UserRole } from '../../core';
import { InfoBarService, PdfService } from '../../shared';

/** RF 5 e 9 — Relatórios completos em PDF, com a identificação de quem os emitiu. */
@Component({
  selector: 'app-relatorios',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  template: `
    <div class="pagina">
      <div class="pagina-header">
        <h1>Relatórios</h1>
        <p class="subtitulo">Os relatórios são gerados em PDF e identificam o usuário responsável pela emissão.</p>
      </div>
      <div class="cartoes">
        @if (admin()) {
          <div class="cartao">
            <h3>Estrutura acadêmica</h3>
            <p>Todas as IES (com reitor e pró-reitorias), os Centros Acadêmicos e os Cursos com as respectivas vinculações.</p>
            <button matButton="filled" [disabled]="gerando()" (click)="baixar('relatorios/estrutura-academica', 'relatorio-estrutura-academica.pdf')">
              <mat-icon>picture_as_pdf</mat-icon> Emitir
            </button>
          </div>
          <div class="cartao">
            <h3>Cadastro docente</h3>
            <p>Docentes com a vinculação ao Centro Acadêmico, separando ativos e inativos.</p>
            <mat-form-field subscriptSizing="dynamic">
              <mat-label>Docentes</mat-label>
              <mat-select [value]="statusDocentes()" (selectionChange)="statusDocentes.set($event.value)">
                <mat-option value="">Ativos e inativos (separados)</mat-option>
                <mat-option value="ATIVO">Somente ativos</mat-option>
                <mat-option value="INATIVO">Somente inativos</mat-option>
              </mat-select>
            </mat-form-field>
            <button matButton="filled" [disabled]="gerando()" (click)="baixarDocentes()">
              <mat-icon>picture_as_pdf</mat-icon> Emitir
            </button>
          </div>
        }
        @if (admin() || colaborador()) {
          <div class="cartao">
            <h3>{{ admin() ? 'Monitorias (todas)' : 'Minhas monitorias' }}</h3>
            <p>Monitorias ativas em curso, monitorias finalizadas com os respectivos semestres e os relatórios das monitorias.</p>
            <button matButton="filled" [disabled]="gerando()" (click)="baixar('relatorios/monitorias', 'relatorio-monitorias.pdf')">
              <mat-icon>picture_as_pdf</mat-icon> Emitir
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class Relatorios {
  private pdf = inject(PdfService);
  private infoBar = inject(InfoBarService);
  admin = signal(false);
  colaborador = signal(false);
  gerando = signal(false);
  statusDocentes = signal('');

  constructor() {
    inject(AuthService).ensureRoles().subscribe((roles) => {
      this.admin.set(roles.includes(UserRole.ADMIN));
      this.colaborador.set(roles.includes(UserRole.COLABORADOR));
    });
  }

  baixarDocentes(): void {
    const status = this.statusDocentes();
    this.baixar('relatorios/docentes', `relatorio-docentes${status ? '-' + status.toLowerCase() : ''}.pdf`,
      status ? { status } : undefined);
  }

  baixar(caminho: string, arquivo: string, params?: Record<string, string>): void {
    this.gerando.set(true);
    this.pdf.baixar(caminho, arquivo, params).subscribe({
      next: () => this.gerando.set(false),
      error: (err) => {
        this.gerando.set(false);
        this.infoBar.error(err, 'Erro ao emitir o relatório.');
      },
    });
  }
}
