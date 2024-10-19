import { Entity, Column } from 'typeorm';
import {
  BaseEntityMixin,
  IdEntity,
  TimestampEntity,
} from '../../core/mixins/entity-mixins';

@Entity('files')
export class File extends TimestampEntity(IdEntity(BaseEntityMixin)) {
  @Column()
  original_file_name: string;

  @Column()
  stored_file_name: string;

  @Column()
  storage_path: string;
}
