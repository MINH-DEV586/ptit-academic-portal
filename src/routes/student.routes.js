const { Router } = require('express');
const student = require('../controllers/student.controller');
const grade = require('../controllers/grade.controller');
const { validateBody, validateQuery, requireStudentId, requireId } = require('../middlewares/validate');
const { createSchema, updateSchema, listQuerySchema } = require('../validators/student.validator');
const { gradeSchema } = require('../validators/grade.validator');

const router = Router();

router.get('/', validateQuery(listQuerySchema), student.list);
router.post('/', validateBody(createSchema), student.create);
router.get('/:studentId', student.getById);
router.put('/:studentId', requireStudentId, validateBody(updateSchema), student.update);
router.patch('/:studentId', requireStudentId, validateBody(updateSchema, { partial: true }), student.update);
router.delete('/:studentId', student.remove);

router.get('/:studentId/academic', student.academic);

router.get('/:studentId/grades', grade.list);
router.post('/:studentId/grades', requireStudentId, validateBody(gradeSchema), grade.create);
router.put(
  '/:studentId/grades/:gradeId',
  requireStudentId, requireId('gradeId'),
  validateBody(gradeSchema),
  grade.update
);
router.patch(
  '/:studentId/grades/:gradeId',
  requireStudentId, requireId('gradeId'),
  validateBody(gradeSchema, { partial: true }),
  grade.update
);
router.delete('/:studentId/grades/:gradeId', grade.remove);

module.exports = router;
