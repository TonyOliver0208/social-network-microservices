"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT = exports.PAGINATION = exports.UPLOAD = exports.CACHE_TTL = exports.CACHE_KEYS = exports.QUEUES = exports.SERVICES = exports.MESSAGES = exports.EVENTS = void 0;
exports.EVENTS = {
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_FOLLOWED: 'user.followed',
    USER_UNFOLLOWED: 'user.unfollowed',
    USER_REGISTERED: 'auth.user.registered',
    USER_LOGGED_IN: 'auth.user.logged_in',
    PASSWORD_RESET: 'auth.password.reset',
    POST_CREATED: 'post.created',
    POST_UPDATED: 'post.updated',
    POST_DELETED: 'post.deleted',
    POST_LIKED: 'post.liked',
    POST_UNLIKED: 'post.unliked',
    COMMENT_CREATED: 'comment.created',
    COMMENT_UPDATED: 'comment.updated',
    COMMENT_DELETED: 'comment.deleted',
    MEDIA_UPLOADED: 'media.uploaded',
    MEDIA_DELETED: 'media.deleted',
    SEARCH_INDEX_UPDATE: 'search.index.update',
    SEARCH_INDEX_DELETE: 'search.index.delete',
};
exports.MESSAGES = {
    AUTH_VALIDATE_TOKEN: 'auth.validate.token',
    AUTH_REGISTER: 'auth.register',
    AUTH_LOGIN: 'auth.login',
    AUTH_REFRESH_TOKEN: 'auth.refresh.token',
    AUTH_LOGOUT: 'auth.logout',
    AUTH_RESET_PASSWORD: 'auth.reset.password',
    USER_FIND_BY_ID: 'user.find.by.id',
    USER_FIND_BY_EMAIL: 'user.find.by.email',
    USER_UPDATE_PROFILE: 'user.update.profile',
    USER_GET_PROFILE: 'user.get.profile',
    USER_FOLLOW: 'user.follow',
    USER_UNFOLLOW: 'user.unfollow',
    USER_GET_FOLLOWERS: 'user.get.followers',
    USER_GET_FOLLOWING: 'user.get.following',
    USER_SEARCH: 'user.search',
    POST_CREATE: 'post.create',
    POST_GET: 'post.get',
    POST_UPDATE: 'post.update',
    POST_DELETE: 'post.delete',
    POST_FIND_BY_ID: 'post.find.by.id',
    POST_GET_FEED: 'post.get.feed',
    POST_GET_USER_POSTS: 'post.get.user.posts',
    POST_LIKE: 'post.like',
    POST_UNLIKE: 'post.unlike',
    POST_GET_LIKES: 'post.get.likes',
    COMMENT_CREATE: 'comment.create',
    COMMENT_UPDATE: 'comment.update',
    COMMENT_DELETE: 'comment.delete',
    COMMENT_GET_BY_POST: 'comment.get.by.post',
    COMMENT_GET_POST_COMMENTS: 'comment.get.post.comments',
    MEDIA_UPLOAD: 'media.upload',
    MEDIA_DELETE: 'media.delete',
    MEDIA_FIND_BY_ID: 'media.find.by.id',
    MEDIA_GET_USER_MEDIA: 'media.get.user.media',
    SEARCH_POSTS: 'search.posts',
    SEARCH_USERS: 'search.users',
    SEARCH_INDEX_POST: 'search.index.post',
    SEARCH_REMOVE_POST: 'search.remove.post',
};
exports.SERVICES = {
    API_GATEWAY: 'API_GATEWAY',
    AUTH_SERVICE: 'AUTH_SERVICE',
    USER_SERVICE: 'USER_SERVICE',
    POST_SERVICE: 'POST_SERVICE',
    MEDIA_SERVICE: 'MEDIA_SERVICE',
    SEARCH_SERVICE: 'SEARCH_SERVICE',
};
exports.QUEUES = {
    AUTH: 'auth_queue',
    USER: 'user_queue',
    POST: 'post_queue',
    MEDIA: 'media_queue',
    SEARCH: 'search_queue',
};
exports.CACHE_KEYS = {
    USER_PROFILE: (userId) => `user:profile:${userId}`,
    POST: (postId) => `post:${postId}`,
    POST_FEED: (userId, page) => `feed:${userId}:${page}`,
    USER_FEED: (userId) => `user:feed:${userId}`,
    USER_POSTS: (userId, page) => `user:posts:${userId}:${page}`,
    SEARCH_RESULTS: (query) => `search:${query}`,
    USER_FOLLOWERS: (userId) => `user:followers:${userId}`,
    USER_FOLLOWING: (userId) => `user:following:${userId}`,
};
exports.CACHE_TTL = {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
    VERY_LONG: 86400,
};
exports.UPLOAD = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/webm'],
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
exports.RATE_LIMIT = {
    WINDOW_MS: 60 * 1000,
    MAX_REQUESTS: 100,
};
//# sourceMappingURL=index.js.map