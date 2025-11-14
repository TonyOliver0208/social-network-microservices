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
  tags?: string[];
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

export interface Author {
  id?: string;
  name?: string;
  picture?: string;
  reputation?: number;
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
  author?: Author;
  tags?: TagResponse[];
  upvotes?: number;
  downvotes?: number;
  totalVotes?: number;
  userVote?: string;
  isFavorited?: boolean;
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

export interface TagResponse {
  id?: string;
  name?: string;
  description?: string;
  questionsCount?: number;
  createdAt?: string;
}

export interface GetTagsRequest {
  page?: number;
  limit?: number;
}

export interface GetPopularTagsRequest {
  limit?: number;
}

export interface TagsListResponse {
  tags?: TagResponse[];
  total?: number;
}

export interface GetPostsByTagRequest {
  tagName?: string;
  page?: number;
  limit?: number;
}

export interface CreateTagRequest {
  name?: string;
  description?: string;
}

export interface VoteQuestionRequest {
  questionId?: string;
  userId?: string;
  voteType?: string;
}

export interface VoteQuestionResponse {
  success?: boolean;
  upvotes?: number;
  downvotes?: number;
  totalVotes?: number;
  userVote?: string;
}

export interface GetQuestionVotesRequest {
  questionId?: string;
  userId?: string;
}

export interface QuestionVotesResponse {
  upvotes?: number;
  downvotes?: number;
  totalVotes?: number;
  userVote?: string;
}

export interface FavoriteQuestionRequest {
  questionId?: string;
  userId?: string;
  listName?: string;
}

export interface UnfavoriteQuestionRequest {
  questionId?: string;
  userId?: string;
}

export interface FavoriteQuestionResponse {
  success?: boolean;
  isFavorited?: boolean;
}

export interface GetUserFavoritesRequest {
  userId?: string;
  listName?: string;
  page?: number;
  limit?: number;
}

export interface FavoriteQuestionItem {
  id?: string;
  questionId?: string;
  listName?: string;
  createdAt?: string;
  question?: PostResponse;
}

export interface FavoriteQuestionsListResponse {
  favorites?: FavoriteQuestionItem[];
  total?: number;
  page?: number;
  limit?: number;
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
  GetTags(request: GetTagsRequest): Observable<TagsListResponse>;
  GetPopularTags(request: GetPopularTagsRequest): Observable<TagsListResponse>;
  GetPostsByTag(request: GetPostsByTagRequest): Observable<PostsListResponse>;
  CreateTag(request: CreateTagRequest): Observable<TagResponse>;
  VoteQuestion(request: VoteQuestionRequest): Observable<VoteQuestionResponse>;
  GetQuestionVotes(request: GetQuestionVotesRequest): Observable<QuestionVotesResponse>;
  FavoriteQuestion(request: FavoriteQuestionRequest): Observable<FavoriteQuestionResponse>;
  UnfavoriteQuestion(request: UnfavoriteQuestionRequest): Observable<FavoriteQuestionResponse>;
  GetUserFavorites(request: GetUserFavoritesRequest): Observable<FavoriteQuestionsListResponse>;
}

export const POSTSERVICE_SERVICE_NAME = 'PostService';

