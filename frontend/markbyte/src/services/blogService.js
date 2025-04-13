import axios from "axios";
import { API_URL } from "@/config/api";

export const publishBlogVersion = (username, title, version) => {
  return axios.post(
    `${API_URL}/publish`,
    { username, title, version },
    { withCredentials: true }
  );
};

export const deleteBlogPost = (title) => {
  return axios.post(`${API_URL}/delete`, { title }, { withCredentials: true });
};

export const uploadMarkdownFile = (file, title = null) => {
  const formData = new FormData();
  if (title) {
    formData.append("title", title);
  }
  formData.append("file", file);
  return axios.post(`${API_URL}/upload`, formData, { withCredentials: true });
};

export const uploadZipFile = (file) => {
  const formData = new FormData();
  formData.append("zipfile", file);
  return axios.post(`${API_URL}/zipupload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

export const getMarkdownVersion = (title, version) => {
  return axios.post(
    `${API_URL}/markdown`,
    { title, version },
    { withCredentials: true }
  );
};

export const renderMarkdownPreview = (markdownContent) => {
  return axios.post(
    `${API_URL}/render`,
    { markdown_content: markdownContent },
    { withCredentials: true }
  );
};

export const getBlogPost = (username, title) => {
  return axios.get(`${API_URL}/${username}/${title}`);
};

export const fetchUserBlogPosts = () => {
  return axios.get(`${API_URL}/user/blog_posts`, {
    withCredentials: true,
  });
};

export const fetchBlogPosts = (user) => {
  return axios.get(`${API_URL}/user/posts`, {
    params: {
      user: user,
    },
  });
};
