import { Component, OnInit } from '@angular/core';
import { Globals, host } from '../globals';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor( private globals :Globals, private http: HttpClient) { }

  balance: number;

  ngOnInit() {
    this.balance = 0;
    this.http.post(host + ':8000/User',{
      'operation':'show',
      'email': this.getEmail()
    }).subscribe(
      data => {
        console.log(">>>>>>>>", data)
        this.balance = data['balance'] },
      err => { console.log("aaaaaaa", err); }
    );

  }

  getEmail(){
    return this.globals.getSession().email;
  }

  getImage(){
    return this.globals.getImage();
  }

}
