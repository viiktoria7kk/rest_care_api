import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export function IdEntity<T extends new (...args: any[]) => {}>(Base: T) {
  class IdEntityMixin extends Base {
    @PrimaryGeneratedColumn()
    id: number;
  }
  return IdEntityMixin;
}

export function TimestampEntity<T extends new (...args: any[]) => {}>(Base: T) {
  class TimestampEntityMixin extends Base {
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
  }
  return TimestampEntityMixin;
}
