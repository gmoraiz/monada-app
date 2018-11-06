import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserEditPage } from './user-edit';
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [
    UserEditPage,
  ],
  imports: [
    IonicPageModule.forChild(UserEditPage),
    PipesModule
  ]
})
export class UserEditPageModule {}
