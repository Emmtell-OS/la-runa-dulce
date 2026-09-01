import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InterpretacionesComponent } from './components/interpretaciones/interpretaciones.component';
import { ConfigComponent } from './components/configs/config.component';
import { CodiDetailesComponent } from './components/codi-detailes/codi-detailes.component';
import { HomeComponent } from './components/home/home.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { adminGuard } from './guardians/admin.guard';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { path: 'consultas/:codi', component: InterpretacionesComponent  },
  { path: 'consultas/:codi/detailes', component: CodiDetailesComponent, canActivate: [adminGuard]  },
  { path: 'admon-lots', component: ConfigComponent, canActivate: [adminGuard] },
  { path: 'admin-lots', component: ConfigComponent, canActivate: [adminGuard] },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
