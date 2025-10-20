/* eslint-disable */
/**
 * Auto-generated from search.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export const SEARCH_PACKAGE_NAME = 'search';

export interface SearchUsersRequest {
  query?: string;
  page?: number;
  limit?: number;
}

export interface SearchUsersResponse {
  users?: UserResult[];
  total?: number;
}

export interface UserResult {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}

export interface SearchPostsRequest {
  query?: string;
  page?: number;
  limit?: number;
}

export interface SearchPostsResponse {
  posts?: PostResult[];
  total?: number;
}

export interface PostResult {
  id?: string;
  userId?: string;
  content?: string;
  createdAt?: string;
}

export interface SearchAllRequest {
  query?: string;
  page?: number;
  limit?: number;
}

export interface SearchAllResponse {
  users?: UserResult[];
  posts?: PostResult[];
  totalUsers?: number;
  totalPosts?: number;
}

export interface IndexUserRequest {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface IndexPostRequest {
  id?: string;
  userId?: string;
  content?: string;
}

export interface RemoveUserIndexRequest {
  id?: string;
}

export interface RemovePostIndexRequest {
  id?: string;
}

export interface IndexResponse {
  success?: boolean;
}

export interface SearchService {
  SearchUsers(request: SearchUsersRequest): Observable<SearchUsersResponse>;
  SearchPosts(request: SearchPostsRequest): Observable<SearchPostsResponse>;
  SearchAll(request: SearchAllRequest): Observable<SearchAllResponse>;
  IndexUser(request: IndexUserRequest): Observable<IndexResponse>;
  IndexPost(request: IndexPostRequest): Observable<IndexResponse>;
  RemoveUserIndex(request: RemoveUserIndexRequest): Observable<IndexResponse>;
  RemovePostIndex(request: RemovePostIndexRequest): Observable<IndexResponse>;
}

export const SEARCHSERVICE_SERVICE_NAME = 'SearchService';

