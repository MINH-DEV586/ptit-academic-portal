const { Router } = require('express');
const major = require('../controllers/major.controller');
const { validateBody, validateQuery, requireId } = require('../middlewares/validate');
const { majorSchema, listQuerySchema } = require('../validators/major.validator');

const router = Router();

router.get('/', validateQuery(listQuerySchema), major.list);
router.post('/', validateBody(majorSchema), major.create);
router.get('/:majorId', major.getById);
router.put('/:majorId', requireId('majorId'), validateBody(majorSchema), major.update);
router.patch('/:majorId', requireId('majorId'), validateBody(majorSchema, { partial: true }), major.update);
router.delete('/:majorId', major.remove);

module.exports = router;
