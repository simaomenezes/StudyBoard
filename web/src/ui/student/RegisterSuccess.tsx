import type { RegisterStudentViewModel } from '../../interface/student/student.presenter';

interface Props {
  student: RegisterStudentViewModel;
  onRegisterAnother: () => void;
}

export function RegisterSuccess({ student, onRegisterAnother }: Props) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-green-600" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Student registered!</h2>
      <dl className="mx-auto mt-4 max-w-sm space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium text-slate-900">{student.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium text-slate-900">{student.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Student number</dt>
          <dd className="font-medium text-slate-900">{student.studentNumber}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onRegisterAnother}
        className="mt-4 w-full rounded-lg border border-indigo-600 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
      >
        Register another student
      </button>
    </div>
  );
}
