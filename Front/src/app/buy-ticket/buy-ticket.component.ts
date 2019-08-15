import { Component, OnInit } from '@angular/core';
import { CurrentEvent } from '../globals'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Globals, host } from '../globals';

declare var jQuery:any;
declare var $ :any;

@Component({
  selector: 'app-buy-ticket',
  templateUrl: './buy-ticket.component.html',
  styleUrls: ['./buy-ticket.component.css'
             , "../../../node_modules/font-awesome/css/font-awesome.css"]
})
export class BuyTicketComponent implements OnInit {
  event = {}
  email = localStorage.getItem('email')
  total = 0
  tickets = []
  constructor(private currentEvent : CurrentEvent,
              private http: HttpClient,
              ) {
  }

  getTicket(id){
    const zone = localStorage.getItem('Zone')
    for(var i = 0; i < this.event['seatMap'].length; i++){
      if (this.event['seatMap'][i]["name"] === zone){
        for(var j = 0; j < this.event['seatMap'][i]['seats'].length; j++){
          if (this.event['seatMap'][i]["seats"][j]["name"] === id){
            return this.event['seatMap'][i]["seats"][j];
          }
        }
      }
    }

    return undefined
  }

  addResoldTicket(ticket){
    const zone = localStorage.getItem('Zone')
    document.getElementById('ticket-table').innerHTML +=
      "<tr id='ticket-"+zone+ticket["name"]+"'>\
         <td class='zone'>"+ zone +"</td>\
         <td class='seat'>"+ ticket["name"] +"</td>\
         <td class='price'>"+ ticket.resellPrice +"</td>\
         <td class='isResold'><i style='color:green;' class='material-icons'>check</i></td>\
      </tr> ";
    var res = document.getElementById('totalPrice').innerText.split(" ");
    document.getElementById('totalPrice').innerText = "Total: $ " + (parseInt(res[2])+parseInt(ticket.resellPrice))
  }

  addTicket(ticket){
    const zone = localStorage.getItem('Zone')
    document.getElementById('ticket-table').innerHTML +=
      "<tr id='ticket-"+zone+ticket["name"]+"'>\
         <td class='zone'>"+ zone +"</td>\
         <td class='seat'>"+ ticket["name"] +"</td>\
         <td class='price'>"+ ticket.price +"</td>\
         <td class='isResold'>-</td>\
      </tr> ";
    var res = document.getElementById('totalPrice').innerText.split(" ");
    document.getElementById('totalPrice').innerText = "Total: $ " + (parseInt(res[2])+parseInt(ticket.price))
  }



  removeTicket(id){
    const zone = localStorage.getItem('Zone')
    const tickets = document.getElementById('ticket-table').getElementsByTagName("tr")
    for (var i = 0; i < tickets.length; i++) {
      if (tickets[i].id === "ticket-"+zone+id){
        var res = document.getElementById('totalPrice').innerText.split(" ");
        document.getElementById('totalPrice').innerText = "Total: $ " + (parseInt(res[2])-parseInt(tickets[i].getElementsByClassName('price')[0].innerHTML))
        tickets[i].remove()
      }
    }
  }

  clickOnZone(zone) {
    const event = this.event
    $('#'+zone).click(function(e){
      localStorage.setItem('Zone', zone)
      $('#zones').hide()
      $('#seats-'+zone).toggle()
      $('#goBack').show()
      var area = document.getElementById(zone);
      return false;
    })
  }

  clickOnSeat(zone, area){
    var id = area.id;
    const addTicket = this.addTicket
    const addResoldTicket = this.addResoldTicket
    const removeTicket = this.removeTicket
    const ticket = this.getTicket(id)

    const name = 'area[name=' + zone +'-'+ id +']'
    if (ticket!==undefined) $(name).click(function(e) {
      e.preventDefault()
      var data = $(name).mouseout().data('maphilight') || {};
      if ( data.fillColor === 'ff0000' ){ return; }
      data.fillOpcity = 1
      if (data.alwaysOn){
        if ( data.fillColor === '0000ff' ){
          removeTicket(id)
          data.alwaysOn = false;
        } else if ( data.fillColor === '0000fe' ){
          removeTicket(id)
          data.fillColor = '00ff00'
          data.strokeColor = '00ff00'
        } else if ( data.fillColor === '00ff00' ){
          data.fillColor = '0000fe'
          data.strokeColor = '0000fe'
          addResoldTicket(ticket)
        }
      }
      else {
        addTicket(ticket)
        data.fillColor = '0000ff'
        data.strokeColor = '0000ff'
        data.alwaysOn = true;
      }

      $(name).data('data-maphilight', data).trigger('alwaysOn.maphilight');
      return false;
    })
   }

  goBackAction(){

  }

