/* eslint-disable */
/**
 * Auto-generated from design.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export const DESIGN_PACKAGE_NAME = 'design';

export interface GetUserDesignsRequest {
  userId?: string;
}

export interface GetDesignByIdRequest {
  userId?: string;
  designId?: string;
}

export interface CreateDesignRequest {
  userId?: string;
  name?: string;
  thumbnailUrl?: string;
  designData?: string;
}

export interface UpdateDesignRequest {
  userId?: string;
  designId?: string;
  name?: string;
  thumbnailUrl?: string;
  designData?: string;
}

export interface DeleteDesignRequest {
  userId?: string;
  designId?: string;
}

export interface Design {
  id?: string;
  userId?: string;
  name?: string;
  thumbnailUrl?: string;
  designData?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignsResponse {
  success?: boolean;
  data?: Design[];
  message?: string;
}

export interface DesignResponse {
  success?: boolean;
  data?: Design;
  message?: string;
}

export interface DeleteResponse {
  success?: boolean;
  message?: string;
}

export interface DesignService {
  GetUserDesigns(request: GetUserDesignsRequest): Observable<DesignsResponse>;
  GetDesignById(request: GetDesignByIdRequest): Observable<DesignResponse>;
  CreateDesign(request: CreateDesignRequest): Observable<DesignResponse>;
  UpdateDesign(request: UpdateDesignRequest): Observable<DesignResponse>;
  DeleteDesign(request: DeleteDesignRequest): Observable<DeleteResponse>;
}

export const DESIGNSERVICE_SERVICE_NAME = 'DesignService';

