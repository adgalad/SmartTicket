import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

export const host = "http://0.0.0.0";

@Injectable()
export class Globals {
  event = {}


  public setSession(name: string, email: string, balance: number) {
    localStorage.setItem('name',name);
    localStorage.setItem('email',email);
    localStorage.setItem('balance',balance === undefined ?"0":balance.toString());
    //localStorage.setItem('promoter',promoter);
  }

  public getSession() {
    var name = localStorage.getItem('name');
    var email = localStorage.getItem('email');
    var balance = localStorage.getItem('balance');
    // var promoter = localStorage.getItem('promoter')
    return {name, email, balance};
    // return {name,email,promoter};
  }

  public setImage(url){
    localStorage.setItem('imageURL', url)
  }
  public getImage(){
    const url = localStorage.getItem('imageURL')
    if (!url) return ""
    return  url
  }

  public isLogged(){
    var a = localStorage.getItem('name');
    if (a === "" || a === null || a === undefined){
      return true;
    }else{
      return false;
    }
  }
}


@Injectable()
export class AlwaysAuthGuard implements CanActivate {
  constructor(private globals: Globals){}
  canActivate():boolean {
    return this.globals.isLogged();
  }
}

@Injectable()
export class CurrentEvent {

  setEvent(event){
    localStorage.removeItem('event')
    localStorage.setItem('event', event)
  }

  getEvent(){
    return localStorage.getItem('event');
  }
}
