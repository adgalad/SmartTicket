import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CurrentEvent } from '../globals'
import { Globals, host } from '../globals';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-show-event',
  templateUrl: './show-event.component.html',
  styleUrls: ['./show-event.component.css']
})
export class ShowEventComponent implements OnInit {

  constructor(public route: ActivatedRoute,
              public http: HttpClient,
              public currentEvent : CurrentEvent){}

  event: any = {}

  ngOnInit() {

    this.route.params.subscribe( params => {
      return this.http.get(host + ':8000/event?id='+params['id']).subscribe(
        // Successful responses call the first callback.
        data => {
          this.event = data['message']
          this.event['date'] = new Date(data['message']['date'])
          this.event['image'] = JSON.parse(data['message']['image'].replace(/'/g, '"'))
          // this.event['wallpaper'] = JSON.parse(data['message']['wallpaper'].replace(/'/g, '"'))
          this.event['thumbnail'] = JSON.parse(data['message']['thumbnail'].replace(/'/g, '"'))
          console.log(this.event)
          this.currentEvent.setEvent(JSON.stringify(this.event))

         },
        // Errors will call this callback instead:
        err => {
         console.log(err)
        })
      }
    )
  }

}


