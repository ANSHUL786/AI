const fs = require('fs');
let reportData = {}
let taskDetailArr = []
let responseArrWithTaskId = []

fs.readFile('report.json', '', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    try {
        reportData = JSON.parse(data)

        //flatting the group into task
        //for task data
        if (reportData && reportData.testDetails && reportData.testDetails.tasks) {
            reportData.testDetails.tasks.forEach(eachArr => {
                //if case for groups
                if (eachArr.subTasks && eachArr.subTasks.length > 0) {
                    eachArr.subTasks.forEach((eachSubTask) => {
                        taskDetailArr.push(eachSubTask)
                    })
                }
                else {
                    taskDetailArr.push(eachArr)
                }

            })
        }
        console.log(taskDetailArr)

        //storing the taskid with each user response of that task
        taskDetailArr.forEach((eachTask, index) => {
            let responseObject = {
                "Task number": index + 1,
                "taskID": eachTask.id,
                "taskDesc": eachTask.description,
                "type": eachTask.type==5? "Survey Question" : "Navigation Task",
                "testerResponse": [],
                "numberOfParticipant": 0
            }
            reportData.logs.forEach((eachLog) => {
                let userResponse = {
                    "userID":eachLog.user_id,
                    "taskResponse": {},
                    "result": 0,
                    "taskDurationInSeconds": 0,
                    "gender": eachLog.user_data?.gender == "U" ? "Not defined" : eachLog.user_data?.gender == "M" ? "Male" : "Female",
                    "country": eachLog.user_data?.nationality == "OT" ? "Not defined" : eachLog.user_data?.nationality
                }
                userResponse.taskResponse = eachLog.sessions.find((eachTaskSession) => eachTaskSession.task_id == eachTask.id)
                if (userResponse.taskResponse && eachLog.completed == 1) {
                    userResponse.result = userResponse.taskResponse.result;
                    userResponse.taskDurationInSeconds = userResponse.taskResponse.duration;
                    delete userResponse.taskResponse?.duration;

                    if (userResponse.taskResponse?.window_w) {
                        delete userResponse.taskResponse?.window_w;
                        delete userResponse.taskResponse?.window_h;
                    }

                    if (userResponse.taskResponse?.events) {
                        delete userResponse.taskResponse.events.swipes
                        delete userResponse.taskResponse.events.others
                    }
                    userResponse.taskResponse.surveyanswer = [];
                    userResponse.taskResponse.otherOptionanswer = []
                    if (eachTask.type == 5) {
                        userResponse.taskResponse.surveyanswer = userResponse.taskResponse.question.answers.map((eachAnswer) => {
                            if (userResponse.taskResponse.question.type === "textbox") {
                                return eachAnswer.value;
                            } else {
                                return eachAnswer.option.name;
                            }
                        });

                        userResponse.taskResponse.surveyOption = userResponse.taskResponse.question.options.map((eachoption) => eachoption.name);
                        userResponse.taskResponse.otherOptionanswer = userResponse.taskResponse.question.otherOptions;
                        userResponse.taskResponse.surveyQuestionImages = userResponse.taskResponse.question.images;
                        userResponse.taskResponse.questionType = userResponse.taskResponse.question.type
                        delete userResponse.taskResponse.pagesDetail;
                        delete userResponse.taskResponse.events;
                        delete userResponse.taskResponse.question;
                        delete userResponse.result;
                    }


                    delete userResponse.taskResponse.pages;
                    delete userResponse.taskResponse.result;
                    delete userResponse.taskResponse.answer;

                    responseObject.testerResponse.push(userResponse)
                }
            })
            responseObject.numberOfParticipant = responseObject.testerResponse.length
            responseArrWithTaskId.push(responseObject)
        })

    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }


    fs.writeFile('optimizedJSON.json', JSON.stringify(responseArrWithTaskId, null, 2), err => {
        if (err) {
            console.error('Error writing to file2.json:', err);
        } else {
            console.log('Processing complete. Output written to file2.json.');
        }
    });
})

