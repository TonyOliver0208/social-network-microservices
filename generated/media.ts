/* eslint-disable */
/**
 * Auto-generated from media.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export const MEDIA_PACKAGE_NAME = 'media';

export interface UploadMediaRequest {
  userId?: string;
  file?: Uint8Array;
  filename?: string;
  mimetype?: string;
  type?: string;
}

export interface MediaResponse {
  id?: string;
  userId?: string;
  url?: string;
  filename?: string;
  mimetype?: string;
  type?: string;
  size?: number;
  createdAt?: string;
}

export interface GetMediaRequest {
  id?: string;
}

export interface DeleteMediaRequest {
  id?: string;
  userId?: string;
}

export interface DeleteMediaResponse {
  success?: boolean;
}

export interface GetUserMediaRequest {
  userId?: string;
  page?: number;
  limit?: number;
}

export interface MediaListResponse {
  media?: MediaResponse[];
  total?: number;
}

export interface MediaService {
  UploadMedia(request: UploadMediaRequest): Observable<MediaResponse>;
  GetMedia(request: GetMediaRequest): Observable<MediaResponse>;
  DeleteMedia(request: DeleteMediaRequest): Observable<DeleteMediaResponse>;
  GetUserMedia(request: GetUserMediaRequest): Observable<MediaListResponse>;
}

export const MEDIASERVICE_SERVICE_NAME = 'MediaService';

