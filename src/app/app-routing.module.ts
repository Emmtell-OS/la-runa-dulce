import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLotsComponent } from './components/admin-lots/admin-lots.component';
import { InterpretacionesComponent } from './components/interpretaciones/interpretaciones.component';
import { ConfigComponent } from './components/configs/config.component';

const routes: Routes = [
  { path: 'consultas/interpretacion/:codi', component: InterpretacionesComponent  },
  { path: 'admon-lots', component: ConfigComponent },
  { path: '', component: ConfigComponent } //eliminar al terminar el modulo admon
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
