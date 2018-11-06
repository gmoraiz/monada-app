import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FolderPage } from './folder';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    FolderPage,
  ],
  imports: [
    IonicPageModule.forChild(FolderPage),
    ComponentsModule
  ],
})
export class FolderPageModule {}
