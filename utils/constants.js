const CONSTANTS = {
  COLLECTIONS: {
    USER: "User",
    POST: "Post",
    FEEDBACK: "Feedback",
  },
  INDEXES: {
    GET_ALL_USERS: "get_all_users",
    GET_ALL_POSTS: "get_all_posts",
    GET_POSTS_BY_USER: "get_posts_by_user",
    GET_REPORTED_POSTS: "get_reported_posts",
    GET_POSTS_BY_COUNTRY: "get_posts_by_country",
    GET_ALL_FEEDBACKS: "get_all_feedbacks",
    UNIQUE_USER_USERNAME: "unique_User_username",
  },
  FUNCTIONS: {
    REGISTER_USER: "registerUser",
    LOGIN_USER: "loginUser",
    LOGOUT_USER: "logoutUser",
    ADD_POST: "addPost",
    ADD_FEEDBACK: "addFeedback",
    REPORT_POST: "reportPost",
    UNREPORT_POST: "unreportPost",
    ADD_LIKES: "addLikes",
    DELETE_POST: "deletePost",
    DELETE_USER: "deleteUser",
    GET_POSTS_BY_USER: "getPostsByUser",
    GET_REPORTED_POSTS: "getReportedPosts",
    GET_POSTS_BY_COUNTRY: "getPostsByCountry",
    GET_USER_ID: "getUserId",
  },
  ROLE: {
    USER: "USER",
  },
};

export default CONSTANTS;
