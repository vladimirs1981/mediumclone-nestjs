import { ConnectionOptions } from "typeorm";

const config: ConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "mediumclone",
  password: "123",
  database: "mediumclone",
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  synchronize: false,
  migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
  cli: {
    migrationsDir: "src/migrations",
  },
};

// export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
//   useFactory: async (): Promise<TypeOrmModuleOptions> => {
//     return {
//       type: "postgres" as "postgres",
//       host: "localhost",
//       port: 5432,
//       username: "mediumclone",
//       password: "123",
//       database: "mediumclone",
//       entities: [__dirname + "/**/*.entity{.ts,.js}"],
//       migrations: [__dirname + "/migrations/**/*.{.ts,.js}"],
//       cli: {
//         migrationsDir: "src/migrations",
//       },
//       extra: {
//         charset: "utf8mb4_unicode_ci",
//       },

//       synchronize: true,
//       logging: true,
//     };
//   },
// };

export default config;
