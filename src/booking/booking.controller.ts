import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('booking')
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    @ApiOperation({ summary: 'Book a parking slot' })
    @ApiBody({ type: CreateBookingDto })
    @ApiResponse({ status: 200, description: 'Successfully booked the parking slot.' })
    @ApiResponse({ status: 400, description: 'Slot is already booked.' })
    @ApiResponse({ status: 404, description: 'Parking slot not found.' })
    async bookSlot(@Body() createBookingDto: CreateBookingDto): Promise<{ success: boolean }> {
        return this.bookingService.bookSlot(createBookingDto);
    }
}