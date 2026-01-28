import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTokens } from '@/store/slices/authSlice';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SSOCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (accessToken && refreshToken) {
      dispatch(setTokens({ accessToken, refreshToken }));
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate, dispatch]);

  return <LoadingSpinner />;
}
