const validator = require("../validators/validator");
const userModel = require("../models/userModel");
const questionModel = require("../models/questionModel");
const answerModel = require("../models/answerModel");

//........................................................................
//Post Question

const createQuestion = async (req, res) => {
    try {
        let requestBody = req.body;
        const userIdFromToken = req.userId;

        //Extract parameters
        const { description, tag, askedBy } = requestBody;

        //validation for request body
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide the valid request body to post a question." });
        }
        //validation for askedBy. (userId)
        if (!validator.isValid(askedBy)) {
            return res.status(400).send({ status: false, message: "askedBy is required to post a question." });
        }

        if (!validator.validString(tag)) {
            return res.status(400).send({ status: false, message: "Tag is required.", });
        }
        //Authorization 
        if (askedBy != userIdFromToken) {
            return res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        }
        const searchUser = await userModel.findOne({ _id: askedBy });

        if (!searchUser) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${askedBy}.` });
        }
        if (searchUser.creditScore == 0) {
            return res.status(400).send({ status: false, message: "Your creditScore is 0, hence cannot post question." });
        }

        //validation for description's request body
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "Question description is required." });
        }
        const questionData = {
            description,
            askedBy,
        };

        //Setting tags in an array by filtering the repeated values.

        if (tag) {
            const tagArr = tag.split(",").map((x) => x.trim());
            const uniqueTagArr = [...new Set(tagArr)];  //we use ...new set for unique values in Array
            if (Array.isArray(tagArr)) {
                questionData["tag"] = uniqueTagArr;
            }
        }
        const saveQuestion = await questionModel.create(questionData);

        const deductCreditScore = searchUser.creditScore - 100;

        if (saveQuestion) {
            await userModel.findOneAndUpdate({ _id: askedBy }, { creditScore: deductCreditScore });
        }
        return res.status(201).send({ status: true, message: "Question posted Successfully.", data: saveQuestion });

    } catch (err) {
        return res.status(500).send({ Error: err.message });
    }
};


//!................................................
//Fetch all questions with their answers.
const getAllQuestions = async (req, res) => {
    try {
      let filterQuery = { isDeleted: false };
      let queryParams = req.query;
      let { tag, sort } = queryParams;

      if (validator.isValidRequestBody(queryParams)) {
          
        if (validator.isValid(tag)) {
          let tagsArray = tag.split(",").map((x) => x.trim());
          filterQuery["tag"] = { $all: tagsArray };
        }

        if (!validator.validString(tag)) {
          return res.status(400).send({ status: false, message: "Tag is required." });
        }

        if (!validator.validString(sort)) {
          return res.status(400).send({ status: false,message: "Sort is required." });
        }

        if (sort) {
          if ( !(sort.toLowerCase() == "ascending" || sort.toLowerCase() == "descending" ) ) {
            return res.status(400).send({ message: `Only 'ascending' & 'descending' are allowed to sort.`});
          }
          if (sort.toLowerCase() === "ascending") { var sortValue = 1; }
          if (sort.toLowerCase() === "descending") {var sortValue = -1; }

        }
        
        let findQuestionsByTag = await questionModel.find(filterQuery).lean().sort({ createdAt: sortValue }).select({ createdAt: 0, updatedAt: 0, __v: 0 });
        
        for (i in findQuestionsByTag) {
          let answer = await answerModel.find({ questionId: findQuestionsByTag[i]._id }).select({ text: 1, answeredBy: 1 });
       
          findQuestionsByTag[i].answers = answer;
       
        }
        if (findQuestionsByTag.length == 0) {
          return res.status(400).send({status: false, message: `No Question found by tag - ${tag}` });
        }
        return res.status(200).send({ status: true, message: "Questions List", data: findQuestionsByTag });
      }
      return res.status(400).send({status: false, message: "No filters provided to search questions." });
    } catch (err) {
      return res.status(500).send({ Error: err.message });
    }
  }

//!..........................................................................

const getQuestionById = async function (req, res) {
    try {
        const questionId = req.params.questionId;

    //Validation for the question Id.

    if (!validator.isValidObjectId(questionId)) {
      return res.status(400).send({status: false, message: `${questionId} is not a valid question id`});
    }
    const findQuestion = await questionModel.findOne({_id: questionId, isDeleted: false});

    if (!findQuestion) {
      return res.status(404).send({status: false, message: `No questions exists by ${questionId}`});
    }
    const findAnswersOfThisQuestion = await answerModel.find({ questionId: questionId }).sort({ createdAt: -1 }).select({createdAt: 0,updatedAt: 0,__v:0});

      const description = findQuestion.description;
      const tag = findQuestion.tag;
      const askedBy = findQuestion.askedBy;

    const structureForResponseBody = {
      description,
      tag,
      askedBy,
      answers: findAnswersOfThisQuestion,
    };

    return res.status(200).send({status: true,message: "Question fetched successfully.",data: structureForResponseBody});

    } catch (err) {
        return res.status(500).send({ status: false, message: "Error is : " + err })}
};


//!.....................................................

const updateQuestion = async function (req, res) {
    try {
        const questionId = req.params.questionId;
        const userIdFromToken = req.userId;

        //validation starts.
        let requestBody = req.body

        const { tag, description } = requestBody

        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({status: false, message: `${questionId} is not a valid question id`});
        }
        //validation for request body
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message:"Invalid request body. Please provide the the input to proceed." });
        }
        if (!validator.validString(tag)) {
            return res.status(400).send({ status: false, message: "Tag is required.", });
        }
        if (!validator.validString(description)) {
            return res.status(400).send({ status: false, message: "Description is required.", });
        }
        //validation ends.
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false });

        if (!question) {
            return res.status(404).send({ status: false, message: `question does not exit` });
        }
        //*Authentication & authorization
        let userId = question.askedBy;
        if (userId != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return;
        }

        const questionData = {}
        if (description) {
            if (!Object.hasOwnProperty(questionData, '$set'))
                questionData['$set'] = {}
            questionData['$set']['description'] = description
        }
        if (tag) {
            const tagArr = tag.split(",").map((x) => x.trim());
            const uniqueTagArr = [...new Set(tagArr)]; //we use ...new set for unique values in Array
            if (Array.isArray(tagArr)) {
                questionData['$addToSet'] = {}
                questionData['$addToSet']["tag"] = uniqueTagArr;
            }
        }
        questionData.updatedAt = new Date();
        const updateQuestion = await questionModel.findOneAndUpdate({ _id: questionId }, questionData, { new: true })
        return res.status(200).send({ status: true, message: 'Question updated successfully', data: updateQuestion });

    } catch (err) {
        return res.status(500).send({ status: false, message: "Error is : " + err });
    }
};

//!.................................................
//deleting question .

const deleteQuestion = async function (req, res) {
    try {
        const questionId = req.params.questionId;
        let userIdFromToken = req.userId;

    //validation for questionId
    if (!validator.isValidObjectId(questionId)) {
      return res.status(400).send({ status: false, message: `${questionId} is not a valid question id`});
    }

    const findQuestion = await questionModel.findOne({_id: questionId });

    if (!findQuestion) {
      return res.status(404).send({ status: false, message: `Question not found for ${questionId}` });
    }

    //*Authentication & authorization
    let userId = findQuestion.askedBy;
    if (userId != userIdFromToken) {
      return res.status(401).send({status: false, message: `Unauthorized access! ${userId} is not a logged in user.` });
    }

    if (findQuestion.isDeleted == true) {
      return res.status(404).send({ status: false, message: `Question has been already deleted.` });
    }

    await questionModel.findOneAndUpdate({ _id: questionId },{ $set: { isDeleted: true, deletedAt: new Date() } }
    );

    return res.status(204).send({ status: true, message: `Question deleted successfully.` });

    } catch (err) {
        return res.status(500).send({ status: false, message: "Error is : " + err })
    }
}


module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
}



