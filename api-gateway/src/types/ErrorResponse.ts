import { APIResponse } from './APIResponse';

export interface ErrorResponse extends APIResponse {
  success: false;
  error: string;
  stack?: string | undefined;
}