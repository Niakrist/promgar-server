import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { RollingBodiesService } from './rolling-bodies.service';
import { RollingBodiesController } from './rolling-bodies.controller';
import { LoadDirectionsService } from './load-directions.service';
import { LoadDirectionsController } from './load-directions.controller';
import { RowCountsController } from './row-counts.controller';
import { BearingTypesController } from './bearing-types.controller';
import { RowCountsService } from './row-counts.service';
import { BearingTypesService } from './bearing-types.service';

@Module({
  controllers: [
    BrandsController,
    RollingBodiesController,
    LoadDirectionsController,
    RowCountsController,
    BearingTypesController,
  ],
  providers: [
    BrandsService,
    RollingBodiesService,
    LoadDirectionsService,
    RowCountsService,
    BearingTypesService,
  ],
})
export class DictionariesModule {}