  confirmation(){
    $('#loading').hide();
    $('#confirmTicket').show()
    const tickets = document.getElementById('unconfirm').outerHTML
    document.getElementById('confirmationInfo').innerHTML = tickets
    const t = {
      email: localStorage.getItem('email'),
      tickets: JSON.stringify(this.tickets),
      event: this.event["_id"]
    }
    this.http.post(host + ':8000/event/confirmation', t)
      .subscribe(data =>{
        console.log(data)
      }, err => {
        console.log(err)
    })
  }

  ngOnInit() {

    // $('.modal').modal();
    $('#confirmTicket').hide()
    $('#goBack').hide().click(function(){
      const zone = localStorage.getItem('Zone')
      $('#goBack').hide()
      $('#zones').show()
      $('#seats-'+zone).hide()
    })

    const _this = this
    this.event = JSON.parse(this.currentEvent.getEvent())
    const event = this.event
    var index = 0
    $('#buyTickets').click(function(){
      var ticketsArray = []
      const tickets = document.getElementById('ticket-table').getElementsByTagName("tr")


      const f = function(i, max){
        if (i === max) return true;
      }
      for (var j = 0; j < tickets.length; j++) {
        const buy = function(i){
          var zone = tickets[i].getElementsByClassName('zone')[0].innerHTML
          var seat = tickets[i].getElementsByClassName('seat')[0].innerHTML
          var price = tickets[i].getElementsByClassName('price')[0].innerHTML
          var isResold = tickets[i].getElementsByClassName('isResold')[0].innerHTML
          const zoneIndex = function(zone){
            const zonesArray = ['A1', 'A2', 'B1', 'B2', 'VIP']
            for(var i = 0; i < event['seatMap'][0]['seats'].length; i++){
              if (zonesArray[i] === zone)
                return i;
            }
          }
          if (isResold !== "-") {
            const seats = event['seatMap'][zoneIndex(zone)]['seats']
            for(var j = 0; j < seats.length; j++){
              if (seats[j]['name'] === seat){
                const t = {
                  ticket: seats[j]['_id'],
                  owner: localStorage.getItem('email'),
                  price: price
                }
                _this.http.post(host + ':8000/event/resellTicket',t)
                  .subscribe(data =>{
                    _this["tickets"].push(data['message'])
                    console.log(index, tickets.length-1)

                    if (index == tickets.length-1){
                      _this.confirmation()
                    }
                    index++
                  }, err => {
                    console.log(err)
                })
              }
            }
          } else {
            var t = {
              zone:zone,
              seat:seat,
              price:price,
              id:event['_id'],
              email: localStorage.getItem('email')
            }
            _this.http.post(host + ':8000/event/buyTicket',t)
              .subscribe(data =>{
                _this["tickets"].push(data['message'])
                console.log(index, tickets.length-1)

                if (index == tickets.length-1){
                  _this.confirmation()
                }
                index++
              }, err => {
                console.log(err)
            })
          }
        }
        buy(j)
      }

      if (tickets.length > 0){
        $('#buyTicketView').hide()
        $('#loading').show()

      }
      return false;
    })


    $('.map-zones').maphilight({
        fillColor: '008800'
     });

    const zonesArray = ['A1', 'A2', 'B1', 'B2', 'VIP']
    // $('#'+"A2").click( ()=>{ return false})
    $('#'+"B1").click( ()=>{ return false})
    $('#'+"B2").click( ()=>{ return false})
    $('#'+"VIP").click( ()=>{ return false})
    for(var z = 0; z < zonesArray.length; z++){
      this.clickOnZone(zonesArray[z]);
      $('.map-'+zonesArray[z]+'-img').maphilight();
      var map = document.getElementById('map-'+zonesArray[z]);
      var areas = map.getElementsByTagName('area')


      for (var i = 0; i < areas.length; i++) {
        this.clickOnSeat(zonesArray[z], areas[i])
      }

      for (var i = 0; i < areas.length; i++) {
        const name = 'area[name=' + zonesArray[z] +'-'+ areas[i].id +']'
        var data = $(name).data('maphilight') || {};
        data.fillOpacity = 1
        const status = this.event['seatMap'][z]['seats'][i]['status']
        console.log(status)
        if (status === "Sold"){
          data.fillColor = 'ff0000'
          data.strokeColor = 'ff0000'
          data.alwaysOn = true;
        } else if (status  === "Resell") {
          data.fillColor = '00ff00'
          data.strokeColor = '00ff00'
          data.alwaysOn = true;
        }
        else {
          data.fillColor = '0000ff'
          data.strokeColor = '0000ff'
          data.alwaysOn = false;
        }
        $(name).data('maphilight', data)
      }
    }

    $(document).ready( e => {
      setTimeout(a => {
        $("#A1").trigger("click")
        $("#goBack").trigger("click")
        $("#A2").trigger("click")
        $("#goBack").trigger("click")
        $("#B1").trigger("click")
        $("#goBack").trigger("click")
        $("#B2").trigger("click")
        $("#goBack").trigger("click")
        $("#VIP").trigger("click")
        $("#goBack").trigger("click")
      },500)
    })
  }




}
