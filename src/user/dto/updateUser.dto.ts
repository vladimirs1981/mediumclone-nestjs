import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  readonly username: string;

  readonly email: string;

  readonly image: string;

  readonly bio: string;
}
