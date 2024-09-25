import { Entity, Column } from 'typeorm';
import { IdEntity, TimestampEntity } from '../../core/mixins/entity-mixins';

@Entity('files')
export class File extends TimestampEntity(IdEntity(class {})) {
  @Column()
  original_file_name: string;

  @Column()
  stored_file_namey: string;

  @Column()
  storage_path: string;
}
