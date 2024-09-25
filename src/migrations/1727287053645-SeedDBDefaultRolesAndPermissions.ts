import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDBDefaultRolesAndPermissions1727287053645
  implements MigrationInterface
{
  name = 'SeedDBDefaultRolesAndPermissions1727287053645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("name", "description") VALUES
      ('READ', 'Read permission'),
      ('WRITE', 'Write permission'),
      ('DELETE', 'Delete permission'),
      ('UPDATE', 'Update permission'),
      ('CREATE', 'Create permission')
    `);

    await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES
      ('Admin'),
      ('User'),
      ('Manager'),
      ('Guest')
    `);

    await queryRunner.query(`
      INSERT INTO "permission_role" ("permission_id", "role_id")
      SELECT p.id, r.id
      FROM permissions p, roles r
      WHERE p.name IN ('READ', 'WRITE', 'DELETE', 'UPDATE', 'CREATE') AND r.name = 'Admin'
    `);

    await queryRunner.query(`
      INSERT INTO "permission_role" ("permission_id", "role_id")
      SELECT p.id, r.id
      FROM permissions p, roles r
      WHERE p.name IN ('READ', 'WRITE', 'UPDATE') AND r.name = 'Manager'
    `);

    await queryRunner.query(`
      INSERT INTO "permission_role" ("permission_id", "role_id")
      SELECT p.id, r.id
      FROM permissions p, roles r
      WHERE p.name = 'READ' AND r.name = 'User'
    `);

    await queryRunner.query(`
      INSERT INTO "permission_role" ("permission_id", "role_id")
      SELECT p.id, r.id
      FROM permissions p, roles r
      WHERE p.name = 'READ' AND r.name = 'Guest'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permission_role"
      WHERE "role_id" IN (SELECT id FROM roles WHERE name IN ('Admin', 'User', 'Manager', 'Guest'))
    `);

    await queryRunner.query(`
      DELETE FROM "roles" WHERE name IN ('Admin', 'User', 'Manager', 'Guest')
    `);

    await queryRunner.query(`
      DELETE FROM "permissions" WHERE name IN ('READ', 'WRITE', 'DELETE', 'UPDATE', 'CREATE')
    `);
  }
}
