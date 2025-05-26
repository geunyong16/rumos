// frontend/src/components/board/PostCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '../../utils/formatters';

const PostCard = ({ post }) => {
  const { t } = useTranslation('board');
  
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors duration-150">
      <Link to={`/board/${post.post_id}`} className="block">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            {post.category_name && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {t(`categories.${post.category_name}`, { defaultValue: post.category_name })}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate group-hover:text-indigo-600">
              {post.title}
            </h3>
            
            {/* Content Preview */}
            {post.content && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {post.content.length > 150 
                  ? `${post.content.substring(0, 150)}...` 
                  : post.content
                }
              </p>
            )}
            
            {/* Meta Information */}
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{post.username}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatRelativeTime(post.created_at)}</span>
                {post.created_at !== post.updated_at && (
                  <span className="ml-1 text-xs italic">
                    (수정됨)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views || 0}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comment_count || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;