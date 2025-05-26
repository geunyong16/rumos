import { useState, useEffect } from 'react';

/**
 * useForm 훅
 * - initialValues: 폼 초기값 객체
 * - validate: (fieldName, values) => errorMessage 또는 null
 * - onSubmit: (values) => Promise | void
 */
const useForm = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 초기 마운트 시 폼 초기화 (한 번만)
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsSubmitted(false);
  }, []);

  // 입력 변화 처리 (onChange)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: fieldValue }));
    // 변경 시 검증이 필요하다면 handleBlur와 유사하게 직접 호출
  };

  // 포커스 해제 시 해당 필드만 검증
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validate) {
      const error = validate(name, values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필드를 touched로 표시
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    // 전체 검증 실시
    let validationErrors = {};
    if (validate) {
      Object.keys(values).forEach((field) => {
        const error = validate(field, values);
        if (error) validationErrors[field] = error;
      });
    }
    setErrors(validationErrors);

    // 오류 없으면 onSubmit 호출
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsSubmitted(true);
      } catch (err) {
        console.error('폼 제출 중 에러:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 폼 초기 상태로 리셋
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsSubmitted(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
};

export default useForm;