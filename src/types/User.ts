// src/types/User.ts
export type UserWithRole = {
  id: string;
  email: string;
  user_metadata: {
    user_role: string;
    [key: string]: any;
  };
  [key: string]: any;
};
