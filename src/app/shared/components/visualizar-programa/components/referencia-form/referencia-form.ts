import {Component, Inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {Referencia, TipoAcervo, TipoReferencia} from '../../../../models';
import {InfoBarService, ReferenciaService, ProgramaService} from '../../../../services';
import {UserRole} from '../../../../../core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';

@Component({
  selector: 'app-referencia-form',
  templateUrl: './referencia-form.html',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule
  ],
  styleUrls: ['./referencia-form.css']
})
export class ReferenciaForm implements OnInit, OnDestroy {
  formReferencia!: FormGroup;
  private acervoSub?: Subscription;
  idReferencia = signal<number | null>(null);
  idPrograma = signal<number | null>(null);

  role = signal<UserRole>(UserRole.ADMIN);
  podeEditar = signal<boolean>(false);

  referencia = signal<Referencia | null>(null);

  readonly acervosPossiveis = Object.values(TipoAcervo);
  readonly referenciasPossiveis = Object.values(TipoReferencia);

  constructor(
    private referenciaService: ReferenciaService,
    private programaService: ProgramaService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReferenciaForm>,
    private infoBarService: InfoBarService,
    @Inject(MAT_DIALOG_DATA) public data: { idReferencia: number | null; programaId: number | null }
  ) {
    this.idReferencia.set(data.idReferencia);
    this.idPrograma.set(data.programaId);

    if (this.idReferencia()) {
      this.referenciaService.getReferencia(<number>this.idReferencia()).subscribe((ref) => {
        if (ref) {
          this.referencia.set(ref);
        }
      });
    }
    this.podeEditar.set(true);
  }

  ngOnInit(): void {
    this.formReferencia = this.fb.group({
      id: [this.idReferencia() ?? null],
      titulo: [this.referencia()?.titulo ?? '', Validators.required],
      autores: [this.referencia()?.autores ?? ''],
      edicao: [this.referencia()?.edicao ?? null],
      local: [this.referencia()?.local ?? ''],
      editora: [this.referencia()?.editora ?? ''],
      isbn: [this.referencia()?.isbn ?? ''],
      acervo: [this.referencia()?.acervo ?? null],
      tipoReferencia: [this.referencia()?.tipoReferencia ?? null],
      urlAcesso: [this.referencia()?.urlAcesso ?? ''],
      dataAcesso: [this.referencia()?.dataAcesso ?? null],
      observacoesAlteracao: ['', Validators.required],
    });

    // Inicializa estado dos campos baseado no acervo atual
    this.updateFieldsForAcervo(this.acervoControl.value);

    // Observa mudanças no acervo para habilitar/desabilitar e ajustar validações
    this.acervoSub = this.acervoControl.valueChanges.subscribe((val: TipoAcervo | null | undefined) => {
      this.updateFieldsForAcervo(val);
    });
  }

  ngOnDestroy(): void {
    this.acervoSub?.unsubscribe();
  }

  private updateFieldsForAcervo(val: TipoAcervo | null | undefined): void {
    const urlControl = this.urlAcessoControl;
    const dataControl = this.dataAcessoControl;

    if (val === TipoAcervo.FISICO) {
      // Limpa e desabilita ambos
      urlControl.setValue(null, { emitEvent: false });
      dataControl.setValue(null, { emitEvent: false });

      urlControl.clearValidators();
      dataControl.clearValidators();

      urlControl.disable({ emitEvent: false });
      dataControl.disable({ emitEvent: false });
    } else if (val === TipoAcervo.DIGITAL) {
      // Habilita e torna obrigatórios
      urlControl.enable({ emitEvent: false });
      dataControl.enable({ emitEvent: false });

      urlControl.setValidators([Validators.required]);
      dataControl.setValidators([Validators.required]);
    } else {
      // Caso nulo/outro, manter desabilitado por segurança
      urlControl.setValue(null, { emitEvent: false });
      dataControl.setValue(null, { emitEvent: false });

      urlControl.clearValidators();
      dataControl.clearValidators();

      urlControl.disable({ emitEvent: false });
      dataControl.disable({ emitEvent: false });
    }

    urlControl.updateValueAndValidity({ emitEvent: false });
    dataControl.updateValueAndValidity({ emitEvent: false });
  }

  onSubmit(): void {
    if(!this.podeEditar()){
      this.infoBarService.show({
        message: 'Você não tem permissão para editar esta referência.',
        type: 'warning',
      });
      return;
    }

    if (this.formReferencia.valid) {
      const referencia: Referencia = this.formReferencia.getRawValue();
      referencia.programaId = this.referencia()?.programaId ?? (this.idPrograma() ?? undefined);

      if (this.idReferencia() == null && referencia.programaId != null) {
        // Nova referência
        this.referenciaService.addReferencia(referencia);
      } else {
        // Atualização de referência existente
        this.referenciaService.updateReferencia(referencia);
        // this.programaService.addAtualizacaoPrograma({
        //   id: 0,
        //   idProfessor: 0,
        //   idPrograma: referencia.programaId!,
        //   descricaoAtualizacao: `Alteração na referência: ${referencia.titulo}. Observações: ${this.formReferencia.value.observacoesAlteracao}`,
        //   dataFinalizacao: new Date()
        // });
      }

      this.infoBarService.show({
        message: 'Referência salva com sucesso.',
        type: 'success',
      });

      this.dialogRef.close();
    }
  }

  get idControl(): FormControl { return this.formReferencia.get('id') as FormControl; }
  get tituloControl(): FormControl { return this.formReferencia.get('titulo') as FormControl; }
  get autoresControl(): FormControl { return this.formReferencia.get('autores') as FormControl; }
  get edicaoControl(): FormControl { return this.formReferencia.get('edicao') as FormControl; }
  get localControl(): FormControl { return this.formReferencia.get('local') as FormControl; }
  get editoraControl(): FormControl { return this.formReferencia.get('editora') as FormControl; }
  get isbnControl(): FormControl { return this.formReferencia.get('isbn') as FormControl; }
  get acervoControl(): FormControl { return this.formReferencia.get('acervo') as FormControl; }
  get tipoReferenciaControl(): FormControl { return this.formReferencia.get('tipoReferencia') as FormControl; }
  get urlAcessoControl(): FormControl { return this.formReferencia.get('urlAcesso') as FormControl; }
  get dataAcessoControl(): FormControl { return this.formReferencia.get('dataAcesso') as FormControl; }
  get observacoesAlteracaoControl(): FormControl { return this.formReferencia.get('observacoesAlteracao') as FormControl; }

  protected readonly UserRole = UserRole;
}
