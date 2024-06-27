import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { EventsModule } from './events/events.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://mongodb/fabacus'), EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {
}
