import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Globals, host } from '../globals'
import { md5 } from '../md5';

declare var jquery:any;
declare var $ :any;


@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})

export class EventComponent implements OnInit {


  constructor(private http: HttpClient) {
  }

  event: any

  ngOnInit() {
    $('.owl-carousel').owlCarousel({
      loop:true,
      margin:10,
      responsive:{
          0:{
              items:1
          },
          600:{
              items:3
          },
          1000:{
              items:5
          }
      }
    })
    this.getFirst()
  }

  getFirst(){
    this.http.post(host + ":8000/event/getfirst",{})
      .subscribe( data =>{
        if (data['success'])
          this.event = "/MostrarEvento/" + data['message']
        else {
          this.event = "/"
        }
      })
  }
}
