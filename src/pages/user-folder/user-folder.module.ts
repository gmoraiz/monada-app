import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserFolderPage } from './user-folder';

@NgModule({
  declarations: [
    UserFolderPage,
  ],
  imports: [
    IonicPageModule.forChild(UserFolderPage),
  ],
})
export class UserFolderPageModule {}
