export const HTTP_CODES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  UNAUTHORIZED_401: 401,
  NOT_FOUND_404: 404,
};

type HttpStatusKeys = keyof typeof HTTP_CODES;
export type HttpStatusType = (typeof HTTP_CODES)[HttpStatusKeys];
