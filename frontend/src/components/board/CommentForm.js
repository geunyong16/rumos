// frontend/src/components/board/CommentForm.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const CommentForm = ({ postId, onCommentSubmit }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('board');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError(t('post.emptyComment'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onCommentSubmit({content});
      setContent('');
    } catch (err) {
      setError(err.message || 'Error submitting comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-100 p-4 rounded-md text-center text-gray-600">
        <p>로그인 후 댓글을 작성할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-medium mb-3">{t('post.writeComment')}</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="댓글을 입력하세요..."
          ></textarea>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {content.length}/1000
          </span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </div>
            ) : (
              t('post.submitComment')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;