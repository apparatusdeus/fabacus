import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { EventDocument, EventModel } from './schemas/event.schema';

function numberLength(number: number): number {
  return number.toString().length;
}

function indexToSeatName(index: number, paddingSize: number): string {
  return 'S' + ((index + 1).toString()).padStart(paddingSize, '0');
}

function getSeatKey(eventId: string, seatName: string): string {
  return 'seat:' + eventId + ':' + seatName;
}

function getSeatsOnHoldKey(eventId: string): string {
  return 'event:' + eventId + ':seatsOnHold';
}

function expectUserToHoldSeat(userId: string, claimedUserId: string) {
  if (claimedUserId !== userId) {
    throw new HttpException({
      message: 'Seat is not held by user',
      error: 'Conflict',
    }, HttpStatus.CONFLICT);
  }
}

@Injectable()
export class EventsService {
  public constructor(
    @InjectModel(EventModel.name) private eventModel: Model<EventModel>,
    @Inject('RedisClient') private redisClient: Redis,
  ) {
  }

  public async createEvent(createEventDto: CreateEventDto): Promise<EventModel> {
    const numberOfSeats = createEventDto.numberOfSeats;
    const seatCountLength = numberLength(numberOfSeats);
    return this.eventModel.create({
      ...createEventDto,
      reservations: {},
      seats: Array(numberOfSeats)
        .fill(0)
        .map((_, index) => indexToSeatName(index, seatCountLength)),
    });
  }

  public async getEventByEventId(eventId: string): Promise<EventDocument> {
    return this.eventModel.findById(eventId).exec();
  }

  public async getSeatsOnHoldByEventId(eventId: string): Promise<string[]> {
    const seatsOnHoldKey = getSeatsOnHoldKey(eventId);
    const seats = await this.redisClient.smembers(seatsOnHoldKey);
    return seats.filter(async (seat) => {
      const hold = await this.redisClient.get(getSeatKey(eventId, seat));
      if (hold === null) {
        // If there isn't a hold for the seat, remove it from the list of seats on hold
        await this.redisClient.srem(seatsOnHoldKey, seat);
        return false;
      }
      return true;
    });
  }

  public async getAvailableSeatsByEventId(eventId: string): Promise<string[]> {
    const event = await this.getEventByEventId(eventId);
    const seats: string[] = event.seats;
    const seatsOnHold = await this.getSeatsOnHoldByEventId(eventId);
    const seatsReserved = Array.from(event.reservations.keys());
    console.log(seatsReserved);
    return seats.filter(seat => !seatsOnHold.includes(seat) && !seatsReserved.includes(seat));
  }

  public async findAllEvents(): Promise<EventModel[]> {
    return this.eventModel.find().exec();
  }

  public async holdSeat(eventId: string, seatName: string, userId: string): Promise<boolean> {
    const seatKey = getSeatKey(eventId, seatName);

    const event = await this.getEventByEventId(eventId);
    const seatsReserved = Array.from(event.reservations.keys());
    if (seatsReserved.includes(seatName)) {
      throw new HttpException({
        message: 'Seat is already reserved',
        error: 'Conflict',
      }, HttpStatus.CONFLICT);
    }

    // Try and reserve the seat for the user
    void await this.redisClient
      // Start a transaction
      .multi()
      // Try and reserve the seat for 30 seconds
      .set(seatKey, userId, 'EX', 60, 'NX')
      // Add the seat to the list of seats on hold (this does nothing if it already exists)
      .sadd(getSeatsOnHoldKey(eventId), seatName)
      .exec();

    const claimedUserId = await this.redisClient.get(seatKey);
    return claimedUserId === userId;
  }

  public async refreshSeatHold(eventId: string, seatName: string, userId: string): Promise<boolean> {
    const seatKey = getSeatKey(eventId, seatName);
    const claimedUserId = await this.redisClient.get(seatKey);

    expectUserToHoldSeat(userId, claimedUserId);

    return await this.redisClient.expire(seatKey, 60) === 1;
  }

  public async releaseSeatHold(eventId: string, seatName: string, userId: string): Promise<boolean> {
    const seatKey = getSeatKey(eventId, seatName);
    const claimedUserId = await this.redisClient.get(seatKey);

    expectUserToHoldSeat(userId, claimedUserId);

    await this.deleteHold(seatKey, eventId, seatName);
    return true;
  }

  public async reserveSeat(eventId: string, seatName: string, userId: string): Promise<boolean> {
    const seatKey = getSeatKey(eventId, seatName);
    const claimedUserId = await this.redisClient.get(seatKey);

    expectUserToHoldSeat(userId, claimedUserId);

    const event = await this.getEventByEventId(eventId);
    event.reservations.set(seatName, userId);
    await event.save();
    await this.deleteHold(seatKey, eventId, seatName);

    return true;
  }

  private async deleteHold(seatKey: string, eventId: string, seatName: string): Promise<void> {
    await this.redisClient.multi().del(seatKey).srem(getSeatsOnHoldKey(eventId), seatName).exec();
  }
}
