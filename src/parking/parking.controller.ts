import {
    Controller,
    Get,
    HttpCode,
    HttpStatus, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { AvailableSlotDto } from './dto/available-slot.dto';

@Controller('parking')
@ApiTags('parking')
export class ParkingController {
    constructor(private readonly parkingService: ParkingService) {}

    @Auth(AuthType.None)
    @Get('available-slots')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get available parking slots' })
    @ApiResponse({ status: 200, description: 'List of available parking slots.', type: [AvailableSlotDto] })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async getAvailableSlots(): Promise<AvailableSlotDto[]> {
        try {
            return await this.parkingService.getAvailableSlots();
        } catch (error) {
            // Log error or handle it as needed
            throw error;
        }
    }

    @Auth(AuthType.None)
    @Patch('update-available-slots')
    @HttpCode(HttpStatus.OK)
    async updateAvailableSlots(): Promise<void> {
        try {
            const availableSlots = await this.parkingService.getAvailableSlots();
            for (const slot of availableSlots) {
                await this.parkingService.updateSlotAvailability(slot.id, true);
            }
        } catch (error) {
            // Log error or handle it as needed
            throw error;
        }
    }
}