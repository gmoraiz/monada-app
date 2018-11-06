import { Component } from '@angular/core';
import { IonicPage, ViewController, ToastController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoadProvider } from "../../providers/load/load";
import { ConnProvider } from "../../providers/conn/conn";

@IonicPage()
@Component({
  selector: 'page-user-password-edit',
  templateUrl: 'user-password-edit.html',
})
export class UserPasswordEditPage {
  password: FormGroup;
  validationServer: any;
  constructor(public viewCtrl: ViewController, public toast: ToastController, public conn: ConnProvider,
  public load: LoadProvider, private formBuilder: FormBuilder){
    this.password = this.formBuilder.group({
      password:    ['', [Validators.required, Validators.maxLength(30), Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.maxLength(30), Validators.minLength(6)]]
    });
  }

  edit(){
    this.load.withMessage("Aguarde");
    this.conn.updateUserPassword(this.password.value).then(res => {
        this.load.dismiss();
        this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
        if(res.json().data){
          this.dismiss();
        }
    }).catch(err => {
      console.error("Error in user password change", err);
      if(err.validationServer) this.validationServer = err.validationServer;
      this.load.dismiss();
    })
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
