import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { ParkingService } from '../parking/parking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        private parkingService: ParkingService,
    ) {}

    async bookSlot(createBookingDto: CreateBookingDto): Promise<{ success: boolean }> {
        const { slotId, duration } = createBookingDto;

        return await this.bookingRepository.manager.transaction(async (entityManager: EntityManager) => {
            const slot = await this.parkingService.findSlotById(slotId);

            if (!slot.isAvailable) {
                throw new BadRequestException('Parking slot is not available for booking');
            }

            const booking = this.bookingRepository.create({
                slot,
                duration,
                createdAt: new Date(),
            });

            await entityManager.save(booking);
            await this.parkingService.updateSlotAvailability(slotId, false);

            // Встановлення таймера на звільнення слоту
            setTimeout(async () => {
                await this.parkingService.updateSlotAvailability(slotId, true);
                await this.bookingRepository.delete(booking.id);
            }, duration * 60 * 60 * 1000); // час у мілісекундах

            return { success: true };
        });
    }

}