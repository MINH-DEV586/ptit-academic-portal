const { Router } = require('express');
const faculty = require('../controllers/faculty.controller');
const { validateBody, validateQuery, requireId } = require('../middlewares/validate');
const { facultySchema, listQuerySchema } = require('../validators/faculty.validator');

const router = Router();

router.get('/', validateQuery(listQuerySchema), faculty.list);
router.post('/', validateBody(facultySchema), faculty.create);
router.get('/:facultyId', faculty.getById);
router.put('/:facultyId', requireId('facultyId'), validateBody(facultySchema), faculty.update);
router.patch('/:facultyId', requireId('facultyId'), validateBody(facultySchema, { partial: true }), faculty.update);
router.delete('/:facultyId', faculty.remove);

module.exports = router;
