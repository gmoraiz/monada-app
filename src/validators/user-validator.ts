import { FormControl } from '@angular/forms';
import { ConnProvider } from "../providers/conn/conn";
import { Observable } from "rxjs/Observable";

export class UserValidator {
  static conn: ConnProvider;

  constructor(conn: ConnProvider){
    UserValidator.conn = conn;
  }
  
  checkUsername(control: FormControl): any{
    return Observable.timer(2000).switchMap(()=>{
      if(control.value){
        return UserValidator.conn.checkUsername(control.value).then(res => {
              if(res.json().data){
                return null;
              }else{
                return {"checkUsername": true};
              }
            }).catch(err => {
              return {"checkUsername": true};
            });
      }
      return Observable.of(null);
    });
  }

  checkEmail(control: FormControl): any{
    return Observable.timer(2000).switchMap(()=>{
      if(control.value){
        return UserValidator.conn.checkEmail(control.value).then(res => {
              if(res.json().data){
                return null;
              }else{
                return {"checkEmail": true};
              }
            }).catch(err => {
              return {"checkEmail": true};
            });
      }
      return Observable.of(null);
    });
  }

  checkInvite(control: FormControl): any{
    return Observable.timer(2000).switchMap(()=>{
      if(control.value){
        return UserValidator.conn.checkInvite(control.value).then(res => {
              if(res.json().data){
                return null;
              }else{
                return {"checkInvite": true};
              }
            }).catch(err => {
              return {"checkInvite": true};
            });
      }
      return Observable.of(null);
    });
  }

}