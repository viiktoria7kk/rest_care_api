import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotDto {
    @ApiProperty({ description: 'Unique identifier for the parking slot' })
    id: number;

    @ApiProperty({ description: 'Name or label of the parking slot' })
    name: string;

    @ApiProperty({ description: 'Availability status of the parking slot', default: true })
    isAvailable: boolean;
}