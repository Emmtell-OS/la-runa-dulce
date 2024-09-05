import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
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
import { DetallesLoteComponent } from './components/detalles-lote/detalles-lote.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AdminInterpComponent } from './components/admin-interp/admin-interp.component';
import { ConfigComponent } from './components/config/config.component';
import { GenerateQrComponent } from './components/generate-qr/generate-qr.component';
import { QRCodeModule } from 'angularx-qrcode';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [
    AppComponent,
    AdminLotsComponent,
    InterpretacionesComponent,
    DetallesLoteComponent,
    AdminInterpComponent,
    ConfigComponent,
    GenerateQrComponent,
  ],
  imports: [
    BrowserModule,
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
    MatCheckboxModule,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/la-runa-dulce' },
    provideClientHydration(),
    provideAnimationsAsync(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'la-runa-dulce',
        appId: '1:1055313754780:web:83bcc851b3823347ec8b59',
        storageBucket: 'la-runa-dulce.appspot.com',
        apiKey: 'AIzaSyDgs2akf2FgZ_mA_XUUPKvWg2MD_LAl3LY',
        authDomain: 'la-runa-dulce.firebaseapp.com',
        messagingSenderId: '1055313754780',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
