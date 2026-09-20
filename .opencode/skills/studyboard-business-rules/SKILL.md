---
name: studyboard-business-rules
description: StudyBoard academic rules for STUDENT, PROFESSOR, COURSE, COURSE_OFFERING, ENROLLMENT, ASSESSMENT, GRADE, PASSWORD_RESET, final_average view. Use when modeling, validating, or scaffolding StudyBoard domain, use-cases, or persistence.
---

# StudyBoard Business Rules

Student-facing academic management system. Students authenticate and track enrollments, professors, exams, homework, and grades across semesters with automatic weighted averages and full retake history.

## 1. Ubiquitous Language

Do not use synonyms. These English terms are normative for code, docs, and DB.

- `STUDENT` — Student. The only authenticatable actor. Fields: `id, name, email (unique), password_hash, student_number (unique)`.
- `PROFESSOR` — Professor. Reference data only. No login, no credentials, no tokens. Fields: `id, name, email (unique), qualification`.
- `COURSE` — Generic course catalog entry, e.g. Calculus I. No semester, year, professor, or grades. Fields: `id, name, code (unique), workload_hours (int > 0)`.
- `COURSE_OFFERING` — One offering of a COURSE in a given `semester/year` by exactly one professor. All gradable activity attaches here. Fields: `id, course_id FK, professor_id FK, semester, year, status`.
- `ENROLLMENT` — Enrollment of one STUDENT in one COURSE_OFFERING. One row per attempt. Fields: `id, student_id FK, offering_id FK, enrollment_date, final_average (derived, read-only)`.
- `ASSESSMENT` — Unified evaluation (exam or homework). Belongs to exactly one COURSE_OFFERING. Fields: `id, offering_id FK, type (exam|homework), title, date, weight (NUMERIC > 0)`.
- `GRADE` — One raw score of one STUDENT on one ASSESSMENT. Fields: `id, assessment_id FK, student_id FK, score (0-10), graded_at`.
- `PASSWORD_RESET` — Password-reset request. Fields: `id, student_id FK, token (unique), created_at, expires_at, used_at (nullable)`.

Cross-aggregate references are by ID only.

```text
PROFESSOR --teaches--> COURSE --offers--> COURSE_OFFERING --contains--> ASSESSMENT --yields--> GRADE
STUDENT --holds--> ENROLLMENT <--receives-- COURSE_OFFERING
STUDENT --receives--> GRADE
STUDENT --requests--> PASSWORD_RESET
```

## 2. Authentication & Access

- Only `STUDENT` authenticates with `email + password` verified against `password_hash`.
- `PROFESSOR` must never have a login, password, JWT, or reset token. Reject any such design.
- Password reset flow:
  1. `requestPasswordReset(student_id)` creates `PASSWORD_RESET` with random unique `token`, `created_at = NOW()`, `expires_at = created_at + 2h`, `used_at = NULL`.
  2. Token is valid iff `used_at IS NULL AND NOW() <= expires_at`.
  3. Consumption sets `used_at = NOW()` atomically. Single use. Expired or reused tokens are rejected.
- Authorization: a student may only access rows where `student_id = self`. Back-office writes (create COURSE/OFFERING/ASSESSMENT, assign GRADE, close OFFERING) belong to a separate Admin context (`AdminCreateOffering`, `AdminAssignGrade`, `AdminCloseOffering`), not to student use cases (`ListStudentHistory`, `LoginStudent`).

## 3. COURSE vs COURSE_OFFERING

- `COURSE` is timeless. Never store `semester`, `year`, `professor_id`, grades, or enrollments on it.
- `COURSE_OFFERING` is the gradable unit. `ENROLLMENT`, `ASSESSMENT`, `GRADE` always reference `COURSE_OFFERING` (directly or via `ASSESSMENT.offering_id`), never `COURSE`.
- `COURSE_OFFERING.status` is a simple enum: `in_progress | closed`.
  - `in_progress`: allows `INSERT/UPDATE` on `ENROLLMENT`, `ASSESSMENT`, `GRADE`.
  - `closed`: blocks all such writes for that offering. Domain method `CourseOffering.close()` performs the transition; persistence enforces it with checks/triggers/RLS.
- Exactly one `professor_id` per offering. Co-teaching is out of scope.

## 4. Enrollment & Retakes

- Unique constraint: `ENROLLMENT(student_id, offering_id)`.
- Retaking the same `COURSE` means enrolling in a different `COURSE_OFFERING` row (new semester/year). Keep every attempt; never overwrite or delete history.
- `ENROLLMENT.final_average` is derived only. Never accept it as input, never compute it in application code.

## 5. Assessments & Grades

