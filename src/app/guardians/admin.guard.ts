import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';
import { AuthServiceService } from '../service/auth-service.service';


export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const authService = inject(AuthServiceService);

  return authState(auth).pipe(
    take(1),
    map(user => {
      // 1. Verificamos que exista usuario en Firebase
      // 2. Comprobamos que no hayan transcurrido más de 12 horas
      const esValida = authService.sesionEsValida();

      if (user && esValida) {
        return true;
      } else {
        // Si no hay usuario o la sesión expiró, redirigimos al login
        if (user && !esValida) {
          authService.logout();
        } else {
          router.navigate(['/login']);
        }
        return false;
      }
    })
  );
};