import { NgModule } from '@angular/core';
import { PublicationComponent } from './publication/publication';
import { ProfileComponent } from './profile/profile';
import { FoldersComponent } from './folders/folders';
import { IonicModule } from "ionic-angular";
import { CommonModule } from '@angular/common';
import { PipesModule } from '../pipes/pipes.module';
import { TruncateModule } from 'ng2-truncate';

@NgModule({
	imports:[IonicModule, CommonModule, PipesModule, TruncateModule],
	declarations: [PublicationComponent, ProfileComponent, FoldersComponent],
	exports: [PublicationComponent, ProfileComponent, FoldersComponent]
})
export class ComponentsModule {}
