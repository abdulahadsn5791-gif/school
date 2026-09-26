import { Hono } from 'hono';

import academicTermRoutes from '../modules/academic-term/presentation/academic-term.routes';
import assignmentRoutes from '../modules/assignment/presentation/assignment.routes';
import attendanceRoutes from '../modules/attendance/presentation/attendance.routes';
import auditLogRoutes from '../modules/audit-log/presentation/audit-log.routes';
import classRoutes from '../modules/class/presentation/class.routes';
import enrollmentRoutes from '../modules/enrollment/presentation/enrollment.routes';
import eventRoutes from '../modules/event/presentation/event.routes';
import feeRoutes from '../modules/fee/presentation/fee.routes';
import guardianRoutes from '../modules/guardian/presentation/guardian.routes';
import leaveRoutes from '../modules/leave/presentation/leave.routes';
import noticeRoutes from '../modules/notice/presentation/notice.routes';
import periodRoutes from '../modules/period/presentation/period.routes';
import reportRoutes from '../modules/report/presentation/report.routes';
import schoolRoutes from '../modules/school/presentation/school.routes';
import sessionRoutes from '../modules/session/presentation/session.routes';
import studentTestRoutes from '../modules/student-test/presentation/student-test.routes';
import subjectRoutes from '../modules/subject/presentation/subject.routes';
import timetableRoutes from '../modules/timetable/presentation/timetable.routes';
import usersRoutes from '../modules/user/presentation/user.routes';

const routes = new Hono();

routes.route('/academic-terms', academicTermRoutes);
routes.route('/audit-logs', auditLogRoutes);
routes.route('/assignments', assignmentRoutes);
routes.route('/attendance', attendanceRoutes);
routes.route('/classes', classRoutes);
routes.route('/enrollments', enrollmentRoutes);
routes.route('/fees', feeRoutes);
routes.route('/events', eventRoutes);
routes.route('/guardians', guardianRoutes);
routes.route('/leaves', leaveRoutes);
routes.route('/notices', noticeRoutes);
routes.route('/reports', reportRoutes);
routes.route('/periods', periodRoutes);
routes.route('/schools', schoolRoutes);
routes.route('/sessions', sessionRoutes);
routes.route('/student-tests', studentTestRoutes);
routes.route('/subjects', subjectRoutes);
routes.route('/timetable', timetableRoutes);
routes.route('/users', usersRoutes);

export default routes;
