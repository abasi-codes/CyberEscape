import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerUser, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: FormData) => registerUser({ name: data.name, email: data.email, password: data.password });

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-cyber-primary" />
          <h1 className="mt-4 text-3xl font-bold">{t('app.title')}</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-cyber-border bg-cyber-card p-6">
          <h2 className="text-xl font-semibold">{t('auth.register')}</h2>
          {error && <div className="rounded-lg bg-cyber-danger/10 p-3 text-sm text-cyber-danger">{error}</div>}
          <Input id="name" label={t('auth.name')} {...register('name')} error={errors.name?.message} />
          <Input id="email" label={t('auth.email')} type="email" {...register('email')} error={errors.email?.message} />
          <Input id="password" label={t('auth.password')} type="password" {...register('password')} error={errors.password?.message} />
          <Input id="confirmPassword" label={t('auth.confirmPassword')} type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          <Button type="submit" className="w-full" loading={loading}>{t('auth.register')}</Button>
          <p className="text-center text-sm text-cyber-muted">
            {t('auth.hasAccount')} <Link to="/login" className="text-cyber-primary hover:underline">{t('auth.login')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
