import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedParkingSlots1730628248210 implements MigrationInterface {
  name = 'SeedParkingSlots1730628248210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const slots = [
      { name: 'A1', top: 10, left: 10 },
      { name: 'A2', top: 10, left: 30 },
      { name: 'A3', top: 10, left: 50 },
      { name: 'A4', top: 10, left: 70 },
      { name: 'A5', top: 10, left: 90 },
      { name: 'B1', top: 30, left: 10 },
      { name: 'B2', top: 30, left: 30 },
      { name: 'B3', top: 30, left: 50 },
      { name: 'B4', top: 30, left: 70 },
      { name: 'B5', top: 30, left: 90 },
      { name: 'Power1', top: 55, left: 30 },
      { name: 'Power2', top: 55, left: 50 },
      { name: 'Power3', top: 55, left: 70 },
      { name: 'Power4', top: 55, left: 90 },
      { name: 'C1', top: 80, left: 10 },
      { name: 'C2', top: 80, left: 30 },
      { name: 'C3', top: 80, left: 50 },
      { name: 'C4', top: 80, left: 70 },
      { name: 'C5', top: 80, left: 90 },
    ];

    for (const slot of slots) {
      await queryRunner.query(
        `INSERT INTO "parking_slot" ("name", "isAvailable", "top", "left") VALUES ('${slot.name}', true, ${slot.top}, ${slot.left})`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "parking_slot"`);
  }
}
