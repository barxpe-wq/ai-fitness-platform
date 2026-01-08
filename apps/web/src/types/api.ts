export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "TRAINER" | "CLIENT";
  };
};

export type MeResponse = {
  id: string;
  email: string;
  role: "ADMIN" | "TRAINER" | "CLIENT";
};

export type ErrorResponse = {
  error: {
    code:
      | "VALIDATION_ERROR"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "INTERNAL_ERROR";
    message: string;
  };
};

export type ClientListItem = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export type ClientDetails = ClientListItem;

export type Plan = {
  id: string;
  clientId: string;
  title: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CheckIn = {
  id: string;
  clientId: string;
  date: string;
  weightKg: number | null;
  waistCm: number | null;
  notes: string | null;
  createdAt: string;
};
