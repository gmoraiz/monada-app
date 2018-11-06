import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PublicationPage } from './publication';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    PublicationPage,
  ],
  imports: [
    IonicPageModule.forChild(PublicationPage),
    ComponentsModule
  ],
})
export class PublicationPageModule {}
