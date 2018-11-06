import { Component } from '@angular/core';
import { IonicPage, ViewController, ToastController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoadProvider } from "../../providers/load/load";
import { ConnProvider } from "../../providers/conn/conn";

@IonicPage()
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {
  message: FormGroup;

  constructor(public viewCtrl: ViewController, public toast: ToastController, public conn: ConnProvider,
   public load: LoadProvider, private formBuilder: FormBuilder){
    this.message = this.formBuilder.group({
      description:  ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  send(){
    this.load.withMessage("Sua mensagem está sendo enviada");
    this.conn.storeContact(this.message.value).then(res => {
      this.load.dismiss();
      this.toast.create({message: "Obrigado pelo seu contato!", duration: 3000, position: 'bottom'}).present();
      this.dismiss();
    }).catch(err => {
      this.load.dismiss();
    });
  }
  
  dismiss(){
    this.viewCtrl.dismiss();
  }

}
