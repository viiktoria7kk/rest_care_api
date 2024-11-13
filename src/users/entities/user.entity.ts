import { IdEntity, TimestampEntity } from '../../core/mixins/entity-mixins';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { File } from '../../files/entities/file.entity';

@Entity('users')
export class User extends TimestampEntity(IdEntity(class {})) {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  avatar_file_id: number;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  car: string;

  @Column({ nullable: true })
  sex: string;

  @OneToOne(() => File)
  @JoinColumn({ name: 'avatar_file_id' })
  avatarFile: File;

  @Column({ nullable: true })
  avatar: string;

  @ManyToMany(() => Role, (role) => role.users, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'role_user',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
