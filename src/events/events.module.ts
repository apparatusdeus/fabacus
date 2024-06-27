import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventModel, EventSchema } from './schemas/event.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: EventModel.name, schema: EventSchema }])],
  controllers: [EventsController],
  providers: [EventsService, {
    provide: 'RedisClient',
    useFactory: () => new Redis('redis://redis'),
  }],
})
export class EventsModule {
}
