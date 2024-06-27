import { Length } from 'class-validator'

export class HoldSeatDto {
  @Length(2, 5)
  seatName: string

  @Length(24, 24)
  userId: string
}
