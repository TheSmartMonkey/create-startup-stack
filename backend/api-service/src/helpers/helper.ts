import { AwsHttpResponse, HttpResponse } from "@models/http.model";

export function formatHttpResponse<T>(response: HttpResponse<T>): AwsHttpResponse {
  return {
    statusCode: response.statusCode,
    body: JSON.stringify(response.body),
  };
}
