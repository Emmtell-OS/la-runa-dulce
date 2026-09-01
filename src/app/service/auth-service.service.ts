import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signOut,
  user
} from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private auth: Auth = inject(Auth);
  private db: Database = inject(Database);
  private router: Router = inject(Router);

  // Exposición del estado del usuario como Observable para Guards o UI
  user$: Observable<any> = user(this.auth);

  private readonly EXPIRATION_KEY = 'lrd_session_expiration';
  private readonly TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  private actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true
  };

  /**
   * Lee los correos autorizados desde RDB
   */
  async obtenerCorreosAutorizados(): Promise<string[]> {
    const snapshot = await get(ref(this.db, 'auth/mails'));
    return snapshot.exists() ? (snapshot.val() as string[]) : [];
  }

  /**
   * Envía el Magic Link a la lista de correos registrada
   */
  async enviarMagicLinkALista(): Promise<void> {
    const correos = await this.obtenerCorreosAutorizados();

    if (!correos || correos.length === 0) {
      throw new Error('No hay correos autorizados en la base de datos.');
    }

    const envios = correos.map(email => 
      sendSignInLinkToEmail(this.auth, email, this.actionCodeSettings)
    );

    await Promise.all(envios);
  }

  esEnlaceMagico(url: string): boolean {
    return isSignInWithEmailLink(this.auth, url);
  }

  /**
   * Confirma la sesión y registra la estampa de tiempo para expirar a las 12h
   */
  async confirmarInicioSesion(url: string, emailConfirmado: string): Promise<any> {
    if (this.esEnlaceMagico(url)) {
      const userCredential = await signInWithEmailLink(this.auth, emailConfirmado, url);
      
      // Guardar hora actual + 12 horas en milisegundos
      const fechaExpiracion = Date.now() + this.TWELVE_HOURS_MS;
      localStorage.setItem(this.EXPIRATION_KEY, fechaExpiracion.toString());

      return userCredential;
    }
  }

  /**
   * Evalúa si la sesión almacenada sigue dentro de la ventana de 12 horas
   */
  sesionEsValida(): boolean {
    const expiration = localStorage.getItem(this.EXPIRATION_KEY);
    
    if (!expiration) {
      return false;
    }

    const fechaExpiracion = parseInt(expiration, 10);
    const ahora = Date.now();

    if (ahora > fechaExpiracion) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Cierra sesión en Firebase, elimina la clave del almacenamiento local y redirige
   */
  async logout(): Promise<void> {
    localStorage.removeItem(this.EXPIRATION_KEY);
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

}