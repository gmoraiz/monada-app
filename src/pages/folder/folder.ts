import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ConnProvider } from '../../providers/conn/conn';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { trigger, style, animate, transition } from '@angular/animations';

@IonicPage()
@Component({
  selector: 'page-folder',
  templateUrl: 'folder.html',
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
export class FolderPage{
  publications: Array<any> = [];
  folder: any = {};
  user: any = {};
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
  offsetPublications: number = 0;
  offsetSearch: number = 0;
  actualFilter: any;
  isSearch: boolean = false;
  openedSearch: boolean = false;
  
  constructor(public nav: NavController, public navParams: NavParams,
  public conn:ConnProvider, public constant: ConstantProvider, public storage: StorageProvider,
  public toast: ToastController, public actionSheetCtrl: ActionSheetController){
    this.folder = this.navParams.get('folder');
    this.user   = this.navParams.get('user');
    this.filter.author = this.user.username;
    this.filter.folderId = this.folder.id;
    this.conn.authorPublicationInFolder(this.user.authorId, this.folder.id).then(res => {
      this.publications = res.json().data;
      this.publicationsData = this.publications;
      this.setLoadingPublications(false);
      if(res.json().data.length){
        this.setPublicationsOffset();
      }
    }).catch(err => this.setLoadingPublications(false));

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

  doInfinite(infiniteScroll){
    if(!this.isSearch){
      this.conn.authorPublicationInFolder(this.user.authorId, this.folder.id, this.offsetPublications).then(res => {
        this.publications = this.publications.concat(res.json().data);
        this.publicationsData = this.publications;
        if(res.json().data.length){
          this.setPublicationsOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load author's folder publication in Infinite Scroll", err);
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
        console.log("Error in load search author's folder publications in Infinite Scroll", err);
      });
    }
  }

}
