// src/booking/entities/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ParkingSlot} from "../../parking/entities/parking.entity";

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ParkingSlot, (slot) => slot.bookings, { eager: true })
    slot: ParkingSlot;

    @Column()
    duration: number;

    @Column({ type: 'timestamp' })
    createdAt: Date;
}