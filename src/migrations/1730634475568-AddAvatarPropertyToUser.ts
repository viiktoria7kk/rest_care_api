import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarPropertyToUser1730634475568 implements MigrationInterface {
    name = 'AddAvatarPropertyToUser1730634475568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    }

}
