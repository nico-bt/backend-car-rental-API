import { Module } from '@nestjs/common';
import { CarModule } from './car/car.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [CarModule, ClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
