import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { InfoBarService } from '../../../shared';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatInputModule, MatIconModule, FormsModule, ReactiveFormsModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private infoBarService: InfoBarService
  ){
    this.loginForm = fb.group({
      usuario: ['', Validators.required],
      senha: ['', Validators.required]
    })
  }

  get usuarioControl(){
    return this.loginForm.get('usuario') as FormControl;
  }

  get senhaControl(){
    return this.loginForm.get('senha') as FormControl;
  }

  onSubmit(){
    if(this.loginForm.valid){
      const { usuario, senha } = this.loginForm.value;
      this.authService.login({ username: usuario, password: senha }).subscribe({
        next: (resp) => {
          console.log('Login successful:', resp);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.infoBarService.show({
            message: err.error?.message || 'Erro ao efetuar login. Verifique suas credenciais e tente novamente.',
            type: 'error',
          });
        }
      });
    }
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
