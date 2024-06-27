import { IsInt, Length, Max, Min } from 'class-validator'

export class CreateEventDto {
  @Length(5, 40)
  name: string;

  @IsInt()
  @Min(10)
  @Max(1000)
  numberOfSeats: number;
}
