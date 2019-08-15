import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Globals, host } from '../globals'
declare var jquery:any;
declare var $ :any;


@Component({
  selector: 'app-modify-event',
  templateUrl: './modify-event.component.html',
  styleUrls: ['./modify-event.component.css']
})
export class ModifyEventComponent implements OnInit {

  events = {};

  constructor(private http: HttpClient,
              private globals: Globals) { }

  // Llamada http
  ngOnInit() {
    const session = this.globals.getSession()
    this.http.get(host + ':8000/events?email='+session.email)
      .subscribe(data => {
        this.events = data;
        console.log(data);

      },
      error =>{
        console.log(error)
      })
      $('.modal').modal();
  }

  Modal( int: number) {
    var modal = '#modal' + int;
    $(modal).modal('open');
  }

  UnixToDate( unix_timestamp: number){
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    console.log(unix_timestamp)
    var dt = new Date(unix_timestamp*1);

    return dt.toDateString()+" "+dt.toLocaleTimeString();
  }

}
