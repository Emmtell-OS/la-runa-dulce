import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLotsComponent } from './components/admin-lots/admin-lots.component';
import { InterpretacionesComponent } from './components/interpretaciones/interpretaciones.component';
import { ConfigComponent } from './components/configs/config.component';
import { CodiDetailesComponent } from './components/codi-detailes/codi-detailes.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: 'consultas/interpretacion/:codi', component: InterpretacionesComponent  },
  { path: 'consultas/interpretacion/:codi/detailes', component: CodiDetailesComponent  },
  { path: 'admon-lots', component: ConfigComponent },
  { path: '', component: HomeComponent  /*ConfigComponent*/ } //descomentar home antes de liberar
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
