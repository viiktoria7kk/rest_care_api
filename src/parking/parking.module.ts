// product_2/src/parking/parking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';
import { ParkingSlot } from './entities/parking.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ParkingSlot])],
    providers: [ParkingService],
    controllers: [ParkingController],
    exports: [ParkingService], // Export ParkingService to make it available in other modules
})
export class ParkingModule {}