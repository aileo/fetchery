export enum METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
}

export enum CONTENT_TYPE {
  TEXT = 'plain/text',
  CSV = 'text/csv',
  JSON = 'application/json',
  URLENCODED = 'application/x-www-form-urlencoded',
  BINARY = 'application/octet-stream',
  MULTIPART = 'multipart/form-data',
}

export enum CAST {
  JSON = 0,
  URL,
  FORMDATA,
}
