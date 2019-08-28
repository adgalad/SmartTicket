import { Component, OnInit } from '@angular/core';
import { Globals } from './globals';
import { Router } from '@angular/router';

import {
  AuthService,
} from 'ng4-social-login';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title = 'app';

  constructor(public authService: AuthService, public globals: Globals, public router: Router){
  }

  ngOnInit(){
      if (localStorage.getItem('name') == "" || localStorage.getItem('name') == undefined || localStorage.getItem('name') == null ) {
        document.getElementById("logout").hidden = true;
        document.getElementById("login").hidden = false;
      }else{
        document.getElementById("logout").hidden = false;
        document.getElementById("login").hidden = true;
      }
  }

  logOut(){
    this.authService.signOut();
    this.globals.setSession("","",0);
    this.globals.setImage("");
    this.router.navigateByUrl('/');
    window.location.reload();

  }

}