import { NgModule } from '@angular/core';
import { ImagePreloadDirective } from './image-preload/image-preload';
import { AutosizeDirective } from './autosize/autosize';
@NgModule({
	declarations: [ImagePreloadDirective,
    AutosizeDirective],
	imports: [],
	exports: [ImagePreloadDirective,
    AutosizeDirective]
})
export class DirectivesModule {}
