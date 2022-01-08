## Project - Quora

### Key points

#### Validations

- Please include all the basic validations in code this time. For example you should write your own code to ensure that a userId passed as the path param must be a valid ObjectId and in such a case the error should be handled within the try block and not the catch block. This applies to all the validations whose failure lead to a 500 error. A valid error should be 400, 401, 403 or 404, as the case may be.

#### Project conventions

- You must submit an explainer video at the end of each day, and not at the end of a feature on an individual basis. If you work for say 8 days in total at this project, there should be 8 videos submitted by you at the end of each day mandatorily.
- In this project also we will work feature wise. That means we pick one resource/ sub-resource like user, answer, question, etc at a time. All the apis on one specific resource would come under one feature. The steps would be:
  1) We create it's model.
  2) We build it's APIs.
  3) We test these APIs.
  4) We will repeat steps from Step 1 to Step 3 for each feature in this project.
- This project is divided into 3 features namely User, Question and Answer. You need to work on a single feature at a time. Once that is completed as per above mentioned steps. You will be instructed to move to the next Feature.

- In this project we are changing how we send token with a request. Instead of using a custom header key like **x-api-key**, you need to use **Authorization** header and send the JWT token as **Bearer token**.
- Create a database Database`. You can clean the db you previously used and reuse that.
- This time each group should have a *single git branch*. Coordinate amongst yourselves by ensuring every next person pulls the code last pushed by a team mate. You branch will be checked as part of the demo. Branch name should follow the naming convention `project/QuoraX`
- Follow the naming conventions exactly as instructed.

## Phase I
## FEATURE I - User
### Models
- User Model
```yaml
{ 
  fname: {string, mandatory},
  lname: {string, mandatory},
  email: {string, mandatory, valid email, unique(if exist)},
  phone: {string, not mandatory, unique, valid Indian mobile number}, 
  password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
  creditScore: {Number, mandatory},
  createdAt: {timestamp},
  updatedAt: {timestamp}
}
```


## User APIs 
### POST /register
- Create a user document from request body. 
- Save password in encrypted format. (use bcrypt)
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the user document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

```yaml
{
    "status": true,
    "data": {
        "fname": "John",
        "lname": "Doe",
        "email": "johndoe@mailinator.com",
        "phone": "9876543210",
        "password": "$2b$10$DpOSGb0B7cT0f6L95RnpWO2P/AtEoE6OF9diIiAEP7QrTMaV29Kmm",
        "creditScore": 500,
        "_id": "6162876abdcb70afeeaf9cf5",
        "createdAt": "2021-10-10T06:25:46.051Z",
        "updatedAt": "2021-10-10T06:25:46.051Z",
        "__v": 0
    }
}
```

### POST /login
- Allow an user to login with their email and password.
- On a successful login attempt return the userId and a JWT token containing the userId, exp, iat.
- You should also return userId in addition to the JWT token. Refer the example below
- __Response format__
  - _**On success**_ - Return HTTP status 200 and JWT token in response body. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
```yaml
{
    "status": true,
    "data": {
        "userId": "6165f29cfe83625cf2c10a5c",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTYyODc2YWJkY2I3MGFmZWVhZjljZjUiLCJpYXQiOjE2MzM4NDczNzYsImV4cCI6MTYzMzg4MzM3Nn0.PgcBPLLg4J01Hyin-zR6BCk7JHBY-RpuWMG_oIK7aV8"
    }
}
```                                                                  

## GET /user/:userId/profile (Authentication and authorisation required)
- Allow a user to fetch details of their profile.
- Make sure that userId in url param and in token is same
- __Response format__
  - _**On success**_ - Return HTTP status 200 and returns the user document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
```yaml
{
    "status": true,
    "data": {
        "_id": "6162876abdcb70afeeaf9cf5",
        "fname": "John",
        "lname": "Doe",
        "email": "johndoe@mailinator.com",
        "phone": "9876543210",
        "password": "$2b$10$DpOSGb0B7cT0f6L95RnpWO2P/AtEoE6OF9diIiAEP7QrTMaV29Kmm",
        "creditScore": 600,
        "createdAt": "2021-10-10T06:25:46.051Z",
        "updatedAt": "2021-10-10T06:25:46.051Z",
        "__v": 0
    }
}
```

## PUT /user/:userId/profile (Authentication and authorisation required)
- Allow a user to update their profile.
- A user can update only the firstName, lastName, email and phone. 
- The values to be updated must satisfy the constraints specified in the model. For example the updated email should still be unique and valid. The same applies to the rest of the fields.
- Make sure that userId in url param and in token is same and also that the updated user document is sent back in the response
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the updated user document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
```yaml
{
    "status": true,
    "data": {
        "_id": "6162876abdcb70afeeaf9cf5",
        "fname": "Jane",
        "lname": "Austin",
        "email": "janedoe@mailinator.com",
        "phone": "9876543210",
        "password": "$2b$10$jgF/j/clYBq.3uly6Tijce4GEGJn9EIXEcw9NI3prgKwJ/6.sWT6O",
        "creditScore": 600,
        "createdAt": "2021-10-10T06:25:46.051Z",
        "updatedAt": "2021-10-10T08:47:15.297Z",
        "__v": 0
    }
}
```

Note: 
Refer the following links to explore brypt and form-data
[Bcrypt](https://www.npmjs.com/package/bcrypt)

Send [form-data](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

## FEATURE II -  Question
### Models
- question Model
```yaml
{ 
  description: {string,mandatory} ,
  tag: {array of string},
  askedBy: {a referenec to user collection.,},
  deletedAt: {Date, when the document is deleted}, 
  isDeleted: {boolean, default: false},
  createdAt: {timestamp},
  updatedAt: {timestamp},
}
```
---
**Note**:
- TAG : A tag refers to the category of question(Eg sci-fi, technology, coding, adventure etc)
- DESCRIPTION : A decription denotes the question a users want to ask.
---

## question API 
### POST /question(Authentication and authorisation required)
- Create a question document from request body. The request body should contain the userId along with the question details
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the question document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### GET /questions (public api)
- Returns all questions in the collection that aren't deleted. Each question should contain all the answers, if available, for it.
- A guest user, a user that isnt' logged in, should be able to fetch all teh questions
- You should be able to filter the result if the a query parameter like tag=adventure is present in the request. Also, the result should be sorted by the createdAt field if a sorting query parameter is present. The example for sort order query param is sort=descending. Please note that filter and sort field are optional. And either of these or they could both be passed in the request.
  
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the question documents. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### GET /questions/:questionId (public api)
- Returns question details by question id. Also contains the list of answers, if any, for the particular question.
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the question documents. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### PUT /questions/:questionId (authentication and authorisation)
- Updates a question by changing it's text or tag or both
- Check if the questionId exists. If it doesn't, return a suitable HTTP status with a response body like [this](#error-response-structure)
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the updated question document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### DELETE /questions/:questionId(authentication and authorisation )
- Deletes a question by question id if it's not already deleted
- __Response format__
  - _**On success**_ - Return HTTP status 200. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)



## FEATURE III - answer
### Model
- answer Model
```yaml
{
  answeredBy: {ObjectId, refs to User, mandatory},
  text: {string, mandatory},
  questionId: {ObjectId, refs to question, mandatory},
  isDeleted : default false,
  createdAt: {timestamp},
  updatedAt: {timestamp},
}
```


## answer APIs 
### POST /answer(authentication and authorisation required)
- Get questionId and the userId in request body along with the answer details.
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the answer document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

```diff
+ Please note a user can not answer their own question. In such a scenario, return a suitable HTTP status code and message.
```  

### GET questions/:questionId/answer (public api)
- get all the answers linked to the question id.
### PUT /answer/:answerId (authentication and authorisation required)
- onyl the user posted the answer can edit the answer
- __Response format__
  - _**On success**_ - Return HTTP status 201. Also return the answer document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

### DELETE answers/:answerId(authentication and authorisation required)
-only the user posted the answer can delete it. Get the userId and questionId in the request body.
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the answer document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)


## Testing 
- To test these apis create a new collection in Postman named Project quora
- Each api should have a new request in this collection
- Each request in the collection should be rightly named. Eg Create user, Create question, Get questions etc
- Each member of each team should have their tests in running state


## Response

### Successful Response structure
```yaml
{
  status: true,
  data: {

  }
}
```
### Error Response structure
```yaml
{
  status: false,
  message: ""
}
```

## Phase II

- There will be a credit score of 500 for every newly registered user. 
- On posting a **question** there will be a deduction of 100 from the credit score of the OP (the one who posts the question).
- On  posting a **answer** there will be a reward of 200 to the credit score of the person answering the question.
- credit score cannot be **-ve**.
- once credit score reached to 0, user cannot post any question and a suitable message should be displayed to the user. 
- All the Answers of the questions will be sorted on the basis of recency. Example: if there are 10 answers linked to  same question_id then sort 10 answers on the basis of the time the answer was posted. In other words, the question detail should contain the list of answers in an order where the answer posted most recently would be listed first

## Collections
## users
```yaml
{
  _id: ObjectId("88abc190ef0288abc190ef02"),
  fname: 'John',
  lname: 'Doe',
  email: 'johndoe@mailinator.com',
  phone: '9876543210',
  creditScore: 200,
  password: '$2b$10$O.hrbBPCioVm237nAHYQ5OZy6k15TOoQSFhTT.recHBfQpZhM55Ty', // encrypted password
  createdAt: "2021-09-17T04:25:07.803Z",
  updatedAt: "2021-09-17T04:25:07.803Z",
}
```
### question
```yaml
{
  description: 'how to get response from request body',
  tag: 'sci-fi','tech',
  askedBy: ObjectId("88abc190ef0288abc190ef55"),
  deletedAt: "2021-09-17T04:25:07.803Z" , 
  isDeleted: Null,
  createdAt: "2021-09-17T04:25:07.803Z",
  updatedAt: "2021-09-17T04:25:07.803Z",

}
```

### answer
```yaml
{
  ansnweredBy : ObjectId("88abc190ef0288abc190ef55"),
  questionId : ObjectId("88abc190ef0288abc190ef35"),
  text: 'from my point of view',
  createdAt: "2021-09-17T04:25:07.803Z",
  updatedAt: "2021-09-17T04:25:07.803Z",
}
```
