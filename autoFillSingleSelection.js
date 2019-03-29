function getAnswerDirectly(input_data) {
    var paper_struct = input_data.paper.paperStruct;
    if (!paper_struct[0].quiz.quizResponses.length) return false;
    for (var i = 0; i < paper_struct.length; i = i + 1) {
        var quiz_ans = paper_struct[i].quiz.quizResponses;
        // if (!paper_struct[i].quiz.quizResponses) break;
        for(var j = 0; j < quiz_ans.length; j = j + 1) {
            document.querySelector("[option_id=\"" + quiz_ans[j].optionId + "\"] span a").click();
        }
    }
    // if (paper_struct[0].quiz.quizResponses) {
        // console.log(paper_struct[0].quiz.quizResponses);
    console.log("已自动选择所有正确答案（包括单选题和多选题），可直接提交。");
    console.log("若需要继续在其他页面应用此脚本，建议刷新再使用。");
    // }
    return true;
}

function getAnswerByTrial(input_data) {
    if (!input_data.examSubmit.submitContent) {
        console.log("请先手动暂存答案一次（请勿选择多选题的答案选项），再运行本脚本！");
        return;
    }
    var is_init = true;
    var all_correct = false;
    var counter = 0;
    var got_answer = [];
    var iter = true

    while (!all_correct) {
        if (!iter) return;
        iter = false;
        // counter = counter + 1;
        // console.log(input_data);
        var pre_submit_content = JSON.parse(input_data.examSubmit.submitContent);
        var submit_content = [];
        var total_time = 0;
        var total_score = 0;
        all_correct = true;

        for (var i = 0; i < pre_submit_content.length; i = i + 1) {
            submit_content.push(JSON.parse(pre_submit_content[i]));
            submit_content[i].useTime = Math.ceil(Math.random() * 60) + 60;
            total_time = total_time + parseInt(submit_content[i].useTime);
            total_score = total_score + parseInt(submit_content[i].markQuizScore);
            if (submit_content[i].errorFlag != "right") {
                var temp_element = document.querySelector("[quiz_id=\"" + submit_content[i].quizId + "\"]");
                if (temp_element.attributes.base_type.value != "itt004") all_correct = false;
                // else temp_element.attributes.style.value = temp_element.attributes.style.value + ";color:red!important;";
            }
            else {
                document.querySelector("[option_id=\"" + submit_content[i].userAnswer + "\"] span a").click();
                if (!got_answer[i]) {
                        got_answer[i] = true;
                        console.log("第" + (i + 1) + "题答案获取成功。")
                    }
            }
        }
        if (all_correct) break;

        post_data.submitquizs = submit_content;
        post_data.useTime = total_time.toString();
        post_data.totalScore = total_score.toString();
        post_data.testPaperId = examTestPaperId;

        for (var i = 0; i < post_data.submitquizs.length; i = i + 1) {
            if (is_init && post_data.submitquizs[i].errorFlag != "right") {
                post_data.submitquizs[i].userAnswer = document.querySelector("[quiz_id=\"" + post_data.submitquizs[i].quizId + "\"] .test-options .t-option").attributes.option_id.value;
            }
            else {
                if (post_data.submitquizs[i].errorFlag == "right") {
                    document.querySelector("[option_id=\"" + post_data.submitquizs[i].userAnswer + "\"] span a").click();
                    if (!got_answer[i]) {
                        got_answer[i] = true;
                        console.log("第" + (i + 1) + "题答案获取成功。")
                    }
                }
                else if (document.querySelector("[quiz_id=\"" + post_data.submitquizs[i].quizId + "\"]").attributes.base_type.value == "itt004") continue;
                else {
                    post_data.submitquizs[i].userAnswer = (parseInt(post_data.submitquizs[i].userAnswer) + 1).toString();}
            }
        }
        var post_url = "https://" + document.domain + "/examSubmit/" + document.getElementById("courseOpenId").value + "/saveExam/1/" + examPaperId + "/" + examSubmitId +".mooc?testPaperId="+ examTestPaperId;
        for (var i = 0; i < post_data.submitquizs.length; i = i + 1) {
            post_data.submitquizs[i] = JSON.stringify(post_data.submitquizs[i]);
        }
        // console.log(post_data);

        // 这里可以只用外层POST来获取数据，但js的异步执行太迷了……
        $.ajax({
            type: 'POST',
            url: post_url,
            data: post_data,
            success: function(data){
                input_data = JSON.parse(data);
                is_init = false;
            },
            error: function(){
                console.log("网络请求失败，但不影响正常使用，请耐心等待。")
            },
            async: false
        });

        // $.ajax({
        //     type: 'POST',
        //     url: url_get_ans,
        //     success: function(data){
        //         input_data = data;
        //         is_init = false;
        //     },
        //     error: function(){
        //         console.log("网络请求失败，但不影响正常使用，请耐心等待。")
        //     },
        //     async: false
        // })

        iter = true;
        // if(counter == 1) break;

    }

    console.log("已自动选择所有单选题正确答案，若无多选题，可直接提交。");
    console.log("若需要继续在其他页面应用此脚本，建议刷新再使用。");
}

var url_get_ans = "https://" + document.domain + "/examSubmit/" + document.getElementById("courseOpenId").value + "/getExamPaper-" + examSubmitId + ".mooc?testPaperId=" + examTestPaperId + "&paperId=0&modelType=view";

var post_data = {
    gradeId: 0,
    reSubmit: 0,
    submitquizs: [],
    submitFlag: 0,
    useTime: 0,
    totalScore: 0,
    testPaperId: 0
}

var success_flag = false;
var tmp_data;

$.ajax({
    type: 'POST',
    url: url_get_ans,
    success: function(data){
        tmp_data = data;
        success_flag = true;
        console.log("开始尝试获取答案（请保证运行脚本前多选题选项为空）。")
        console.log("由于题目数量、网络环境、计算机性能等的差异，浏览器可能会假死数秒至数十秒，请耐心等待。")
        // console.log(data);
    },
    error: function(){
        console.log("初始网络请求失败，请重试运行脚本。");
    },
    async:false
});

if (success_flag) if (!getAnswerDirectly(tmp_data)) getAnswerByTrial(tmp_data);




// $.ajax({
//     type: 'POST',
//     url: "https://www.cnmooc.org/portal/addCourse.mooc?courseOpenId=11950&userStudy=20&orgPwd=",
//     success: function(){
//         console.log("1");
//     },
//     error: function(){
//         console.log("0");
//     },
//     async:false
// });
