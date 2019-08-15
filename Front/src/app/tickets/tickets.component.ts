import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Globals, host } from '../globals';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  Session = this.globals.getSession();

  data: any;


  constructor(private http: HttpClient, private globals: Globals) { }

  ngOnInit() {
    this.http.post(host + ':8000/tickets',{"email": this.Session.email})
      .subscribe(
        resp => {
          this.data = resp;
          console.log(resp)
          // Filtrar los tickets viejos (Los que se compraron para probar la aplicación)
          $(document).ready(function(){
            $('.modal').modal();
          });

          // Buscar el nombre de cada ticket
          for (var i = 0; i < this.data.length; i++) {
            this.noOlvidar(i);
          }
        },
        error => {console.log(error);}
      )

  }

  // Romper la promesa
  noOlvidar(i){
    this.http.get(host + ':8000/event/name?id='+this.data[i]['eventID'])
      .subscribe(
        res => {
          if (res["success"] !== undefined && res["success"]){
            this.data[i]['name'] = res["name"];
            this.data[i]['delegate'] = res["delegate"];
            this.data[i]['canReturn'] = res["canReturn"];
            this.data[i]['resell'] = res["resell"];
          }

        },
        error => {
          console.log(error);
        }
      )
  }

  canReturn(id){
    this.http.post(host + ':8000/event/returnTicket',{ "ticket":id, "owner":this.globals.getSession().email})
    .subscribe(
      res => {
        document.getElementById(id).hidden = true;
      },
      error => {
        console.log(error)
      }
    )
  }

  canResell(id){
    var price = $('#resell_input' +id).val();
    this.http.post(host + ':8000/event/setTicketResell',{"price":price,"ticket":id,"owner":this.globals.getSession().email})
    .subscribe(
      res => {
        console.log(res);
        return window.location.reload();
      },
      error => {
        console.log(error);
      }
    )
  }

  cancelResell(id){
    var price = $('#resell_input' +id).val();
    this.http.post(host + ':8000/event/cancelTicketResell',{"ticket":id})
    .subscribe(
      res => {
        console.log(res);
        return window.location.reload();
      },
      error => {
        console.log(error);
      }
    )
  }
  input(id){
    if ( $('#'+id).val())
      return $('#'+id).val()
    return 0
  }
  total(id){
    return parseInt(this.input(id))*1.05
  }
}



// curl -d "email=carlos.25896@gmail.com&password=jamon&name=Carlos&admin=true" -X POST http://localhost:3000/eventPromoter



