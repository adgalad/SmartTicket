

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from 'selenium-webdriver/http';
import { Globals, AlwaysAuthGuard, CurrentEvent } from './globals';
import { PanelComponent } from './panel/panel.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { ModifyEventComponent } from './modify-event/modify-event.component';
import { DeleteEventComponent } from './delete-event/delete-event.component';
import { ShowEventComponent } from './show-event/show-event.component';
import { BuyTicketComponent } from './buy-ticket/buy-ticket.component';
import { IndexComponent } from './index/index.component';
import { EventComponent } from './event/event.component';
import { SearchComponent } from './search/search.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketsComponent } from './tickets/tickets.component';
import { AccountComponent } from './account/account.component';
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
} from 'ng4-social-login';

const CONFIG = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('706087426213-24l73364nm9ith4peqt7qg0i3j5g56sj.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('170243416939118')
  },
], true);

export function provideConfig() {
  return CONFIG;
}

const appRoutes: Routes = [
  { path: 'Registrar',
    component: SignupComponent,
    canActivate: [AlwaysAuthGuard]
  },
  { path: 'IniciarSesion',
    component: LoginComponent,
    canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'MostrarEvento/:id',
    component: ShowEventComponent
  },
  // Proteger todos los siguientes (Que esté iniciado y/o sea promotor)
  {
    path: 'Perfil',
    component: ProfileComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'Cuenta',
    component: AccountComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'Tickets',
    component: TicketsComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'Panel',
    component: PanelComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'CrearEvento',
    component: CreateEventComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'ModificarEvento',
    component: ModifyEventComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'EliminarEvento',
    component: DeleteEventComponent,
    //canActivate: [AlwaysAuthGuard]
  },
  {
    path: 'ComprarTicket',
    component: BuyTicketComponent,
    //canActivate: [AlwaysAuthGuard]
  }
]

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    PanelComponent,
    CreateEventComponent,
    ModifyEventComponent,
    DeleteEventComponent,
    ShowEventComponent,
    BuyTicketComponent,
    IndexComponent,
    EventComponent,
    SearchComponent,
    ProfileComponent,
    TicketsComponent,
    AccountComponent
    ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SocialLoginModule
  ],
  providers: [
    Globals,
    AlwaysAuthGuard,
    CurrentEvent,
    { provide: AuthServiceConfig, useFactory: provideConfig }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
