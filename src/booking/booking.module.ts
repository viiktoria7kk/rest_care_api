// product_2/src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { ParkingModule } from '../parking/parking.module';
import {BookingCleanupService} from "./booking-cleanup.service"; // Import ParkingModule

@Module({
    imports: [TypeOrmModule.forFeature([Booking]), ParkingModule], // Add ParkingModule to imports
    providers: [BookingService, BookingCleanupService],
    controllers: [BookingController],
})
export class BookingModule {}