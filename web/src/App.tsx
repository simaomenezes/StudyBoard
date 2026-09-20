import { RegisterStudentUseCase } from './application/student/use-cases/register-student.use-case';
import { HttpStudentGateway } from './infrastructure/student/http-student.gateway';
import { useRegisterStudentController } from './interface/student/use-register-student.controller';
import { RegisterStudentForm } from './ui/student/RegisterStudentForm';
import { RegisterSuccess } from './ui/student/RegisterSuccess';

const studentGateway = new HttpStudentGateway();
const registerStudentPort = new RegisterStudentUseCase(studentGateway);

function App() {
  const controller = useRegisterStudentController(registerStudentPort);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-md px-4 py-10">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">StudyBoard</h1>
          <p className="mt-1 text-sm text-slate-600">Student registration</p>
        </header>

        <main className="rounded-2xl bg-white p-6 shadow">
          {controller.registered ? (
            <RegisterSuccess student={controller.registered} onRegisterAnother={controller.reset} />
          ) : (
            <RegisterStudentForm
              onSubmit={controller.submit}
              isSubmitting={controller.isSubmitting}
              serverError={controller.serverError}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
