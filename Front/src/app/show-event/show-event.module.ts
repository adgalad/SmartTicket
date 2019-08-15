import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentEvent } from '../globals';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    CurrentEvent
  ],
  declarations: []
})
export class ShowEventModule { }
