import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDb1650273246051 implements MigrationInterface {
  name = "SeedDb1650273246051";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`);

    await queryRunner.query(
      //password is 123
      `INSERT INTO users (username, email, password) VALUES ('dovlas', 'dovlas@dovlas.com', '$2b$10$kXUF.7AHS9ADVlo5RPGpgOCNRj.8EQub1vTAtwUToWwe4v2wUQpk6')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, taglist, "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'coffee,dragons', 1), ('second-article', 'Second article', 'Second article description', 'Second article body', 'coffee,dragons', 1)`,
    );
  }

  public async down() {}
}
