import { UserType } from "./user.type";
export interface UserResponseInterface {
  user: UserType & { token: string };
  //here we are merging user entity with property token, that is what & do!
}
