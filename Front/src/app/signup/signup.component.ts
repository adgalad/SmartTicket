import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { md5 } from '../md5';
import { Globals, host } from '../globals';
import { Router } from '@angular/router';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  user = {
    name: "",
    lastname: "",
    email: "",
    email2: "",
    password: "",
    password2: ""
  }

  invalid_email: boolean;
  invalid_pass: boolean;
  invalid_user: any;

  constructor(private http: HttpClient, private router: Router, private globals: Globals) {
    this.invalid_email = false;
    this.invalid_pass = false;
    this.invalid_user = 0;
   }

  ngOnInit() {
    this.invalid_email = false;
    this.invalid_pass = false;
    this.invalid_user = 0;
  }

  onSubmit ( f: NgForm ) {
    if (f.value['email'] != f.value['email2']){
      this.invalid_email = true;
    }
    if (f.value['password'] != f.value['password2']){
      this.invalid_pass = true;
    }
    if ( this.invalid_email == true || this.invalid_pass == true ) {
      return;
    }else{
      this.invalid_email = false;
      this.invalid_pass = false;
      this.invalid_user = 0;
      let e = md5(f.value['password']);
      this.http.post(host + ':8000/User',{
        'operation':'signup',
        'name':f.value['name'],
        'lastname':f.value['lastname'],
        'email':f.value['email'],
        'password':e
      }).subscribe(data => {
          this.globals.setSession(f.value['name'],f.value['email'], 0);
          this.router.navigateByUrl('/');
          window.location.reload();
          this.invalid_user = 1;
         },
        err => {
          console.log(err);
          if (!err.error['success'])
            this.invalid_user = -1;
        }
      );
    }
  }
}
