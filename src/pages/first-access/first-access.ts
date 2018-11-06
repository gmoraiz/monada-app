import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { StatusBar } from "@ionic-native/status-bar";

@IonicPage()
@Component({
  selector: 'page-first-access',
  templateUrl: 'first-access.html',
})
export class FirstAccessPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public constant: ConstantProvider,
  public storage: StorageProvider,public statusBar: StatusBar){
    statusBar.hide();
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad FirstAccessPage');
  }

  ionViewDidLeave(){
    this.statusBar.show();
  }

  openLogin(){
    this.storage.setNotFirstAccess();
    this.navCtrl.setRoot('LoginPage').then(() => {
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0, index);
    });
  }

  openRegister(){
    this.storage.setNotFirstAccess();
    this.navCtrl.push('RegisterPage');
  }


}
