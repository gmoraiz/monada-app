import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ToastController, NavController, ModalController, PopoverController, Events, AlertController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ConnProvider } from '../../providers/conn/conn';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from "../../providers/storage/storage";
import { HelperProvider } from "../../providers/helper/helper";

@Component({
  selector: 'publication',
  templateUrl: 'publication.html'
})
export class PublicationComponent{
  @Input('publication') publication;
  @Input('opened') opened;
  @Output() PublicationChange: EventEmitter<any> = new EventEmitter<any>();
  user: any = {};
  showBlocked: boolean = false;

  constructor(public conn: ConnProvider, public toast: ToastController, public photoViewer: PhotoViewer, public nav: NavController,
  public socialSharing: SocialSharing, public constant: ConstantProvider, public modal: ModalController, public popover: PopoverController,
  public storage: StorageProvider, public events: Events, public helper: HelperProvider, public alert: AlertController){
    storage.getUser().then(user => this.user = user);
  }

  likeAction(publication: any){
    if(!publication.likeAction){
      publication.likeAction = true;
      if(publication.liked){
        this.conn.unlike(publication.id).then(res => {
          publication.likeAction = false;
          if(res.json().data){
            publication.liked = false;
            publication.likes--;
          }else{
            publication.liked = false;
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.likeAction = false);
      }else{
        this.conn.like({publicationId: publication.id}).then(res => {
          publication.likeAction = false;
          if(res.json().data){
            publication.liked = true;
            publication.likes++;
          }else{
            publication.liked = true;
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.likeAction = false);
      }
    }
  }

  saveAction(publication: any){
    if(!publication.saveAction){
      publication.saveAction = true;
      if(publication.saved){
        this.conn.unsave(publication.id).then(res => {
          publication.saveAction = false;
          if(res.json().data){
            publication.saved = false;
          }else{
            publication.saved = false;
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.saveAction = false);
      }else{
        this.conn.save({publicationId: publication.id}).then(res => {
          publication.saveAction = false;
          if(res.json().data){
            publication.saved = true;
          }else{
            publication.saved = true;
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.saveAction = false);
      }
    }
  }

  sharePublication(publication){
    let message = "Publicação do "+ publication.author.name+" ("+publication.author.username+"):\n";
    let subject = publication.author.name;
    let file = "";
    let url = this.constant.SHARE_URL + "publication/" + publication.id;
    if(publication.title)       message+= "\n"+ publication.title;
    if(publication.description) message+= "\n"+ (publication.description.length > 100 ? publication.description.substring(0,100)+"..." : publication.description);
    if(publication.link.url)    message+= '\n (Um link foi indexado)';
    if(publication.images[0])   file    = publication.images[0].name;
    message+="\n";
    this.socialSharing.share(message, subject, file, url).then(() => {
      console.log("Shared with success!!!");
    }).catch(() => {
      console.log("Error on share!!!");
    });
  }

  showBlockedDialog(){
    let alert = this.alert.create({
      title: 'Queres realmente isto?',
      message: "Lembre-te o motivo do bloqueio desta publicação. Ela pode conter contéudo nocivo, indesejável, etc..",
    });
    alert.addButton({
      text:'Cancelar',
    });
    alert.addButton({
      text:'Mostre-me mesmo assim!',
      handler: data => {
        this.showBlocked = true;
      }
    });
    alert.present();
  }

  openPublication(publication){
    if(!this.opened){
      // let modal = this.modal.create('PublicationPage', {publication: publication});
      // modal.present();
      this.nav.push('PublicationPage', {publication: publication});
    }
  }

  options(publication, isMe, myEvent){
    let popover = this.popover.create('PopoverOptionsPublicationPage', {publication: publication, isMe: isMe});
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss(data => {
      if(data){
        switch(data.action){
          case 'delete':
            console.log("Publication removed", data.publication);
            this.publication.removed = true;
            break;
          case 'edit':
            console.log("Publication edited", data.publication);
            this.publication = data.publication;
            break;
          case 'refresh':
            console.log("Publication refreshed", data.publication);
            this.publication = data.publication;
            break;
          case 'block':
            console.log("Publication blocked", data.publication);
            this.publication.blocked = true;
            break;
          case 'unblock':
            console.log("Publication unblocked", data.publication);
            this.publication.blocked = false;
            this.showBlocked = false;
            break;
        }
      }
    });
  }

  openLiked(){
    this.storage.getUser().then(user => {
      let modal = this.modal.create('UserListPage', {type:this.constant.userListEnum.LIKED, publicationId: this.publication.id});
      modal.present();
    });
  }

  openProfile(author: any){
    this.nav.push('ProfilePage', author);
  }

}
