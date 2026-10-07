import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Professor } from '../../models';
import { ProfessorService } from '../../services';
import { InfoBarService } from '../../services';

@Component({
  selector: 'app-novo-professor-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogClose,
    MatCheckboxModule,
],
  templateUrl: './professor-form.html',
  styleUrl: './professor-form.css'
})
export class ProfessorForm {


  formProfessor!: FormGroup;
  professor = signal<Professor | null>(null);

  constructor(
    private professorService: ProfessorService,
    private infoBarService: InfoBarService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProfessorForm>,
    @Inject(MAT_DIALOG_DATA) public data: { professor: Professor }
  ){
    this.formProfessor = fb.group({
      id: [''],
      nome: ['', Validators.required],
      escola: ['', Validators.required],
      login: ['', Validators.required],
      senha: ['', Validators.required]
    });

    // Preencher o formulário com os dados do professor, se disponíveis
    if (data && data.professor) {
      this.professor.set(data.professor);

      this.professorService.getProfessor(<number>data.professor.id).subscribe(prof => {
        if (prof) {
          this.formProfessor.patchValue({
            id: prof.id,
            nome: prof.name,
            escola: prof.escolaId,
          });
        }
      });
    }
  }


  onSubmit() {
    if (this.formProfessor.valid) {
      // Handle form submission
      const formData = this.formProfessor.value;
      console.log('Form submitted:', formData);
      const professor = {
        id: formData.id,
        nome: formData.nome,
        escola: formData.escola,
        ativo: formData.ativo
      } as Professor;

      if (this.professor() != null && this.professor()?.id) {
        this.professorService.updateProfessor(professor);
      } else {
        this.professorService.addProfessor(professor);
      }

      this.infoBarService.show({
        message: "Dados do Professor salvos com sucesso!",
        type: "success"
      });

      this.dialogRef.close(formData);
    } else {
      console.log('Form is invalid');
    }
  }

  get idControl(){
    return this.formProfessor.get('id') as FormControl;
  }

  get nomeControl(){
    return this.formProfessor.get('nome') as FormControl;
  }

  get escolaControl(){
    return this.formProfessor.get('escola') as FormControl;
  }

  get loginControl(){
    return this.formProfessor.get('login') as FormControl;
  }

  get senhaControl(){
    return this.formProfessor.get('senha') as FormControl;
  }
}
