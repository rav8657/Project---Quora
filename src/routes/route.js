const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')

const MW = require('../middlewares/authMiddleware')


//*...... USER SECTION APIs
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/user/:userId/profile', MW.userAuth, userController.getUserProfile)
router.put('/user/:userId/profile', MW.userAuth, userController.updateUserProfile)


// //*...... QUESTION SECTION APIs
router.post('/question', MW.userAuth, questionController.createQuestion)
router.get('/questions', questionController.getAllQuestions)
router.get('/questions/:questionId', questionController.getQuestionById)
router.put('/questions/:questionId', MW.userAuth, questionController.updateQuestion)
router.delete('/questions/:questionId', MW.userAuth, questionController.deleteQuestion)



// //*...... ANSWER SECTION APIs
router.post('/answer', MW.userAuth, answerController.createAnswer)
router.get('/questions/:questionId/answer', answerController.getAllAnswers)
router.put('/answer/:answerId', MW.userAuth, answerController.updateAnswer)
router.delete('/answers/:answerId', MW.userAuth, answerController.deleteAnswer)



module.exports = router;