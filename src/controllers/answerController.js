const validator = require("../validators/validator");
const userModel = require("../models/userModel");
const questionModel = require("../models/questionModel");
const answerModel = require("../models/answerModel");


const createAnswer = async function (req, res) {
    try {
        let requestBody = req.body;
        let userIdFromToken = req.userId;

        const { questionId, answeredBy, text } = requestBody; //Extracting parameters

        //validation for request body
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: "Empty body.Please provide a request body.",
            });
        }

        //Validating questionId.
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({
                status: false,
                message: `${questionId} is not a valid question id`,
            });
        }

        //Validating userId -> answeredBy
        if (!validator.isValidObjectId(answeredBy)) {
            return res.status(400).send({
                status: false,
                message: "Not a valid usedId",
            });
        }

        //validating text answer.
        if (!validator.isValid(text)) {
            return res.status(400).send({
                status: false,
                message: `Text is required`,
            });
        }

        //Authentication & Authorization
        if (answeredBy != userIdFromToken) {
            return res.status(401).send({
                status: false,
                message: `Unauthorized access! ${answeredBy} is not a logged in user.`,
            });
        }

        //Finding user -> Exists or not.
        const findUser = await userModel.findOne({ _id: answeredBy });
        if (!findUser) {
            return res
                .status(400)
                .send({ status: false, message: "User not found." });
        }

        //Validating question -> valid question or not.
        const findQuestion = await questionModel.findOne({
            _id: questionId,
            isDeleted: false,
        });

        if (!findQuestion) {
            return res.status(400).send({
                status: false,
                message: "Either question doesn't exist or deleted.",
            });
        }

        //Checking whether the user is answering his/her question or not.
        if (findQuestion.askedBy == answeredBy) {
            return res.status(400).send({
                status: false,
                message: "User can't answer thier own question.",
            });
        }

        const saveAnswer = await answerModel.create(requestBody);

        //Updating the creditScore by 200 after answering a question.
        await userModel.findOneAndUpdate(
            { _id: answeredBy },
            { $inc: { creditScore: 200 } }
        );

        return res.status(201).send({
            status: true,
            message: "Question answered successfully.",
            data: saveAnswer,
        });
    } catch (err) {
        return res.status(500).send({
            status: false,
            Error: err.message,
        });
    }
};

//Fetching all answers related to a specific question.
const getAllAnswers = async (req, res) => {
    try {
        let questionId = req.params.questionId;

        //Validating questionId.
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({
                status: false,
                message: `${questionId} is not a valid question id in URL params.`,
            });
        }

        const searchQuestion = await questionModel.findOne({ _id: questionId });
        if (!searchQuestion) {
            return res.status(404).send({
                status: false,
                message: `Question doesn't exists by ${questionId} or has been deleted.`,
            });
        }

        const fetchAnswers = await answerModel
            .find({ questionId: questionId })
            .select({ createdAt: 0, updatedAt: 0, __v: 0 });

        if (Array.isArray(fetchAnswers) && fetchAnswers.length === 0) {
            return res.status(404).send({
                status: false,
                message: `No answers found for ${questionId}.`,
            });
        }

        return res.status(200).send({
            status: true,
            message: `Answer fetched successfully for ${questionId}.`,
            data: fetchAnswers,
        });
    } catch (err) {
        return res.status(500).send({
            status: false,
            Error: err.message,
        });
    }
};

const updateAnswer = async (req, res) => {
    try {
        const requestBody = req.body;
        const answerId = req.params.answerId;
        const userIdFromToken = req.userId;
        let { text } = requestBody;

        //validation for request body
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: `Unable to update empty request body.`,
            });
        }

        //Validating answerId.
        if (!validator.isValidObjectId(answerId)) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: `${answerId} is not a valid answerId`,
                });
        }

        //finding answer document where to update.
        const findAnswer = await answerModel.findOne({
            _id: answerId,
            isDeleted: false,
        });

        if (!findAnswer) {
            return res
                .status(400)
                .send({ status: false, message: `No answer found by ${answerId}` });
        }

        let answeredBy = findAnswer.answeredBy;
        //Authentication & Authorization
        if (answeredBy != userIdFromToken) {
            return res.status(401).send({
                status: false,
                message: `Unauthorized access! ${answeredBy} is not a logged in user.`,
            });
        }

        if (!validator.validString(text)) {
            return res.status(400).send({
                status: false,
                message: "Please provide the answer text to update.",
            });
        }

        const updatedAnswer = await answerModel.findOneAndUpdate(
            { _id: answerId },
            { text: text },
            { new: true }
        );

        return res.status(200).send({
            status: true,
            message: "Answer updated successfully.",
            data: updatedAnswer,
        });
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message });
    }
};

const deleteAnswer = async function (req, res) {
    try {
        const params = req.params;
        const answerId = params.answerId;
        const userIdFromToken = req.userId;

        //validation for answerId
        if (!validator.isValidObjectId(answerId)) {
            return res.status(400).send({
                status: false,
                message: `${answerId} is not a valid answer id`,
            });
        }

        //Finding answer which has to be deleted.
        const findAnswer = await answerModel.findOne({
            _id: answerId,
            isDeleted: false,
        });
        if (!findAnswer) {
            return res
                .status(404)
                .send({ status: false, message: `No answer found by ${answerId}` });
        }

        let answeredBy = findAnswer.answeredBy;

        //Authentication & Authorization
        if (answeredBy != userIdFromToken) {
            return res.status(401).send({
                status: false,
                message: `Unauthorized access! ${answeredBy} is not a logged in user.`,
            });
        }

        await answerModel.findOneAndUpdate(
            { _id: answerId },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        return res
            .status(200)
            .send({ status: true, message: `Answer deleted successfully.` });
    } catch (err) {
        return res.status(500).send({
            status: false,
            Error: err.message,
        });
    }
};

module.exports = {
    createAnswer,
    getAllAnswers,
    updateAnswer,
    deleteAnswer,
}