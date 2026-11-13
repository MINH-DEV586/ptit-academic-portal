const { Router } = require('express');
const course = require('../controllers/course.controller');
const { validateBody, validateQuery, requireId } = require('../middlewares/validate');
const { courseSchema, listQuerySchema } = require('../validators/course.validator');

const router = Router();

router.get('/', validateQuery(listQuerySchema), course.list);
router.post('/', validateBody(courseSchema), course.create);
router.get('/:courseId', course.getById);
router.put('/:courseId', requireId('courseId'), validateBody(courseSchema), course.update);
router.patch('/:courseId', requireId('courseId'), validateBody(courseSchema, { partial: true }), course.update);
router.delete('/:courseId', course.remove);

module.exports = router;
