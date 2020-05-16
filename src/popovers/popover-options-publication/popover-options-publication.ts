import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ModalController, ToastController, Events } from 'ionic-angular';
import { LoadProvider } from "../../providers/load/load";
import { ConnProvider } from "../../providers/conn/conn";
import { HelperProvider } from '../../providers/helper/helper';

@IonicPage()
@Component({
  selector: 'page-popover-options-publication',
  templateUrl: 'popover-options-publication.html',
})
export class PopoverOptionsPublicationPage {
  publication: any = {}
  isMe: boolean = false;
  constructor(public navCtrl: NavController, public params: NavParams, public viewCtrl: ViewController,
  public alert: AlertController, public modal: ModalController, public load: LoadProvider, public conn: ConnProvider,
  public toast: ToastController, public events: Events, public helper: HelperProvider){
    this.publication = this.params.get('publication');
    this.isMe = this.params.get('isMe');
  }

  delete(){
    let alert = this.alert.create({
      title: 'Você tem certeza desta ação?',
      message: "A publicação será permanentemente removida do sistema",
    });
    alert.addButton({
      text:'Cancelar',
      handler: data => {
        this.dismiss();
      }
    });
    alert.addButton({
      text:'Confirmar',
      handler: data => {
        this.load.withMessage("Aguarde");
        this.conn.deletePublication(this.publication.id).then(res => {
          this.load.dismiss();
          this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          if(res.json().data){
            this.events.publish('UserPage/publication/delete', this.publication.id);
            this.dismiss("delete");
          }else{
            this.dismiss();
          }
        }).catch(err => {
            console.log("Error in delete publication data", err);
            this.load.dismiss();
            this.dismiss();
        });
      }
    });
    alert.present();
  }

  edit(){
    this.load.onlyIcon();
    this.conn.showPublication(this.publication.id).then(res => {
      this.load.dismiss();
      if(res.json().data){
        this.publication = res.json().data;
        let publicationRefreshed = Object.assign({}, this.publication);
        let modal = this.modal.create('PublicationCreatePage', {publication: this.publication, editMode: true});
        modal.present();
        modal.onDidDismiss(data => {
          if(data){
            switch(data.action){
              case 'delete':
                console.log("Publication removed", data);
                this.dismiss('delete');
                break;
              case 'edit':
                console.log("Publication edited", data);
                this.publication = data.publication;
                this.dismiss('edit');
                break;
              default:
                this.publication = publicationRefreshed;
                this.dismiss('refresh');
            }
          }else{
            this.publication = publicationRefreshed;
            this.dismiss('refresh');
          }
        });
      }else{
        this.toast.create({message: "Esta sua publicação não existe mais", duration: 3000, position: 'bottom'}).present();
        this.dismiss('delete');
      }
    }).catch(err => {
      this.load.dismiss();
    });
  }

  block(){
    let alert = this.alert.create({
      title: 'Tens certeza desta ação?',
      message: "O contéudo dessa postagem não será mais exibido. Tu também podes nos reportar a causa do bloqueio, se nocivo, indesejável ou outrem!",
    });
    alert.addButton({
      text:'Cancelar',
      handler: data => {
        this.dismiss();
      }
    });
    alert.addButton({
      text:'Confirmar',
      handler: data => {
        this.load.withMessage("Aguarde");
        this.conn.blockPublication({publicationId: this.publication.id}).then(res => {
          this.load.dismiss();
          if(!res.json().data){
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
          this.dismiss('block');
        }).catch(err => this.load.dismiss());
      }
    });
    alert.present();
  }

  unblock(){
    this.load.withMessage("Aguarde");
    this.conn.unblockPublication(this.publication.id).then(res => {
      this.load.dismiss();
      if(!res.json().data){
        this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
      }
      this.dismiss('unblock');
    }).catch(err => this.load.dismiss());
  }

  dismiss(action: string = null){
    this.viewCtrl.dismiss({publication: this.publication, action: action});
  }

}
