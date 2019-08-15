import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Globals, host } from '../globals';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(private http: HttpClient) { }
  event : any
  ngOnInit() {
    $('.carousel.carousel-slider').carousel({
      fullWidth: true,
      duration: 100
    });
    this.getFirst()
    console.log(this.event)
  }
  next() {
    $('.carousel.carousel-slider').carousel('next');
  }
  prev() {
    $('.carousel.carousel-slider').carousel('prev');
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
