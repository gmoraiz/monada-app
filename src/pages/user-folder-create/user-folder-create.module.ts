import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserFolderCreatePage } from './user-folder-create';

@NgModule({
  declarations: [
    UserFolderCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(UserFolderCreatePage),
  ],
})
export class UserFolderCreatePageModule {}
