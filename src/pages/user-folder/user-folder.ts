import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, Platform } from 'ionic-angular';
import { ConnProvider } from "../../providers/conn/conn";
import { StorageProvider } from "../../providers/storage/storage";

@IonicPage()
@Component({
  selector: 'page-user-folder',
  templateUrl: 'user-folder.html',
})
export class UserFolderPage {
  loadingFolders: boolean = true;
  folders: Array<any> = [];
  selectMode:boolean = false;
  constructor(public navCtrl: NavController, public params: NavParams, public modal: ModalController,
  public conn: ConnProvider, public storage: StorageProvider, public viewCtrl: ViewController, public platform: Platform){
    this.selectMode = params.get('selectMode') ? true: false;
    this.conn.showFolder().then(res => {
      this.folders = res.json().data;
      this.setLoadingFolders(false);
    }).catch(err => this.setLoadingFolders(false));
  }

  open(folder: any){
    let modal = this.modal.create('UserFolderCreatePage', {editMode: true, folder: folder});
    modal.present();
    modal.onDidDismiss(data => {
      if(data.action == 'delete'){
        this.folders = this.folders.filter(x => x.id != data.folder.id);
      }
      if(data.action == 'edit'){
        this.folders.forEach(x => x.id == data.folder.id ? data.folder : x);
      }
    });
  }

  dismiss(folder: any = null){
    if(this.selectMode){
      this.viewCtrl.dismiss({folder: folder});
    }else{
      this.viewCtrl.dismiss({folders: this.folders});
    }
  }

  openFolderCreate(){
    let modal = this.modal.create('UserFolderCreatePage');
    modal.present();
    modal.onDidDismiss(data => {
      if(data.action == 'create'){
          this.folders.unshift(data.folder);
      }
    });
  }

  private setLoadingFolders(x:boolean = true){
    this.loadingFolders = x;
  }

  ionViewWillUnload(){
    this.dismiss();
  }

}
