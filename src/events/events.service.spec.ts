import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from 'redis-mock';
import { EventsService } from './events.service';
import { EventModel } from './schemas/event.schema';

const mockId = '667c3070b8c483fac67c5e29';
const mockIdError = 'error';
const mockEvent = {} as EventModel;

class MockEventModel {
  constructor(private _: any) {
    console.log('Created?');
  }

  new = jest.fn().mockResolvedValue({});
  save = jest.fn().mockResolvedValue(mockEvent);
  find = jest.fn().mockReturnThis();
  static create = jest.fn().mockReturnValue(mockEvent);
  findOneAndDelete = jest.fn().mockImplementation((id: string) => {
    if (id == mockIdError) throw new NotFoundException();
    return this;
  });
  exec = jest.fn().mockReturnValue(mockEvent);
  select = jest.fn().mockReturnThis();
  findOne = jest.fn().mockImplementation((id: string) => {
    if (id == mockIdError) throw new NotFoundException();
    return this;
  });
}

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, {
        provide: getModelToken(EventModel.name),
        useValue: MockEventModel,
      }, {
        provide: 'RedisClient',
        useFactory: () => createClient(),
      }],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new event', async () => {
    const expectedOutput = await service.createEvent({
      name: 'test',
      numberOfSeats: 10,
    });
    expect(MockEventModel.create).toHaveBeenCalledTimes(1);
    expect(expectedOutput).toEqual(mockEvent);
  });

  it('should return a specific event', async () => {
    const expectedOutput = await service.createEvent({
      name: 'test',
      numberOfSeats: 10,
    });
    expect(MockEventModel.create).toHaveBeenCalledTimes(1);
    expect(expectedOutput).toEqual(mockEvent);
  });
});
