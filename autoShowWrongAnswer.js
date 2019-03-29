function showWrongAnswer(input_data) {
	if (!input_data.examSubmit.submitContent) {
        console.log("请先手动暂存答案一次，再运行本脚本！");
        console.log("此后可不经暂存直接在本页面上运行本脚本。");
        return;
    }
    var pre_submit_content = JSON.parse(input_data.examSubmit.submitContent);
    var submit_content = [];
    var total_time = 0;
    var total_score = 0;
    for (var i = 0; i < pre_submit_content.length; i = i + 1) {
        submit_content.push(JSON.parse(pre_submit_content[i]));
        submit_content[i].useTime = Math.ceil(Math.random() * 60) + 60;
        total_time = total_time + parseInt(submit_content[i].useTime);
        total_score = total_score + parseInt(submit_content[i].markQuizScore);
        // if (submit_content[i].errorFlag != "right") {
        //     document.querySelectorAll(".p-no")[i].style = "color:red;";
        // }
        // else document.querySelectorAll(".p-no")[i].style = "";
    }
    post_data.submitquizs = submit_content;
    post_data.useTime = total_time.toString();
    post_data.totalScore = total_score.toString();
    post_data.testPaperId = examTestPaperId;

    for (var i = 0; i < post_data.submitquizs.length; i = i + 1) {
    	ith_answers = document.querySelectorAll("[quiz_id=\"" + post_data.submitquizs[i].quizId + "\"] .test-options .t-option");
    	var tmp_answers = [];
    	for (var j = 0; j < ith_answers.length; j = j + 1) {
    		if (ith_answers[j].querySelectorAll(".selected")[0]) {
    			tmp_answers.push(ith_answers[j].attributes.option_id.value);
    		}
    	}
    	post_data.submitquizs[i].userAnswer = tmp_answers.join(',');
    }
    var post_url = "https://" + document.domain + "/examSubmit/" + document.getElementById("courseOpenId").value + "/saveExam/1/" + examPaperId + "/" + examSubmitId +".mooc?testPaperId="+ examTestPaperId;
    for (var i = 0; i < post_data.submitquizs.length; i = i + 1) {
        post_data.submitquizs[i] = JSON.stringify(post_data.submitquizs[i]);
    }
    // console.log(post_data);

    $.ajax({
        type: 'POST',
        url: post_url,
        data: post_data,
        success: function(data){
                input_data = JSON.parse(data);
        },
        error: function(){
            console.log("网络请求失败，请重试。")
            return;
        },
        async: false
    });

    // $.ajax({
    //     type: 'POST',
    //     url: url_get_ans,
    //     success: function(data){input_data = data;},
    //     error: function(){
    //         console.log("网络请求失败，请重试。")
    //         return;
    //     },
    //     async: false
    // })

    pre_submit_content = JSON.parse(input_data.examSubmit.submitContent);
    submit_content = [];
    total_time = 0;
    total_score = 0;
    for (var i = 0; i < pre_submit_content.length; i = i + 1) {
        submit_content.push(JSON.parse(pre_submit_content[i]));
        if (submit_content[i].errorFlag != "right") {
            document.querySelectorAll(".p-no")[i].style = "color:red;";
            console.log("第" + (i + 1) + "题错误！")
        }
        else document.querySelectorAll(".p-no")[i].style = "";
    }

    console.log("标记已完成。")
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
        console.log("开始尝试获取答案正误信息。");
        console.log("做错的题目的（左上角）选项卡序号将被标红。");
        // console.log(data);
    },
    error: function(){
        console.log("网络请求失败，请重试运行脚本。");
    },
    async: false
});

if (success_flag) showWrongAnswer(tmp_data);