- `ASSESSMENT.weight > 0`. Weights do NOT need to sum to 100; the average normalizes by the actual sum.
- Unique constraint: `GRADE(assessment_id, student_id)`. Exactly one grade per student per assessment.
- Integrity: a `GRADE` is allowed only if a matching `ENROLLMENT` exists for the same `(student_id, offering_id of the ASSESSMENT)`. Reject orphan grades.
- No `GRADE` or `ASSESSMENT` writes when the parent `COURSE_OFFERING.status = closed`.

## 6. Automatic Grade Calculation (SQL View, decided)

Formula per enrollment:

```text
final_average = SUM(grade.score * assessment.weight) / SUM(assessment.weight)
  over all ASSESSMENTs of the offering joined to GRADEs of that STUDENT.
```

- Missing grades (no GRADE row) are excluded from both sums, not counted as zero.
- If a student has zero grades, `final_average` is `NULL`, not `0`.
- Implementation is a SQL View (e.g. `vw_final_average`). Application reads `final_average` through the view/join. Application must not calculate or persist it independently, keeping it always in sync on grade insert/update.
- Persistence: FKs `ON RESTRICT`. Never cascade-delete grades or enrollments. Index `offering_id, student_id, assessment_id, token`.

## 7. Validation Matrix

Enforce in Value Objects (domain) AND in DB CHECKs/UNIQUEs:

| Field | Rule |
|---|---|
| `STUDENT.email`, `PROFESSOR.email` | valid format, trimmed, lowercased, unique |
| `STUDENT.student_number` | non-empty, unique |
| `STUDENT.password_hash` | never plain text, never returned in outputs |
| `COURSE.code` | non-empty, unique |
| `COURSE.workload_hours` | integer > 0 |
| `COURSE_OFFERING.semester` | non-empty string |
| `COURSE_OFFERING.year` | valid year (e.g. >= 2000) |
| `COURSE_OFFERING.status` | `in_progress \| closed` |
| `ASSESSMENT.type` | `exam \| homework` |
| `ASSESSMENT.weight` | NUMERIC > 0 |
| `GRADE.score` | NUMERIC 0 <= x <= 10 |
| `PASSWORD_RESET.token` | unique, single-use, `expires_at > created_at` |

## 8. Modeling Guidance (DDD + Clean Architecture)

- Follow `clean-architecture-nestjs` and `ddd-tactical-nestjs`: `src/domain/` contains pure TypeScript entities, value objects, aggregates, domain events, repository interfaces. Zero `@nestjs/*`, `typeorm`, `prisma`, `class-validator` imports.
- Suggested aggregates:
  - `Student { id, name, email:Email, passwordHash, studentNumber }` + methods `requestPasswordReset()`, `consumeResetToken()`.
  - `CourseOffering { id, courseId, professorId, semester, year, status }` + methods `close()`, `assertWritable()`.
  - `Enrollment`, `Assessment`, `Grade`, `PasswordReset` as entities/roots per bounded context, referencing parents by ID.
- Value Objects: `Email`, `Weight`, `GradeScore`, `OfferingStatus`, `AssessmentType`, `ResetToken` — each self-validates in `static create()`.
- Use cases: `LoginStudent`, `RequestPasswordReset`, `ConfirmPasswordReset`, `ListStudentHistory` (student); `AdminCreateCourse/Offering/Assessment`, `AdminEnrollStudent`, `AdminAssignGrade`, `AdminCloseOffering` (admin). Controllers thin; use cases depend on repository ports; infrastructure implements with mappers.
- Domain events for cross-aggregate sync, e.g. `OfferingClosed`, `GradeAssigned`, `PasswordResetRequested`.

## 9. Invalid States (must be unrepresentable)

- `PROFESSOR` with credentials or token.
- `ENROLLMENT` or `GRADE` pointing directly to `COURSE`.
- Duplicate `(student_id, offering_id)` or `(assessment_id, student_id)`.
- `GRADE` without matching `ENROLLMENT`.
- Write on `closed` offering.
- `final_average` supplied by client or computed in TypeScript.
- Reused (`used_at NOT NULL`) or expired (`NOW() > expires_at`) reset token accepted.

## 10. Checklist Before Done

- [ ] Skill `studyboard-business-rules` loaded for any domain/app/persistence work.
- [ ] Terms use English names (`COURSE_OFFERING`, not `Class`; `GRADE`, not `Score`; `ASSESSMENT`, not `Exam`).
- [ ] `final_average` read via view, never written by app.
- [ ] `closed` blocks enrollment/assessment/grade writes in domain + DB.
- [ ] Uniques + checks + `ON RESTRICT` mirrored in migration and VOs.
- [ ] Student vs Admin use cases separated; professor has no auth path.
