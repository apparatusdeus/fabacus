import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { CreateEventDto } from './dto/create-event.dto'
import { HoldSeatDto } from './dto/hold-seat.dto'
import { EventsService } from './events.service'
import { EventModel } from './schemas/event.schema'

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {
  }

  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<EventModel> {
    return this.eventsService.createEvent(createEventDto)
  }

  @Get(':eventId')
  async getByEventId(@Param('eventId') eventId: string): Promise<EventModel> {
    return this.eventsService.getEventByEventId(eventId)
  }

  @Get(':eventId/seats')
  async getAvailableSeatsByEventId(@Param('eventId') eventId: string): Promise<string[]> {
    return this.eventsService.getAvailableSeatsByEventId(eventId)
  }

  @Get()
  async findAll(): Promise<EventModel[]> {
    return this.eventsService.findAllEvents()
  }

  @Post(':eventId/holds')
  async holdSeat(@Param('eventId') eventId: string, @Body() holdSeatDto: HoldSeatDto): Promise<boolean> {
    return this.eventsService.holdSeat(eventId, holdSeatDto.seatName, holdSeatDto.userId)
  }

  @Get(':eventId/holds')
  async getSeatsOnHoldByEventId(@Param('eventId') eventId: string): Promise<string[]> {
    return this.eventsService.getSeatsOnHoldByEventId(eventId)
  }

  @Delete(':eventId/holds/:seatName')
  async releaseHold(@Param('eventId') eventId: string, @Param('seatName') seatName: string): Promise<boolean> {
    return this.eventsService.releaseSeatHold(eventId, seatName, 'userId??')
  }

  @Post(':eventId/reservations')
  async reserveSeat(@Param('eventId') eventId: string, @Body() holdSeatDto: HoldSeatDto): Promise<boolean> {
    return this.eventsService.reserveSeat(eventId, holdSeatDto.seatName, holdSeatDto.userId)
  }
}
