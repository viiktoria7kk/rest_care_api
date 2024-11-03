import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ParkingService } from '../parking/parking.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class BookingCleanupService {
  private readonly logger = new Logger(BookingCleanupService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly parkingService: ParkingService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredSlots() {
    const now = new Date();
    const expiredBookings = await this.bookingRepository.find({
      where: {
        createdAt: LessThan(new Date(now.getTime() - 3600 * 1000)), // assuming 1 hour duration for expiration
      },
      relations: ['slot'],
    });

    for (const booking of expiredBookings) {
      await this.parkingService.updateSlotAvailability(booking.slot.id, true);
      await this.bookingRepository.delete(booking.id);
      this.logger.log(`Slot ${booking.slot.id} is now available.`);
    }
  }
}
