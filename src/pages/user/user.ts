import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, PopoverController, ActionSheetController, Events, ModalController } from 'ionic-angular';
import { ConnProvider } from '../../providers/conn/conn';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { LoadProvider } from '../../providers/load/load';
import { trigger, style, animate, transition } from '@angular/animations';

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
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
export class UserPage{
  user:any = {}
  publications: Array<any> = [];
  folders: Array<any> = [];
  categories: Array<any> = [];
  saved: Array<any> = [];
  liked: Array<any> = [];

  savedData: Array<any> = [];
  publicationsData: Array<any> = [];
  searchData: Array<any> = [];

  filter: any = {
    since: new Date().toISOString(),
    until: new Date().toISOString(),
    author:"",
    term: "",
    category: [],
    type: ""
  };

  loadingPublications: boolean = true;
  loadingFolders: boolean = true;
  loadingLiked: boolean = true;
  loadingSaved: boolean = true;

  offsetPublications: number = 0;
  offsetSearch: number = 0;
  offsetSaved: number = 0;
  offsetLiked: number = 0;

  actualSegment: string = "";
  actualFilter: any;
  isSearchSaved: boolean = false;
  isSearchPublications: boolean = false;
  openedSearch: boolean = false;
  
  constructor(public nav: NavController, public navParams: NavParams,
  public conn:ConnProvider, public constant: ConstantProvider, public storage: StorageProvider, public load: LoadProvider,
  public toast: ToastController, public actionSheetCtrl: ActionSheetController,
  public popover: PopoverController, public events: Events, public modal: ModalController){
    this.init();
    this.listeners();
  }


//--------------------------- INIT

  ionViewWillEnter(){
    this.loadMe();
    this.loadCategories();
  }

  init(){
    this.storage.getUser().then(user => {
      this.user = user;
      this.loadSaved();
      this.loadLiked();
      if(this.user.authorId){
        this.actualSegment = "publications";
        this.loadPublications();
        this.loadFolders();
      }else{
        this.actualSegment = "saved";
      }
    })
  }
//--------------------------- LOAD'S
  loadMe(){
    this.conn.me().then(res => {
      if(res.json().data){
        this.user = res.json().data;
        this.storage.setUser(res.json().data);
      }
    }).catch(err => err);
  }

  loadPublications(){
    this.conn.authorPublication(this.user.authorId).then(res => {
      this.setLoadingPublications(false);
      this.publicationsData = res.json().data;
      this.publications = res.json().data;
      if(res.json().data.length){
        this.offsetPublications = this.constant.searchPublicationsHome;
      }
    }).catch(err => this.setLoadingPublications(false));
  }

  loadFolders(){
    this.conn.authorFolder(this.user.authorId).then(res => {
      this.folders = res.json().data;
      this.setLoadingFolders(false);
    }).catch(err => this.setLoadingFolders(false));
  }

  loadSaved(){
    this.conn.saved().then(res => {
      this.setLoadingSaved(false);
      this.savedData = res.json().data;
      this.saved = res.json().data;
      if(res.json().data.length){
        this.offsetSaved = this.constant.searchPublicationsHome;
      }
    }).catch(err => this.setLoadingSaved(false));
  }

  loadLiked(){
    this.conn.liked().then(res => {
      this.setLoadingLiked(false);
      this.liked = res.json().data;
      if(res.json().data.length){
        this.offsetLiked = this.constant.searchPublicationsHome;
      }
    }).catch(err => this.setLoadingLiked(false));
  }

  loadCategories(){
    this.conn.categories().then(res => {
        this.categories = res.json().data;
    }).catch(err => err);
  }

//--------------------------- LOADING'S
  private setLoadingPublications(x:boolean = true){
    this.loadingPublications = x;
  }

  private setLoadingFolders(x:boolean = true){
    this.loadingFolders = x;
  }

  private setLoadingLiked(x:boolean = true){
    this.loadingLiked = x;
  }

  private setLoadingSaved(x:boolean = true){
    this.loadingSaved = x;
  }
//--------------------------- SEARCH
  search(){
    this.setActualFilter();
    if(this.actualSegment == "saved"){
      this.setLoadingSaved();
      this.setIsSearchSaved();
    }
    if(this.actualSegment == "publications"){
      this.setLoadingPublications();
      this.setIsSearchPublications();
    }
    this.conn.search(this.actualFilter).then(res => {
      if(res.json().data.length){
        this.offsetSearch = this.constant.searchPublicationsHome;
      }
      if(this.actualSegment == "saved"){
        this.saved = res.json().data;
        this.setLoadingSaved(false);
      }
      if(this.actualSegment == "publications"){
        this.publications = res.json().data;
        this.setLoadingPublications(false);
      }
    }).catch(err => {
      if(this.actualSegment == "saved"){
        this.setLoadingSaved(false);
      }
      if(this.actualSegment == "publications"){
        this.setLoadingPublications(false);
      }
    });
  }

  private setActualFilter(){
    this.actualFilter = Object.assign({}, this.filter);
    if(this.actualSegment == "saved")       this.actualFilter.type ="saved";
    if(this.actualSegment == "publications") this.actualFilter.type   = "publication";
    this.actualFilter.since = this.actualFilter.since.substring(0, 10);
    this.actualFilter.until = this.actualFilter.until.substring(0, 10);
  }

