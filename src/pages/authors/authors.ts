import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { ConnProvider } from '../../providers/conn/conn';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-authors',
  templateUrl: 'authors.html',
})
export class AuthorsPage {
  loadingAuthors: boolean = true;
  authors: Array<any> = [];
  followingData: Array<any> = [];
  searchData: Array<any> = [];
  filter: any = {
    name: "",
  };
  offsetSearch: number = 0;
  offsetFollowings: number = 0;
  actualSegment: string = "following";
  me:any = {};

  constructor(public nav: NavController, public navParams: NavParams, public events: Events,
  public conn:ConnProvider, public constant: ConstantProvider, public storage: StorageProvider,
  public toast: ToastController, public socialSharing: SocialSharing){
    this.storage.getUser().then(user => this.me = user);
    this.conn.following().then(res => {
      if(this.actualSegment == "following"){
        this.authors = res.json().data;
        if(res.json().data.length){
          this.setFollowingsOffset();
        }
      }
      this.followingData = res.json().data;
      this.setLoadingAuthors(false);
    }).catch(err => this.setLoadingAuthors(false));
    this.listeners();
  }

  search(){
    if(this.filter.name !== null && this.filter.name !== ""){
      this.setActualSegment("search");
      this.setLoadingAuthors();
      this.conn.authorSearch(this.filter.name).then(res => {
        if(this.actualSegment == "search"){
          this.authors = res.json().data;
          this.searchData = res.json().data;
          if(res.json().data.length){
            this.setSearchOffset();
          }
        }
        this.setLoadingAuthors(false);
      }).catch(err => this.setLoadingAuthors(false));
      console.log(this.filter.name);
    }else{
      this.setActualSegment("following");
      this.authors = this.followingData;
    }
  }

  followAction(author: any){
    if(!author.followAction){
      author.followAction = true;
      if(author.followed){
        this.conn.unfollow(author.userId).then(res => {
          author.followAction = false;
          if(res.json().data){
            author.followed = false;
            this.removeFollowed(author);
          }else{
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
          this.events.publish('home/resetAllPublications', {userId: author.userId});
        }).catch(err => author.saveAction = false);
      }else{
        this.conn.follow({users: [author.userId]}).then(res => {
          author.followAction = false;
          if(res.json().data){
            author.followed = true;
            author.muted = true;
            this.setFollowed(author);
          }else{
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => author.followAction = false);
      }
    }
  }

  muteAction(author: any){
    if(!author.muteAction){
      author.muteAction = true;
      if(author.muted){
        this.conn.unmute(author.userId).then(res => {
          author.muteAction = false;
          if(res.json().data){
            author.muted = false;
          }else{
            author.muted = false;
            this.toast.create({message: "Já tirastes o silenciar do usuário", duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => author.muteAction = false);
      }else{
        this.conn.mute(author.userId).then(res => {
          author.muteAction = false;
          if(res.json().data){
            author.muted = true;
          }else{
            author.muted = true;
            this.toast.create({message: "Já silenciastes o usuário", duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => author.muteAction = false);
      }
    }
  }

  openProfile(author: any){
    this.nav.push('ProfilePage', author).then(() => {
      // this.nav.getActive().onDidDismiss(data => {
      //   console.log(data);
      // });
    });
  }

  private listeners(){
    this.events.subscribe('authors/changeSearchByProfile', data => {
      console.log('authors/changeSearchByProfile', data);
      switch(data.action){
        case 'follow':
          this.authors.forEach(e => {
            if(e.userId == data.userId){
              e.following = true;
              e.deleted = false;
            }
          });
          break;
        case 'unfollow':
          this.authors.forEach(e => {
            if(e.userId == data.userId){
              e.following = false;
              e.deleted = true;
            }
          });
          break;
        case 'block':
          this.authors.forEach(e => {
            if(e.userId == data.userId){
              e.blocked = true;
              e.following = false;
              e.deleted = true;
            }
          });
          break;
        case 'unblock':
          this.authors.forEach(e => {
            if(e.userId == data.userId){
              e.blocked = false;
            }
          });
          break;
      }
    });
  }

  private setFollowed(author){
    this.followingData.unshift(author);
  }

  private removeFollowed(author){
    this.followingData = this.followingData.filter(x => x.userId != author.userId);
  }

  private setActualSegment(x:string){
    this.actualSegment = x;
  }

  private setLoadingAuthors(x:boolean = true){
    this.loadingAuthors = x;
  }

  private setSearchOffset(){
    this.offsetSearch += this.constant.searchAuthorLimit;
  }

  private setFollowingsOffset(){
    this.offsetFollowings += this.constant.searchAuthorLimit;
  }

  doRefresh(refresher){
    this.conn.following().then(res => {
      this.authors = res.json().data;
      this.followingData = res.json().data;
      if(res.json().data.length){
        this.offsetFollowings = this.constant.searchAuthorLimit;
      }
      refresher.complete();
    }).catch(err => refresher.complete());
  }

  doInfinite(infiniteScroll){
    if(this.actualSegment == 'following'){
      this.conn.following(this.offsetFollowings).then(res => {
        this.authors = this.authors.concat(res.json().data);
        this.followingData = this.authors;
        if(res.json().data.length){
          this.setFollowingsOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load following in Infinite Scroll", err);
      });
    }else{
      this.conn.authorSearch(this.filter.name, this.offsetSearch).then(res => {
        this.authors = this.authors.concat(res.json().data);
        this.searchData = this.authors;
        if(res.json().data.length){
          this.setSearchOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load search authors in Infinite Scroll", err);
      });
    }
  }

}
