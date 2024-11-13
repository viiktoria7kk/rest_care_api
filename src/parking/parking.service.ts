import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ParkingSlot} from './entities/parking.entity';
import {AvailableSlotDto} from './dto/available-slot.dto';

@Injectable()
export class ParkingService {
    constructor(
        @InjectRepository(ParkingSlot)
        private readonly parkingRepository: Repository<ParkingSlot>,
    ) {
    }

    async getAvailableSlots(): Promise<AvailableSlotDto[]> {
        return await this.parkingRepository.find();
    }


    async findSlotById(slotId: number): Promise<ParkingSlot> {
        const slot = await this.parkingRepository.findOne({where: {id: slotId}});
        if (!slot) {
            throw new NotFoundException('Parking slot not found');
        }
        return slot;
    }

    async updateSlotAvailability(slotId: number, isAvailable: boolean): Promise<void> {
        const result = await this.parkingRepository.update(slotId, {isAvailable});
        if (result.affected === 0) {
            throw new NotFoundException('Failed to update parking slot availability');
        }
    }



}