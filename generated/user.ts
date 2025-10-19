/* eslint-disable */
/**
 * Auto-generated from user.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export interface GetUserByIdRequest {
  id?: string;
}

export interface GetUserByEmailRequest {
  email?: string;
}

export interface UpdateProfileRequest {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
}

export interface GetProfileRequest {
  id?: string;
}

export interface UserResponse {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
}

export interface FollowUserRequest {
  followerId?: string;
  followingId?: string;
}

export interface UnfollowUserRequest {
  followerId?: string;
  followingId?: string;
}

export interface FollowResponse {
  success?: boolean;
  message?: string;
}

export interface GetFollowersRequest {
  userId?: string;
  page?: number;
  limit?: number;
}

export interface GetFollowingRequest {
  userId?: string;
  page?: number;
  limit?: number;
}

export interface UsersListResponse {
  users?: UserResponse[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface UserService {
  GetUserById(request: GetUserByIdRequest): Observable<UserResponse>;
  GetUserByEmail(request: GetUserByEmailRequest): Observable<UserResponse>;
  UpdateProfile(request: UpdateProfileRequest): Observable<UserResponse>;
  GetProfile(request: GetProfileRequest): Observable<UserResponse>;
  FollowUser(request: FollowUserRequest): Observable<FollowResponse>;
  UnfollowUser(request: UnfollowUserRequest): Observable<FollowResponse>;
  GetFollowers(request: GetFollowersRequest): Observable<UsersListResponse>;
  GetFollowing(request: GetFollowingRequest): Observable<UsersListResponse>;
}

export const USERSERVICE_SERVICE_NAME = 'UserService';

