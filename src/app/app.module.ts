import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLotsComponent } from './components/admin-lots/admin-lots.component';
import { InterpretacionesComponent } from './components/interpretaciones/interpretaciones.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ReactiveFormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import { DetallesLoteComponent } from './components/detalles-lote/detalles-lote.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatGridListModule} from '@angular/material/grid-list';
import { AdminInterpComponent } from './components/admin-interp/admin-interp.component';
import { ConfigComponent } from './components/config/config.component';
import { GenerateQrComponent } from './components/generate-qr/generate-qr.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLotsComponent,
    InterpretacionesComponent,
    DetallesLoteComponent,
    AdminInterpComponent,
    ConfigComponent,
    GenerateQrComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatCardModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatDialogModule,
    MatDividerModule,
    MatGridListModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
