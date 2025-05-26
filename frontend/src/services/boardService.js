// src/services/boardService.js
import { api } from './api';

/**
 * 카테고리 불러오기
 * GET  /api/board/categories
 * 응답: { categories: [...] }
 */
export async function getBoardCategories() {
  const res = await api.get('/board/categories');
  // API가 { categories: [...] } 로 응답한다면
  if (Array.isArray(res.data.categories)) {
    return res.data.categories;
  }
  // 혹시 배열만 던진다면
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * 모든 게시글 조회
 * GET  /api/board/posts?page=1&limit=10&category_id=3&search=foo
 * 응답: { posts: [...], pagination: { total, page, limit, totalPages } }
 */
export async function getAllPosts({ page = 1, limit = 10, category_id = null, search = ''} = {}) {
  const params = { page, limit };
  if (category_id) params.category_id = category_id;
  if (search)      params.search      = search;

  const res = await api.get('/board/posts', { params });

  return {
    posts:      Array.isArray(res.data.posts)      ? res.data.posts      : [],
    pagination: res.data.pagination || { total: 0, page, limit, totalPages: 1 }
  };
}

/**
 * 단일 게시글 조회
 * GET  /api/board/posts/:id
 * 응답: { post: {...} }
 */
export async function getPostById(id) {
  const res = await api.get(`/board/posts/${Number(id)}`);
  return res.data.post;
}

/* 게시글 작성 --------------------------------------------------------- */
export async function createPost({ title, content, categoryId = null }) {
  const payload = {
    title,
    content,
    category_id: categoryId      
  };
  const res = await api.post('/board/posts', payload);
  return res.data.post;
}

/* 게시글 수정 --------------------------------------------------------- */
export async function updatePost(id, { title, content, categoryId = null }) {
  const payload = {
    title,
    content,
    category_id: categoryId      // ← 필드명 변환
  };
  const res = await api.put(`/board/posts/${id}`, payload);
  return res.data.post;
}

/**
 * 게시글 삭제
 * DELETE /api/board/posts/:id
 */
export async function deletePost(id) {
  const res = await api.delete(`/board/posts/${id}`);
  return res.data.message;
}

/**
 * 댓글 생성
 * POST /api/board/posts/:postId/comments
 */
export async function createComment(postId, commentData) {
  const res = await api.post(`/board/posts/${postId}/comments`, commentData);
  return res.data.comment;
}

/**
 * 댓글 수정
 * PUT /api/board/comments/:commentId
 */
export async function updateComment(commentId, commentData) {
  const res = await api.put(`/board/comments/${commentId}`, commentData);
  return res.data.comment;
}

/**
 * 댓글 삭제
 * DELETE /api/board/comments/:commentId
 */
export async function deleteComment(commentId) {
  const res = await api.delete(`/board/comments/${commentId}`);
  return res.data.message;
}

export const getAgentProfile = async () => {
  const { data } = await api.get('/agents/profile');
  return data.agentProfile;                // { company_name, office_address, ... }
};

export const getAgentProperties = async () => {
  const { data } = await api.get('/agents/properties');
  return data.properties;                  // [ { property_id, ... }, ... ]
};