import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLotsComponent } from './components/admin-lots/admin-lots.component';
import { InterpretacionesComponent } from './components/interpretaciones/interpretaciones.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
//import { DetallesLoteComponent } from './components/detalles-lote/detalles-lote.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

import { AdminInterpComponent } from './components/admin-interp/admin-interp.component';
import { ConfigComponent } from './components/configs/config.component';
import { GenerateQrComponent } from './components/generate-qr/generate-qr.component';
import { QRCodeModule } from 'angularx-qrcode';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';
import { AdminConfigComponent } from './components/admin-config/admin-config.component';
import { MatTabsModule } from '@angular/material/tabs';
import { QrComponent } from './components/qr/qr.component';
import { QrDotComponent } from './components/qr-dot/qr-dot.component';
import { MatIconModule } from '@angular/material/icon';
import { CodiDetailesComponent } from './components/codi-detailes/codi-detailes.component';
import { HomeComponent } from './components/home/home.component';
import { EliminarComponent } from './components/modals/eliminar/eliminar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReductorPipe } from './pipes/reductor.pipe';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DetallesLoteComponent } from './components/modals/detalles-lote/detalles-lote.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLotsComponent,
    InterpretacionesComponent,
    DetallesLoteComponent,
    AdminInterpComponent,
    ConfigComponent,
    GenerateQrComponent,
    AdminConfigComponent,
    QrComponent,
    QrDotComponent,
    CodiDetailesComponent,
    HomeComponent,
    EliminarComponent,
    ReductorPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    QRCodeModule,
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
    MatGridListModule,
    MatButtonModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule
  ],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}],
  bootstrap: [AppComponent],
})
export class AppModule {}
