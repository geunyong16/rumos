import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  getPostById,
  createComment,
  deletePost,
  deleteComment,
} from '../services/boardService';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/formatters';
import CommentForm from '../components/board/CommentForm';

const BoardDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation('board');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const postdata = await getPostById(id);
        setPost(postdata);
        setComments(postdata.comments || []);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  /* ---------- 댓글 생성 ---------- */
  const handleCommentSubmit = async ({ content }) => {
    if (!post) return;

    try {
      const newComment = await createComment(post.post_id, { content });
      setComments((prev) => [...prev, newComment]);
      toast.success('댓글이 등록되었습니다.');
      return true;
    } catch (err) {
      console.error('Error creating comment:', err);
      toast.error('댓글 등록에 실패했습니다.');
      throw new Error(err.message || 'Failed to submit comment');
    }
  };

  /* ---------- 게시글 삭제 ---------- */
  const handleDelete = async () => {
    if (!post) return;

    try {
      await deletePost(post.post_id);
      toast.success('게시글이 삭제되었습니다.');
      navigate('/board');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('게시글 삭제에 실패했습니다.');
      setError(err.message || 'Failed to delete post');
    }
  };

  /* ---------- 댓글 삭제 ---------- */
  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.comment_id !== commentId));
      setCommentDeleteId(null);
      toast.success('댓글이 삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('댓글 삭제에 실패했습니다.');
      setError(err.message || 'Failed to delete comment');
    }
  };

  /* ---------- 로딩/에러 처리 ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error || 'Post not found'}</h3>
                <div className="mt-4">
                  <Link to="/board" className="text-sm font-medium text-red-800 hover:text-red-700">
                    게시판으로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canEditOrDelete =
    currentUser && (currentUser.user_id === post.user_id || currentUser.role === 'admin');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/board" className="text-indigo-600 hover:text-indigo-500 flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                게시판으로 돌아가기
              </Link>
            </li>
          </ol>
        </nav>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <div className="flex items-center text-sm text-gray-500 space-x-6">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">{post.username}</span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formatRelativeTime(post.created_at)}</span>
                    {post.created_at !== post.updated_at && (
                      <span className="ml-2 text-xs italic">(수정됨)</span>
                    )}
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>조회 {post.views || 0}</span>
                  </div>
                </div>
              </div>

              {canEditOrDelete && (
                <div className="flex space-x-2">
                  <Link
                    to={`/board/edit/${post.post_id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {/* Category Badge */}
            {post.category_name && (
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {t(`categories.${post.category_name}`, { defaultValue: post.category_name })}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              댓글 ({comments.length})
            </h2>

            {comments.length > 0 ? (
              <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                  <div
                    key={comment.comment_id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-900">{comment.username}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                          {comment.created_at !== comment.updated_at && (
                            <span className="ml-2 text-xs italic text-gray-500">(수정됨)</span>
                          )}
                        </div>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {currentUser &&
                        (currentUser.user_id === comment.user_id || currentUser.role === 'admin') && (
                          <button
                            onClick={() => setCommentDeleteId(comment.comment_id)}
                            className="ml-4 text-sm text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
              </div>
            )}

            {/* Comment Form */}
            <CommentForm postId={post.post_id} onCommentSubmit={handleCommentSubmit} />
          </div>
        </div>

        {/* 게시글 삭제 확인 모달 */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">게시글 삭제</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 px-4 py-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 댓글 삭제 확인 모달 */}
        {commentDeleteId && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">댓글 삭제</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    정말로 이 댓글을 삭제하시겠습니까?
                  </p>
                </div>
                <div className="flex justify-center space-x-4 px-4 py-3">
                  <button
                    onClick={() => setCommentDeleteId(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleCommentDelete(commentDeleteId)}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;