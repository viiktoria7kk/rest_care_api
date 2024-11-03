import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';

@Entity()
export class ParkingSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ type: 'int' })  // Add top column
    top: number;

    @Column({ type: 'int' })  // Add left column
    left: number;

    @OneToMany(() => Booking, (booking) => booking.slot)
    bookings: Booking[];
}