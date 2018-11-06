import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-publication',
  templateUrl: 'publication.html',
})
export class PublicationPage {
  publication: any = {}
  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public params: NavParams){
    this.publication = params.get('publication');
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad PublicationPage');
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
