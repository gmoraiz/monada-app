import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, PopoverController, ActionSheetController, Events } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ConnProvider } from '../../providers/conn/conn';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { LoadProvider } from '../../providers/load/load';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { trigger, style, animate, transition } from '@angular/animations';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
        ])
      ]
    )
  ]
})
export class ProfilePage{
  user:any = {}
  publications: Array<any> = [];
  folders: Array<any> = [];
  categories: Array<any> = [];
  publicationsData: Array<any> = [];
  searchData: Array<any> = [];
  filter: any = {
    since: new Date().toISOString(),
    until: new Date().toISOString(),
    term: "",
    author: "",
    category: []
  };

  loadingPublications: boolean = true;
  loadingProfile: boolean = true;
  loadingFolders: boolean = true;
  offsetPublications: number = 0;
  offsetSearch: number = 0;
  actualSegment: string = "publications";
  actualFilter: any;
  isSearch: boolean = false;
  openedSearch: boolean = false;
  
  constructor(public nav: NavController, public navParams: NavParams, public events: Events,
  public conn:ConnProvider, public constant: ConstantProvider, public storage: StorageProvider, public load: LoadProvider,
  public toast: ToastController, public socialSharing: SocialSharing, public clipboard: Clipboard, public actionSheetCtrl: ActionSheetController,
  public popover: PopoverController, private photoViewer: PhotoViewer){
    this.user = this.navParams.data;
    this.storage.getUser().then(user => {
      if(user.userId == this.user.userId){
        this.nav.parent.select(4);
        this.nav.pop().then();
      }else{
        this.conn.profile(this.user.userId).then(res => {
          if(res.json().data){
            this.setLoadingProfile(false);
            this.user = res.json().data;
            if(this.user.authorId){
              this.initAuthorThings();
            }else{
              this.setLoadingPublications(false);
              this.setLoadingFolders(false);
            }
          }else{
            this.toast.create({message: res.json().msg, duration: 4000, position: 'bottom'}).present();
            this.nav.pop();
          }
        }).catch(err => this.setLoadingProfile(false));
      }
    });
  }

  initAuthorThings(){
      this.filter.author = this.user.username;
      this.conn.authorPublication(this.user.authorId).then(res => {
        this.publications = res.json().data;
        this.publicationsData = this.publications;
        this.setLoadingPublications(false);
        if(res.json().data.length){
          this.setPublicationsOffset();
        }
      }).catch(err => this.setLoadingPublications(false));

      this.conn.authorFolder(this.user.authorId).then(res => {
        this.folders = res.json().data;
        this.setLoadingFolders(false);
      }).catch(err => this.setLoadingFolders(false));

      this.conn.categories().then(res => {
          this.categories = res.json().data;
      }).catch(err => err);
  }

  search(){
    this.setActualFilter();
    this.setLoadingPublications();
    this.setIsSearch();
    this.conn.search(this.actualFilter).then(res => {
      if(this.isSearch){
        this.publications = res.json().data;
        this.searchData = res.json().data;
        if(res.json().data.length){
          this.setSearchOffset();
        }
      }
      this.setLoadingPublications(false);
    }).catch(err => this.setLoadingPublications(false));
  }

  options(myEvent){
    let popover = this.popover.create('PopoverOptionsProfilePage', this.user);
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss(data => {
      if(data){
        switch(data.action){
          case 'block':
            console.log("User blocked", data.user);
            this.events.publish('authors/changeSearchByProfile', {action: 'block', userId: this.user.userId});
            this.events.publish('home/resetAllPublications', {userId: this.user.userId});
            this.user.blocked  = true;
            this.user.followed = false;
            this.user.muted = true;
            break;
          case 'unblock':
            console.log("User unblock", data.user);
            this.events.publish('authors/changeSearchByProfile', {action: 'unblock', userId: this.user.userId});
            this.user.blocked = false;
            this.setLoadingFolders(true);
            this.setLoadingPublications(true);
            this.conn.authorFolder(this.user.authorId).then(res => {
              this.folders = res.json().data;
              this.setLoadingFolders(false);
            }).catch(err => this.setLoadingFolders(false));
            this.conn.authorPublication(this.user.authorId).then(res => {
              this.publications = res.json().data;
              this.publicationsData = this.publications;
              this.setLoadingPublications(false);
              if(res.json().data.length){
                this.offsetPublications = this.constant.searchPublicationsHome;
              }
            }).catch(err => this.setLoadingPublications(false));
            break;
        }
      }
    });
  }

  private setActualFilter(){
    this.actualFilter = Object.assign({}, this.filter);
    this.actualFilter.since = this.actualFilter.since.substring(0, 10);
    this.actualFilter.until = this.actualFilter.until.substring(0, 10);
  }

  private setPublicationsOffset(){
    this.offsetPublications += this.constant.searchPublicationsHome;
  }

  private setSearchOffset(){
    this.offsetSearch += this.constant.searchPublicationsHome;
  }

  private setLoadingPublications(x:boolean = true){
    this.loadingPublications = x;
  }

  private setLoadingFolders(x:boolean = true){
    this.loadingFolders = x;
  }

  private setLoadingProfile(x:boolean = true){
    this.loadingProfile = x;
  }

  public setIsSearch(x:boolean = true){
    this.isSearch = x;
  }

  public setOpenedSearch(x: boolean = true){
    if(!x){
      this.setIsSearch(false);
      this.publications = this.publicationsData;
      this.clearFilter();
    }
    this.openedSearch = x;
  }

  public clearFilter(){
    this.searchData = [];
    this.filter.since = new Date().toISOString();
    this.filter.until = new Date().toISOString();
    this.filter.term = "";
    this.filter.category = [];
  }

  openPhoto(image){
    this.photoViewer.show(image);
  }

  doRefresh(refresher){
        this.conn.authorPublication(this.user.authorId).then(res => {
          this.publicationsData = res.json().data;
          this.publications = res.json().data;
          if(res.json().data.length){
            this.offsetPublications = this.constant.searchPublicationsHome;
          }
          refresher.complete();
        }).catch(err => refresher.complete());
  }

  doInfinite(infiniteScroll){
    if(!this.isSearch){
      this.conn.authorPublication(this.user.authorId, this.offsetPublications).then(res => {
        this.publications = this.publications.concat(res.json().data);
        this.publicationsData = this.publications;
        if(res.json().data.length){
          this.setPublicationsOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load author's publication in Infinite Scroll", err);
      });
    }else{
      this.conn.search(this.actualFilter, this.offsetSearch).then(res => {
        this.publications = this.publications.concat(res.json().data);
        this.searchData = this.publications;
        if(res.json().data.length){
          this.setSearchOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load search author's publications in Infinite Scroll", err);
      });
    }
  }
}
