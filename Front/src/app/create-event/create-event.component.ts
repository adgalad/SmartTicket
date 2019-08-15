import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Router } from '@angular/router';
import { Globals, host } from '../globals';

declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {
  form: FormGroup;
  event = {};

  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private router: Router,
              private globals: Globals) {
    this.event = {
      name: '',
      place: '',
      description: '',
      date: '',
      type: 0,
      delegate: false,
      resell: false,
      canReturn: false,
      image: {type:"1",value:"123"},
      wallpaper: {filetype:"1",value:"123"},
      thumbnail: {filetype:"1",value:"123"}
    }
    this.form = this.fb.group(this.event)
  }

  ngOnInit() {
    $('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year,
      today: 'Today',
      clear: 'Clear',
      close: 'Ok',
      closeOnSelect: false // Close upon selecting a date,
    });



    $('.timepicker').pickatime({
      default: 'now', // Set default time: 'now', '1:30AM', '16:30'
      fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
      twelvehour: false, // Use AM/PM or 24-hour format
      donetext: 'OK', // text for done-button
      cleartext: 'Clear', // text for clear-button
      canceltext: 'Cancel', // Text for cancel-button
      autoclose: false, // automatic close timepicker
      ampmclickable: true, // make AM PM clickable
      aftershow: function(){} //Function for after opening timepicker
    });
  }

  onFileChange(name, event) {
    console.log("Entro!")
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.get(name).setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result.split(',')[1]
        })
      };
    }
  }

  clearFile(name) {
    this.form.get(name).setValue(null);
    this.fileInput.nativeElement.value = '';
  }

  loadFields(){
    this.event = this.form.value;
    const time = $('.timepicker').val().split(/[':',' ']/)
    const session = this.globals.getSession()
    const _time = ((parseInt(time[0]))*60 + parseInt(time[1])) * 60 * 1000
    this.event["date"] = new Date($('.datepicker').val()).getTime() + _time
    this.event["description"] = $('#description').val()
    this.event["seatmap"] = '[{"name":"A1","price":"1000","seat":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45"]},{"name":"A2","price":"1000","seat":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45"]},{"name":"B1","price":"1000","seat":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","33","32","34","35","36","37","38","39","40","41","42","43","44","45"]},{"name":"B2","price":"1000","seat":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","33","32","34","35","36","37","38","39","40","41","42","43","44","45"]},{"name":"VIP","price":"1000","seat":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","33","32","34","35","36","37","38","39","40","41","42","43","44","45"]}]'
    this.event["owner"] = session.email
  }

  onPreview(){
    this.loadFields()
    if (!this.event['date'])
      this.event['date'] = ''
    $('#edit').hide()
    $('#preview').show()
  }

  onEdit(){
    $('#edit').show()
    $('#preview').hide()
  }

  onSubmit ( ) {
    this.loadFields()
    console.log(this.event)
    this.http.post(host + ':8000/event',this.event)
      .subscribe(data => { this.router.navigate(["MostrarEvento",data]) },
                 err => { console.log(err) }
      );
  }
}


