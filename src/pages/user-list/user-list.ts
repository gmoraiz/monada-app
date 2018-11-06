import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ConnProvider } from "../../providers/conn/conn";
import { ConstantProvider } from "../../providers/constant/constant";
import { StorageProvider } from "../../providers/storage/storage";

@IonicPage()
@Component({
  selector: 'page-user-list',
  templateUrl: 'user-list.html',
})
export class UserListPage {
  users: Array<any> = [];
  filter:any = {
    type: null,
    publicationId: null,
    userId: null,
  };
  loadingUsers: boolean = true;
  offset: number = this.constant.userListLimit;
  me: any = {};
  notMe: boolean = false;

  constructor(public nav: NavController, public params: NavParams, public conn: ConnProvider,
  public viewCtrl: ViewController, public constant: ConstantProvider, public storage: StorageProvider){
    this.storage.getUser().then(user => this.me = user);
    this.initFilter();
    this.conn.userList(this.filter).then(res => {
      this.users = res.json().data;
      this.setLoadingUsers(false);
    }).catch(err => {
      this.setLoadingUsers(false);
      console.log("Error in loading user list", err);
    });
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad UserListPage');
  }

  openProfile(user: any){
    if(user.userId != this.me.userId){
      this.nav.push('ProfilePage', user);
    }
  }

  private initFilter(){
    if(this.params.get('notMe') === true){
      this.notMe = true;
    }
    this.filter.type          = this.params.get('type');
    this.filter.publicationId = this.params.get('publicationId') || null;
    this.filter.userId        = this.params.get('userId') || null;
  }

  private setOffset(){
    this.offset+= this.constant.userListLimit;
  }

  private setLoadingUsers(x:boolean = true){
    this.loadingUsers = x;
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  doInfinite(infiniteScroll){
    this.conn.userList(this.filter, this.offset).then(res => {
      this.users = this.users.concat(res.json().data);
      if(res.json().data.length){
        this.setOffset();
      }
      infiniteScroll.complete();
    }).catch(err => {
      console.log("Error in infinite scroll users list", err);
      infiniteScroll.complete();
    });
  }

}
