# StudyBoard — Agent Instructions

StudyBoard is a student-facing academic management system.
Students log in to track enrolled courses, professors, exams, homework, and grades across semesters, with automatic grade calculation and full retake history.

> Full business rules live in the skill `studyboard-business-rules`.
> Load that skill whenever modeling, validating, or scaffolding StudyBoard domain, application, or persistence logic.

## 1. Ubiquitous Language (use these names, not synonyms)

| Term | Meaning |
|---|---|
| `STUDENT` | Student. Only actor that authenticates. |
| `PROFESSOR` | Professor. Reference data only, no login. |
| `COURSE` | Generic course (e.g. Calculus I). No semester, no professor, no grades. |
| `COURSE_OFFERING` | One offering of a COURSE in a semester/year by one professor. Grades, assessments, enrollments attach here. |
| `ENROLLMENT` | Enrollment linking one STUDENT to one COURSE_OFFERING. Holds `final_average` (derived). |
| `ASSESSMENT` | Unified evaluation (exam or homework). Belongs to one COURSE_OFFERING. Has `type`, `title`, `date`, `weight`. |
| `GRADE` | One raw score for one student on one assessment. |
| `PASSWORD_RESET` | Password-reset request with single-use time-boxed token. |

Cross-aggregate references are by ID only. Never embed object graphs.

## 2. Business Rules (normative)

### Authentication & access
- Only `STUDENT` authenticates via `email + password` (`password_hash`). `PROFESSOR` has no credentials, no login, no token.
- `STUDENT.email` and `student_number` are unique.
- Password reset: each request creates one `PASSWORD_RESET` row with `token` (unique), `created_at`, `expires_at`, `used_at` (nullable).
- A token is valid iff `used_at IS NULL AND NOW() <= expires_at`. Single use only. Default expiry: 2h after creation.
- Student actors may only read/write their own `ENROLLMENT`, `GRADE`, `PASSWORD_RESET`. All back-office writes go through a separate Admin context.

### COURSE vs COURSE_OFFERING
- `COURSE`: generic catalog entry (`name`, `code` unique, `workload_hours > 0`). Independent of time/professor.
- `COURSE_OFFERING`: specific offering (`course_id FK`, `professor_id FK`, `semester`, `year`, `status`). Exactly one professor per offering.
- All of `ENROLLMENT`, `ASSESSMENT`, `GRADE` attach to `COURSE_OFFERING`, never directly to `COURSE`.
- `COURSE_OFFERING.status` is a simple enum: `in_progress | closed`.
  - `in_progress`: enrollments, assessments, grades allowed.
  - `closed`: blocks any new `INSERT/UPDATE` on `ENROLLMENT`, `ASSESSMENT`, `GRADE` for that offering. Enforced in domain + DB.

### Enrollment
- `ENROLLMENT(student_id, offering_id)` is unique. One row per attempt.
- Retakes are separate `COURSE_OFFERING` rows of the same `COURSE`. History is preserved, never overwritten.
- `final_average` is derived, never input manually.

### Assessments and grades
- `ASSESSMENT` belongs to exactly one `COURSE_OFFERING`. `type` in `exam | homework`. `weight NUMERIC > 0`. Weights do NOT need to sum to 100; calculation normalizes.
- `GRADE(assessment_id, student_id)` is unique. Exactly one grade per student per assessment. `score` in `0-10`.
- A `GRADE` requires a matching `ENROLLMENT` (student must be enrolled in the assessment's offering). No orphan grades. No grades on `closed` offering.

### Automatic grade calculation (decided: SQL View)
- `final_average = SUM(grade.score * assessment.weight) / SUM(assessment.weight)` over all assessments of the offering for that student.
- Missing grades are excluded from the sums (not treated as zero).
- Implemented as a SQL View (e.g. `vw_final_average`). The application never computes or persists it independently. `ENROLLMENT.final_average` is read through the view to stay in sync on every grade insert/update.

## 3. Validation Matrix (enforce in Value Objects + DB CHECKs)

| Field | Rule |
|---|---|
| `STUDENT.email`, `PROFESSOR.email` | valid format, lowercased, unique |
| `COURSE.code` | unique, non-empty |
| `COURSE.workload_hours` | integer > 0 |
| `COURSE_OFFERING.semester/year` | non-empty / valid year |
| `ASSESSMENT.type` | `exam \| homework` |
| `ASSESSMENT.weight` | `> 0` |
| `GRADE.score` | `0 <= x <= 10` |
| `PASSWORD_RESET.token` | unique, single-use, time-boxed |

FK delete policy: `ON RESTRICT` for `COURSE_OFFERING`/`STUDENT` with history. Never cascade-delete grades or enrollments.

## 4. Architecture Constraints

- Follow `clean-architecture-nestjs` + `ddd-tactical-nestjs`: `src/domain/` has zero `@nestjs/*`, `typeorm`, `prisma` imports.
- Rich domain: factories + behavior methods (`CourseOffering.close()`, `Student.requestPasswordReset()`), Value Objects self-validate.
- One aggregate root guards its invariants. Use domain events for cross-aggregate sync.
- Controllers are thin. Use cases depend on repository ports, implementations live in `infrastructure/` with mappers.
- Admin writes (`AdminCreateOffering`, `AdminAssignGrade`, `AdminCloseOffering`) are separate use cases from student reads (`ListStudentHistory`).

## 5. Never Do

- Never let `PROFESSOR` log in or issue tokens.
- Never attach grades/enrollments to `COURSE`.
- Never compute `final_average` in application code or accept it as input.
- Never allow duplicate `(student_id, offering_id)` or `(assessment_id, student_id)`.
- Never accept a reused or expired reset token.
