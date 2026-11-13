const { Router } = require('express');
const pkg = require('../../package.json');

const router = Router();

function apiInfo(req, res) {
  res.json({
    success: true,
    data: {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      endpoints: {
        health: '/api/health',
        students: '/api/students',
        courses: '/api/courses',
        faculties: '/api/faculties',
        majors: '/api/majors',
        classes: '/api/classes',
      },
    },
  });
}

router.get('/', apiInfo);
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'academic-api', status: 'ok' });
});

router.use('/students', require('./student.routes'));
router.use('/courses', require('./course.routes'));
router.use('/faculties', require('./faculty.routes'));
router.use('/majors', require('./major.routes'));
router.use('/classes', require('./class.routes'));

module.exports = { router, apiInfo };
