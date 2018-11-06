import { Component, ViewChild } from '@angular/core';
import { NavController, Content, Platform} from 'ionic-angular';
import { Slides, AlertController, ToastController, IonicPage } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { ConnProvider } from '../../providers/conn/conn';
import { LoadProvider } from '../../providers/load/load';

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})

export class TutorialPage {
  @ViewChild(Content) content: Content;
  @ViewChild('finalUsersScrollbarX') finalUsersScrollbarX: any;
  @ViewChild(Slides) slides: Slides;
  public unregisterBackButtonAction: any;

  users: Array<any> = [];
  searchUsers: Array<any> = [];
  constructor(public nav: NavController, public statusBar: StatusBar, platform: Platform, public alertCtrl: AlertController,
  public conn: ConnProvider, public load: LoadProvider, public toastCtrl: ToastController){
    //statusBar.hide();
    this.load.onlyIcon();
    this.conn.authorSuggestion().then(res => {
      this.load.dismiss();
      res.json().data.forEach((user: any,i) => {
        if(this.users.filter(x => x.userId === user.userId).length){
          user.selected = true;
        }
        this.searchUsers.push(user);
      });
    }).catch(err => this.load.dismiss());
    
    this.unregisterBackButtonAction = platform.registerBackButtonAction(() => {
      let alert = this.alertCtrl.create({
        title: 'Heyyyy!!!',
        message: 'Você está a sair do aplicativo. Deseja finalizar esta etapa antes?',
        buttons: [{
          text: 'Não',
          role: 'cancel',
          handler: () => {
            platform.exitApp();
          }
        },{
          text: 'Sim',
          handler: () => {
            console.log('Application exit prevented!');
          }
        }]
      });
      alert.present();
    },1)
  }

  getUsers(term: string){
    if(term != ""){
      this.conn.authorSearch(term).then(res => {
        this.searchUsers = [];
        res.json().data.forEach((user: any,i) => {
          if(this.users.filter(x => x.userId === user.userId).length){
            user.selected = true;
          }
          this.searchUsers.push(user);
        });
      })
    }else{
      this.searchUsers = [];
    }
  }

  setUser(user: any){
    this.content.resize();
    if(!this.users.filter(x => x.userId === user.userId).length){
      user.selected = true;
      this.users.push(user);
    }else{
      user.selected = false;
      this.users = this.users.filter(x => x.userId !== user.userId);
    }
    this.scrollToRight();
  }

  deleteUser(user: any){
    this.content.resize();
    user.selected = false;
    this.users = this.users.filter(x => x.userId !== user.userId);
  }

  openHome(){
    if(this.users.length){
      this.load.onlyIcon();
      this.conn.follow({"users": this.users.map(x => x.userId)}).then(res => {
        this.load.dismiss();
        if(res.json().data){
          this.nav.setRoot('TabsPage').then(() => {
            this.statusBar.show();
            this.nav.remove(0, this.nav.getActive().index);
          });
        }else{
          this.toastCtrl.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
        }
      }).catch(err => this.load.dismiss())
    }else{
      this.nav.setRoot('TabsPage').then(() => {
        this.statusBar.show();
        this.nav.remove(0, this.nav.getActive().index);
      });
    }
  }

  scrollToRight(){
    setTimeout(()=>{this.finalUsersScrollbarX.nativeElement.scrollIntoView(true)}, 200); 
  }

  slideChanged(){
    this.content.resize();
  }

  ionViewWillLeave(){
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

}