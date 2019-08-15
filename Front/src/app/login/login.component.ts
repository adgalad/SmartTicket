import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Globals, host } from '../globals'
import { md5 } from '../md5';
import {
  AuthService,
  FacebookLoginProvider,
  GoogleLoginProvider,
  LinkedinLoginProvider
} from 'ng4-social-login';
import { TwitterApi } from 'node-twitter-signin';

declare var jquery:any;
declare var $ :any;
declare var http: HttpClient;

@Component({
  selector: 'app-main',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'
             , "../../../node_modules/font-awesome/css/font-awesome.css"
             , "../../../node_modules/materialize-social/materialize-social.css"]
})
export class LoginComponent implements OnInit {

  user = {
    email: "",
    password: ""
  }

  invalid_up: boolean;
  constructor( private http: HttpClient,private globals: Globals
             , private router: Router, private authService: AuthService) {
    this.invalid_up = false;
  }

  ngOnInit() {
    this.globals.setSession("","",0);
    this.globals.setImage("");
  }

  onSubmit ( f: NgForm ) {
    this.invalid_up = false;
    let e = md5(f.value['password']);
    this.http.post(host + ':8000/User',{
        'operation':'login',
        'email':f.value['email'],
        'password':e
      }).subscribe(data => {
          console.log(data);
          this.invalid_up = !data['success'];
          this.globals.setSession(data['name'],f.value['email'],data['balance']);
          this.router.navigateByUrl('/');
          window.location.reload();
        }, err =>{
          this.invalid_up = !err.error['success'];
        }
      );
  }

  registerSocialAccount(_this, user) {
    const splitName = user.name.split(" ")
    _this.http.post(host + ':8000/User',{
                   'operation':'signup',
                   'name':splitName[0],
                   'lastname':splitName[1],
                   'email':user.email,
                   'password':user.id
    }).subscribe(data => {
      _this.invalid_up = true;
      _this.globals.setSession(user.name,user.email,data['balance']);
      _this.globals.setImage(user.photoUrl);
      _this.router.navigateByUrl('/');
      return window.location.reload();
    }, err => { console.log(err); _this.invalid_up = false; })
  }

  signInWithSocial(_this, user) {
    if (!user) return;
    _this.http.post(host + ':8000/User',{
                   'operation':'login',
                   'email':user.email,
                   'password':user.id
    }).subscribe(data => {
          _this.invalid_up = true;
          _this.globals.setSession(user.name,user.email,data['balance']);
          _this.globals.setImage(user.photoUrl);
          _this.router.navigateByUrl('/');
          return window.location.reload();
      }, err =>{ _this.registerSocialAccount(_this, user) }
    );
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe(user => this.signInWithSocial(this, user))
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe(user => this.signInWithSocial(this, user))
  }

}
