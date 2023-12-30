import { Module } from '@nestjs/common';
import { CarModule } from './car/car.module';
import { ClientModule } from './client/client.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [CarModule, ClientModule, TransactionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
