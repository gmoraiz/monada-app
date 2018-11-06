import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoadProvider } from '../../providers/load/load';
import { ConnProvider } from '../../providers/conn/conn';
import { ToastController, AlertController } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { ConstantProvider } from '../../providers/constant/constant';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user: FormGroup;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, 
  public load: LoadProvider, public conn: ConnProvider, public toastCtrl: ToastController, public storage: StorageProvider,
  public constant: ConstantProvider, public alertCtrl: AlertController){
    this.user = this.formBuilder.group({
      email:    ['', [Validators.required, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.maxLength(30)]]
    });
  }

  login(){
    this.load.onlyIcon();
    this.storage.getFcm().then(fcm => {
      this.user.value.fcm = fcm;
      this.conn.login(this.user.value).then(res => {
        this.load.dismiss();
        if(res.json().data){
          this.storage.setUser(res.json().data.user);
          this.storage.setToken(res.json().data.token);
          this.navCtrl.setRoot('TabsPage').then(() => {
            const index = this.navCtrl.getActive().index;
            this.navCtrl.remove(0, index);
          });
        }else{
          this.toastCtrl.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
        }
      }).catch(err => this.load.dismiss())
    });
  }

  openRegister(){
    this.navCtrl.push('RegisterPage');
  }

  resetPassword(): void{
    let alert = this.alertCtrl.create({
      title: "Informe o email do qual você deseja recuperar a senha",
      inputs: [{
        name: 'email',
        placeholder: 'Email'
      }],
      buttons:[{
        text: 'Prosseguir',
        handler: (data) => {
          if(data.email != ""){
            this.load.onlyIcon();
            this.conn.resetPassword(data.email).then((res) => {
              this.load.dismiss();
              this.toastCtrl.create({message: res.json().msg, duration: 6000, position: 'bottom'}).present();
            }).catch((err) => this.load.dismiss());
          }else{
            this.toastCtrl.create({message: "Informe-nos um email.", duration: 3000, position: 'bottom'}).present();
          }
          return false;
        }
      },
      {
        text:'Voltar'
      }]
    });
    alert.present();
  }

}
