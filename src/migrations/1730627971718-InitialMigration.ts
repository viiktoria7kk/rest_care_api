import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1730627971718 implements MigrationInterface {
    name = 'InitialMigration1730627971718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "original_file_name" character varying NOT NULL, "stored_file_name" character varying NOT NULL, "storage_path" character varying NOT NULL, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "avatar_file_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_65eb1fa7df7811daaec973798c" UNIQUE ("avatar_file_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "parking_slot" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "top" integer NOT NULL, "left" integer NOT NULL, CONSTRAINT "PK_e95575350468d6e392985b2bffb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booking" ("id" SERIAL NOT NULL, "duration" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "slotId" integer, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permission_role" ("permission_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_559155e68c73c7b70d216b3e2e9" PRIMARY KEY ("permission_id", "role_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ea144050277434b1ec4a307061" ON "permission_role" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_693f65986d1bd7b5bc973e30d7" ON "permission_role" ("role_id") `);
        await queryRunner.query(`CREATE TABLE "role_user" ("user_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_0d02ac0493a7a8193048bbc7da5" PRIMARY KEY ("user_id", "role_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5261e26da61ccaf8aeda8bca8e" ON "role_user" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_78ee37f2db349d230d502b1c7e" ON "role_user" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_65eb1fa7df7811daaec973798ce" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_15938898d719d91d6d9c41c43b8" FOREIGN KEY ("slotId") REFERENCES "parking_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permission_role" ADD CONSTRAINT "FK_ea144050277434b1ec4a3070614" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "permission_role" ADD CONSTRAINT "FK_693f65986d1bd7b5bc973e30d76" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_user" ADD CONSTRAINT "FK_5261e26da61ccaf8aeda8bca8ea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_user" ADD CONSTRAINT "FK_78ee37f2db349d230d502b1c7ea" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_user" DROP CONSTRAINT "FK_78ee37f2db349d230d502b1c7ea"`);
        await queryRunner.query(`ALTER TABLE "role_user" DROP CONSTRAINT "FK_5261e26da61ccaf8aeda8bca8ea"`);
        await queryRunner.query(`ALTER TABLE "permission_role" DROP CONSTRAINT "FK_693f65986d1bd7b5bc973e30d76"`);
        await queryRunner.query(`ALTER TABLE "permission_role" DROP CONSTRAINT "FK_ea144050277434b1ec4a3070614"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_15938898d719d91d6d9c41c43b8"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_65eb1fa7df7811daaec973798ce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78ee37f2db349d230d502b1c7e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5261e26da61ccaf8aeda8bca8e"`);
        await queryRunner.query(`DROP TABLE "role_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_693f65986d1bd7b5bc973e30d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea144050277434b1ec4a307061"`);
        await queryRunner.query(`DROP TABLE "permission_role"`);
        await queryRunner.query(`DROP TABLE "booking"`);
        await queryRunner.query(`DROP TABLE "parking_slot"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

}
