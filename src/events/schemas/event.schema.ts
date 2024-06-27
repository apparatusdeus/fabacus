import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type EventDocument = HydratedDocument<EventModel>;

@Schema()
export class EventModel {
  // @Prop()
  // id: string;

  @Prop()
  name: string

  @Prop()
  numberOfSeats: number

  @Prop()
  seats: string[]

  @Prop({type: Map, of: String, default: {}})
  reservations: Map<string, string>
}

export const EventSchema = SchemaFactory.createForClass(EventModel)
