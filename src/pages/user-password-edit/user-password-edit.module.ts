import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserPasswordEditPage } from './user-password-edit';

@NgModule({
  declarations: [
    UserPasswordEditPage,
  ],
  imports: [
    IonicPageModule.forChild(UserPasswordEditPage),
  ],
  exports: [
    UserPasswordEditPage
  ]
})
export class UserPasswordEditPageModule {}