  setOpenedSearch(x: boolean = true){
    if(!x){
      if(this.actualSegment == "publications"){
        this.setIsSearchPublications(false);
        this.publications = this.publicationsData;
      }
      if(this.actualSegment == "saved"){
        this.setIsSearchSaved(false);
        this.saved = this.savedData;
      }
      this.clearFilter();
    }
    this.openedSearch = x;
  }

  setIsSearchPublications(x:boolean = true){
    this.isSearchPublications = x;
  }

  setIsSearchSaved(x:boolean = true){
    this.isSearchSaved = x;
  }

  clearFilter(){
    this.searchData = [];
    this.offsetSearch = 0;
    this.filter.since = new Date().toISOString();
    this.filter.until = new Date().toISOString();
    this.filter.term = "";
    this.filter.author = "";
    this.filter.category = [];
    this.filter.type = "";
  }
//----------------------- OTHER'S

  openFolders(){
    let modal = this.modal.create('UserFolderPage');
    modal.present();
    modal.onDidDismiss(data => {
      this.folders = data.folders;
    });
  }

  segmentChanged(){
    switch(this.actualSegment){
      case 'publications':
        this.setOpenedSearch(false);
        break;
      case 'saved':
        this.setOpenedSearch(false);
        if(!this.isSearchSaved){
          this.loadSaved();
        }
        break;
      case 'liked':
        this.loadLiked();
        break;
      case 'folders':
        //this.loadFolders();
        break;
    }
  }

  private listeners(){
    this.events.subscribe('UserPage/publication/create', () => {
      this.loadPublications();
      console.log('UserPage/publication/create on');
    });

    this.events.subscribe('UserPage/publication/delete', id => {
      this.publications = this.publications.filter(x => x.id != id);
      console.log('UserPage/publication/delete on');
    });

    this.events.subscribe('UserPage/user/update', () => {
      this.loadMe();
      console.log('UserPage/user/update on');
    });

  }

  doRefresh(refresher){
    switch(this.actualSegment){
      case 'publications':
        this.conn.authorPublication(this.user.authorId).then(res => {
          this.publicationsData = res.json().data;
          this.publications = res.json().data;
          if(res.json().data.length){
            this.offsetPublications = this.constant.searchPublicationsHome;
          }
          refresher.complete();
        }).catch(err => refresher.complete());
        break;
      case 'saved':
        this.conn.saved().then(res => {
          this.savedData = res.json().data;
          this.saved = res.json().data;
          if(res.json().data.length){
            this.offsetSaved = this.constant.searchPublicationsHome;
          }
          refresher.complete();
        }).catch(err => refresher.complete());
        break;
      case 'liked':
        this.conn.liked().then(res => {
          this.liked = res.json().data;
          if(res.json().data.length){
            this.offsetLiked = this.constant.searchPublicationsHome;
          }
           refresher.complete();
        }).catch(err => refresher.complete());
    }
  }

  doInfinite(infiniteScroll){
    switch(this.actualSegment){
      case 'publications':
        if(!this.isSearchPublications){
          this.conn.authorPublication(this.user.authorId, this.offsetPublications).then(res => {
            this.publications = this.publications.concat(res.json().data);
            this.publicationsData = this.publications;
            if(res.json().data.length){
              this.offsetPublications+= this.constant.searchPublicationsHome;
            }
            infiniteScroll.complete();
          }).catch(err => {
            infiniteScroll.complete();
            console.log("Error in load publications in Infinite Scroll", err);
          });
        }else{
          this.conn.search(this.actualFilter, this.offsetSearch).then(res => {
            this.publications = this.publications.concat(res.json().data);
            this.searchData = this.publications;
            if(res.json().data.length){
              this.offsetSearch+= this.constant.searchPublicationsHome;
            }
            infiniteScroll.complete();
          }).catch(err => {
            infiniteScroll.complete();
            console.log("Error in load search publications in Infinite Scroll", err);
          });
        }
        break;
      case 'saved':
        if(!this.isSearchSaved){
          this.conn.saved(this.offsetSaved).then(res => {
            this.saved = this.saved.concat(res.json().data);
            this.savedData = this.saved;
            if(res.json().data.length){
              this.offsetSaved+= this.constant.searchPublicationsHome;
            }
            infiniteScroll.complete();
          }).catch(err => {
            infiniteScroll.complete();
            console.log("Error in load saved in Infinite Scroll", err);
          });
        }else{
          this.conn.search(this.actualFilter, this.offsetSearch).then(res => {
            this.saved = this.saved.concat(res.json().data);
            this.searchData = this.saved;
            if(res.json().data.length){
              this.offsetSearch+= this.constant.searchPublicationsHome;
            }
            infiniteScroll.complete();
          }).catch(err => {
            infiniteScroll.complete();
            console.log("Error in load search saved in Infinite Scroll", err);
          });
        }
        break;
      case 'liked':
        this.conn.liked(this.offsetLiked).then(res => {
          this.liked = this.liked.concat(res.json().data);
          if(res.json().data.length){
            this.offsetLiked+= this.constant.searchPublicationsHome;
          }
          infiniteScroll.complete();
        }).catch(err => {
          infiniteScroll.complete();
          console.log("Error in load liked in Infinite Scroll", err);
        });
        break;
    }
  }

}