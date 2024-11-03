import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1730632444063 implements MigrationInterface {
    name = 'UpdateUserEntity1730632444063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "date_of_birth" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD "car" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sex" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sex"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "car"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date_of_birth"`);
    }

}
