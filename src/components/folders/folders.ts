import { Component, Input } from '@angular/core';
import { NavController } from "ionic-angular";

@Component({
  selector: 'folders',
  templateUrl: 'folders.html'
})
export class FoldersComponent {

  @Input('folders') folders;
  @Input('user') user;

  constructor(public nav: NavController){
  }

  openFolder(folder: any){
    this.nav.push('FolderPage', {folder: folder, user: this.user});
  }

}
