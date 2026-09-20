import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerStudentSchema,
  type RegisterStudentFormValues,
} from '../../infrastructure/student/register-student.schema';

interface Props {
  onSubmit: (values: RegisterStudentFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  serverError: string | null;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200';

export function RegisterStudentForm({ onSubmit, isSubmitting, serverError }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
  });

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          const ok = await onSubmit(values);
          if (ok) reset();
        })(event);
      }}
      noValidate
      className="space-y-4"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input id="name" type="text" autoComplete="name" className={inputClass} {...register('name')} />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ada@example.com"
          className={inputClass}
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="studentNumber" className="mb-1 block text-sm font-medium text-slate-700">
          Student number
        </label>
        <input
          id="studentNumber"
          type="text"
          autoComplete="off"
          placeholder="S-001"
          className={inputClass}
          {...register('studentNumber')}
        />
        {errors.studentNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.studentNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={inputClass}
          {...register('password')}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Registering…' : 'Register student'}
      </button>
    </form>
  );
}
