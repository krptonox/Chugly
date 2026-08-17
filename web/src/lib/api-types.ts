export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type ApiErrorResponse = {
  statusCode: number;
  data: null;
  message: string;
  success: false;
  errors: unknown[];
};
