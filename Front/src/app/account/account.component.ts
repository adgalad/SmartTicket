import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Globals, host } from '../globals';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { md5 } from '../md5';
declare var jquery:any;
declare var $ :any;


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  user = {
    name: "",
    lastname: "",
    password: "",
    password2: ""
  }

  constructor(private http: HttpClient,private globals: Globals, private router: Router) { }

  // Realizar petición para llenar los campos
  ngOnInit() {

  }
  // Realizar petición para actualizar los datos
  Update( f: NgForm ){
    var a,b : String;
    console.log(f.value);
    let e = md5(f.value['password']);
    if ( f.value['password'] != f.value['password2']){
      alert("Las contraseñas tienen que ser iguales");
      return;
    }
    var email = this.globals.getSession();
    var json = {
      "operation":"update",
      "password": e,
      "email": email['email'],
      "name":f.value['name'],
      "lastname":f.value['lastname']
    };
    console.log(json);
    this.http.post(host + ':8000/User', json).subscribe(data => {
      alert("Datos cambiados correctamente, los cambios se va a reflejar en el siguiente inicio de sesión");
      console.log("Entre!");
     },
      err => { console.log(err);}
    );
  }
}
