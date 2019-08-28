import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser/src/browser';
import { Globals, CurrentEvent } from '../globals';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    Globals,
    CurrentEvent
  ],
  declarations: []
})
export class BuyTicketModule { }
