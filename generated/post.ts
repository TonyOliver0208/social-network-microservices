/* eslint-disable */
/**
 * Auto-generated from post.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export const POST_PACKAGE_NAME = 'post';

export interface CreatePostRequest {
  userId?: string;
  content?: string;
  mediaUrls?: string[];
  visibility?: string;
}

export interface GetPostByIdRequest {
  id?: string;
}

export interface UpdatePostRequest {
  id?: string;
  userId?: string;
  content?: string;
  mediaUrls?: string[];
}

export interface DeletePostRequest {
  id?: string;
  userId?: string;
}

export interface PostResponse {
  id?: string;
  userId?: string;
  content?: string;
  mediaUrls?: string[];
  likesCount?: number;
  commentsCount?: number;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeletePostResponse {
  success?: boolean;
}

export interface GetUserPostsRequest {
  userId?: string;
  page?: number;
  limit?: number;
}

export interface GetFeedRequest {
  userId?: string;
  page?: number;
  limit?: number;
}

export interface PostsListResponse {
  posts?: PostResponse[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface LikePostRequest {
  postId?: string;
  userId?: string;
}

export interface UnlikePostRequest {
  postId?: string;
  userId?: string;
}

export interface LikeResponse {
  success?: boolean;
  likesCount?: number;
}

export interface CreateCommentRequest {
  postId?: string;
  userId?: string;
  content?: string;
}

export interface CommentResponse {
  id?: string;
  postId?: string;
  userId?: string;
  content?: string;
  createdAt?: string;
}

export interface GetCommentsRequest {
  postId?: string;
  page?: number;
  limit?: number;
}

export interface CommentsListResponse {
  comments?: CommentResponse[];
  total?: number;
}

export interface DeleteCommentRequest {
  id?: string;
  userId?: string;
}

export interface DeleteCommentResponse {
  success?: boolean;
}

export interface PostService {
  CreatePost(request: CreatePostRequest): Observable<PostResponse>;
  GetPostById(request: GetPostByIdRequest): Observable<PostResponse>;
  UpdatePost(request: UpdatePostRequest): Observable<PostResponse>;
  DeletePost(request: DeletePostRequest): Observable<DeletePostResponse>;
  GetUserPosts(request: GetUserPostsRequest): Observable<PostsListResponse>;
  GetFeed(request: GetFeedRequest): Observable<PostsListResponse>;
  LikePost(request: LikePostRequest): Observable<LikeResponse>;
  UnlikePost(request: UnlikePostRequest): Observable<LikeResponse>;
  CreateComment(request: CreateCommentRequest): Observable<CommentResponse>;
  GetComments(request: GetCommentsRequest): Observable<CommentsListResponse>;
  DeleteComment(request: DeleteCommentRequest): Observable<DeleteCommentResponse>;
}

export const POSTSERVICE_SERVICE_NAME = 'PostService';

