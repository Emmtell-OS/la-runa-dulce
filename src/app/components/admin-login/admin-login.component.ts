import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {

  mensaje: string = '';
  cargando: boolean = false;

  private authService = inject(AuthServiceService);
  private router = inject(Router);

  ngOnInit(): void {
    this.verificarEnlace();
  }

  async solicitarAcceso(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      await this.authService.enviarMagicLinkALista();
      this.mensaje = '¡Proceso de acceso iniciado, puedes continuar!';
    } catch (error) {
      this.mensaje = 'Error al iniciar el acceso.';
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  private async verificarEnlace(): Promise<void> {
    const currentUrl = this.router.url;
    
    if (this.authService.esEnlaceMagico(currentUrl)) {
      this.cargando = true;
      try {
        const email = window.prompt('Ingresa el mail autorizado para ingresar:');
        if (email) {
          await this.authService.confirmarInicioSesion(currentUrl, email);
          this.router.navigate(['/admin-lots']);
        }
      } catch (error) {
        this.mensaje = 'El enlace no es válido o ha expirado.';
      } finally {
        this.cargando = false;
      }
    }
  }

}
