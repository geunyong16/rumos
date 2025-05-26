import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getBoardCategories,
  createPost,
  getPostById,
  updatePost,
} from '../services/boardService';
import { useAuth } from '../contexts/AuthContext';
import useForm from '../hooks/useForm';
import { validatePostForm } from '../utils/validators';

const CreatePost = () => {
  const { id } = useParams();               // id가 있으면 수정 모드
  const isEditMode = !!id;

  const navigate = useNavigate();
  const { t } = useTranslation('board');
  const { currentUser, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  const initialValues = {
    title: '',
    content: '',
    categoryId: '',
  };

  /* ---------- useForm 훅 ---------- */
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit: submitForm,
    setValues,
  } = useForm(initialValues, validatePostForm, onSubmit);

  /* ---------- 저장 ---------- */
  async function onSubmit(vals) {
    try {
      const payload = {
        title: vals.title,
        content: vals.content,
        category_id: vals.categoryId ? parseInt(vals.categoryId) : null, // snake-case 변환
      };

      if (isEditMode) {
        await updatePost(id, payload);
      } else {
        await createPost(payload);
      }
      navigate('/board');
    } catch (err) {
      setServerError(err.message || t('errors.saveFailed'));
      return false;
    }
  }

  /* ---------- 데이터 로딩 ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await getBoardCategories();   // 배열
        setCategories(cats);

        if (isEditMode) {
          const post = await getPostById(id);      // 단일 post 객체

          // 권한 체크
          if (
            !currentUser ||
            (currentUser.user_id !== post.user_id && currentUser.role !== 'admin')
          ) {
            navigate('/board');
            return;
          }

          setValues({
            title: post.title,
            content: post.content,
            categoryId: post.category_id ? String(post.category_id) : '',
          });
        }
      } catch (err) {
        setServerError(err.message || t('errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditMode, currentUser, navigate, setValues, t]);

  /* ---------- 인증 검사 ---------- */
  if (!isAuthenticated) {
    navigate('/board');
    return null;
  }

  /* ---------- 로딩 ---------- */
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  /* ---------- 화면 ---------- */
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? t('post.edit') : t('board.createPost')}
        </h1>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={submitForm} className="bg-white rounded-lg shadow-md p-6">
          {/* 제목 */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.title')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* 카테고리 */}
          <div className="mb-4">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.category')}
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={values.categoryId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-md ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">{t('allCategories')}</option>
              {Array.isArray(categories) &&
                categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {t(`categories.${c.name}`, { defaultValue: c.name })}
                  </option>
                ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* 내용 */}
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.content')} *
            </label>
            <textarea
              id="content"
              name="content"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={10}
              className={`w-full p-3 border rounded-md ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <Link
              to="/board"
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {t('post.cancel')}
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditMode ? t('post.edit') : t('post.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;