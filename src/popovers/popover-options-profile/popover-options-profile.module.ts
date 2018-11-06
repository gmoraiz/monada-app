import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverOptionsProfilePage } from './popover-options-profile';

@NgModule({
  declarations: [
    PopoverOptionsProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverOptionsProfilePage),
  ],
})
export class PopoverOptionsProfilePageModule {}
