// src/booking/dto/create-booking.dto.ts
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateBookingDto {
    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    slotId: number;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    duration: number; // Duration in hours
}