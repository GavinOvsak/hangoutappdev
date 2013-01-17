function makeUserKey(id, key) {
    return id + ':' + key;
}
function getUserHangoutId() {
    return gapi.hangout.getLocalParticipantId();
}
function updateLocalDataState(state, metadata) {
    state_ = state;
    metadata_ = metadata;
}
function updateLocalParticipantsData(participants) {
    participants_ = participants;
    refresh();
}

var state_ = null;
var metadata_ = null;
var participants_ = null;
var isleader = true;
var isAccepting = false;
var superGroup1;
var superGroup2;
var questionInput = null;
var answerInputs = [];
var question = null;
var answers = [];
var question2 = null;
var answers2 = [];
var dropDown = null;
var letters = ['A','B','C','D'];
var Writing = null;
var Accepting = null;
var peoplePoints = [];
var checkBoxes = [];
var bars = [];
var percent = null;
var submit = null;
var answerRows = [];
var answerRows2 = [];
var handButton = null;
var pointBar = null;
var peopleTable = null;
var handsButton = null;
var submitted = null;
var hostRequest = null;
var pointsButton = null;
var questionButton = null;
var responseButton = null;
var showQuestion = true;

function launch(){
    if(state_['acceptingResponses'] === 'true')
    {
        refresh();
    }
    var delta = {question: questionInput.val().substring(0,120)};
    delta['correct'] = 'A';
    for(var i = 0; i < state_['numAnswers']; i++)
    {
        delta['answer' + (i + 1)] = answerInputs[i].val();
        if(checkBoxes[i].attr('checked'))
        {
            delta['correct'] = letters[i];
        }
    }
    for(var i = 0; i < participants_.length; i++)
    {
        delta[makeUserKey(participants_[i].id,'answer')] = '0';
    }
    delta['acceptingResponses'] = 'true';
    isAccepting = true;
    gapi.hangout.data.submitDelta(delta);
}

function choose(){
    if(state_.acceptingResponses === 'true' && state_[makeUserKey(getUserHangoutId(),'answer')] === '0')
    {
        $('.answer').removeClass('orange');
        $('.answer').addClass('blue');
        $(this).toggleClass('orange');
        $(this).toggleClass('blue');
        myAnswer = $(this).attr('data-answer');
    }
}

function handRaised(){
    var delta = {};
    if(myHand === 0){
        myHand = parseInt(state_['largestHand']) + 1;
        delta['largestHand'] = ''+myHand;
    }else{
        delta['largestHand'] = ''+(parseInt(state_['largestHand']) - 1);
        delta['lastHand'] = ''+myHand;
        myHand = 0;
    }
    $(this).text((myHand === 0)?'Raise Hand':'Put Down Hand');
    gapi.hangout.data.submitDelta(delta);
}

function changeRows(){
    var delta = {};
    delta['numAnswers'] = ''+dropDown.val();
    gapi.hangout.data.submitDelta(delta);
}

function prepareAppDOM() {
    console.log('L');
    canvas = $('<canvas />').height("600").width("600")[0];
    var body = $('body');
    dropDown = $('<select />').attr({'name':'AnswerNum'}).change(changeRows);
    var op1 = $('<option />').attr({'value':'1'}).text('1');
    var op2 = $('<option />').attr({'value':'2'}).text('2');
    var op3 = $('<option />').attr({'value':'3'}).text('3');
    var op4 = $('<option />').attr({'value':'4'}).text('4');
    
    switch(state_['numAnswers']){
        case '1':
            op1.attr('selected','true');
            break;
        case '2':
            op2.attr('selected','true');
            break;
        case '3':
            op3.attr('selected','true');
            break;
        case '4':
            op4.attr('selected','true');
            break;
    }
    
    dropDown.append(op1);
    dropDown.append(op2);
    dropDown.append(op3);
    dropDown.append(op4);
    superGroup1 = $('<div />');
    superGroup2 = $('<div />');
    
    var switchButton = $('<button />').text(isleader? 'Become Follower' : 'Become Leader')
    .click(function(){
           //isleader = !isleader;
           $(this).text(isleader? 'Become Follower' : 'Become Leader');
           refresh();
           });
    switchButton.hide();
    body.append($('<h1 />').text('Q & A').attr({align:'center'}));
    body.append($('<div />').append(switchButton).attr({align:'center'}));
    pointBar = $('<h4 />').attr({align:'center'});
    if(state_.pointsOn === 'true'){
        pointBar.show();
        pointBar.text('Points: ' + state_[makeUserKey(getUserHangoutId(),'points')]);
    }else{
        pointBar.hide();
    }
    superGroup1.append(pointBar);
    question = $('<h2 />').text(state_.question);//.attr({'padding':'15px'});
    if(state_['acceptingResponses'] === 'true')
    {
        question.show();
    }
    else
    {
        question.hide();
    }
    superGroup1.append(question);
    for(var i = 0; i < 4; i++)
    {
        answers[i] = $('<div />').text(letters[i] + ': ' + state_['answer'+(i+1)]).addClass('blue').addClass('answer').attr({'data-answer':letters[i]}).click(choose);
        if(i < state_['numAnswers'] && state_['acceptingResponses'] === 'true')
        {
            answers[i].show();
        }
        else
        {
            answers[i].hide();
        }
        superGroup1.append(answers[i]);
    }
    submit = $('<div />').text('Submit').attr({align:'center'}).addClass('grey').click(submitResponse);
    if(state_['acceptingResponses'] === 'true')
    {
        submit.show();
    }
    else
    {
        submit.hide();
    }
    submitted = $('<div />').text((state_['acceptingResponses']==='true' && myAnswer !== '0')?'Answer submitted. Please wait for everyone to submit their answers.':'Waiting for a new question.').attr({align:'center'}).hide();
    superGroup1.append(submit);
    superGroup1.append(submitted);
    superGroup1.append($('<br>'));
    superGroup1.append($('<br>'));
    
    superGroup1.append($('<div />').append($('<img />').attr({
                                                             'src': 'https://staticstoregavin.appspot.com/static/clearHand.png',
                                                             'title': 'Raise Hand',
                                                             'width': 150,
                                                             'height': 150
                                                             })).attr({align:'center'}).addClass('hands'));
    handButton = $('<div />').text((myHand === 0)?'Raise Hand':'Put Down Hand').attr({align:'center'}).addClass('grey').addClass('hands').click(handRaised);
    superGroup1.append(handButton);
    Writing = $('<div />');
    Writing.append($('<p />').text('Question:'));
    questionInput = $('<textarea />').attr({'rows':'3','cols':'30'}).text(state_.question);
    Writing.append(questionInput);
    
    var numTable = $('<table />').attr({align:'center'});
    numTable.append($('<tr />').append($('<td />').append( $('<p />').text('Number of Answers') ) )
                    .append($('<td />').append(dropDown) )
                    );
    Writing.append(numTable);
    
    var table = $('<table />');
    for(var i = 0; i < 4; i++)
    {
        answerRows[i] = $('<tr />');
        answerRows[i].append($('<td />').append($('<p />').text(letters[i]+': ')).width('15px'));
        checkBoxes[i] = $('<input />').attr({'type':'radio','value':'A','name':'answer'});
        if(letters[i] === state_['correct'])
        {
            checkBoxes[i].attr({'checked':'true'});
        }
        answerRows[i].append($('<td />').append(checkBoxes[i]).width('15px'));
        answerInputs[i] = $('<textarea />').text(state_['answer' + (i+1)]).attr({resize:'none'});
        answerRows[i].append($('<td />').append(answerInputs[i]));
        table.append(answerRows[i]);
        if(i < parseInt(state_['numAnswers']))
        {
            answerRows[i].show();
        }
        else
        {
            answerRows[i].hide();
        }
    }
    Writing.append($('<form />').append(table));
    Writing.append($('<div />').text('Launch Question').attr({align:'center'}).addClass('grey').click(launch));
    
    Accepting = $('<div />');
    
    questionButton = $('<div />').text(showQuestion?'Hide Question':'Show Question').attr({align:'center'}).addClass('grey').click(function(){showQuestion = !showQuestion;$(this).text(showQuestion?'Hide Question':'Show Question');hideAllOverlays();createCanvas();});
    responseButton = $('<div />').text((state_['responsesOn'] === 'true')?'Hide Responses':'Show Responses').attr({align:'center'}).addClass('grey').click(function(){gapi.hangout.data.submitDelta({'responsesOn':(state_['responsesOn'] === 'true')?'false':'true'});});
    Accepting.append(questionButton);
    Accepting.append(responseButton);
    question2 = $('<h2 />').text(state_.question);
    Accepting.append(question2);
    
    var table2 = $('<table />');
    for(var i = 0; i < 4; i++)
    {
        answerRows2[i*2+0] = $('<tr />');
        answerRows2[i*2+0].append($('<td />').append($('<p />').text(letters[i]+':')).width('15px'));
        answers2[i] = $('<p />').text(state_['answer' + (i+1)]);
        answerRows2[i*2+0].append($('<td />').append(answers2[i]));
        table2.append(answerRows2[i*2+0]);
        answerRows2[i*2+1] = $('<tr />');
        answerRows2[i*2+1].append($('<td />').append($('<p />').text('')).width('15px'));
        bars[i] = $('<div />').text(' 0').attr({'style':'width:10px;height:20px;line-height:20px'}).addClass((i+1 === parseInt(state_['correct']))?'green':'red');
        answerRows2[i*2+1].append($('<td />').append(bars[i]));
        table2.append(answerRows2[i*2+1]);
        if(i < parseInt(state_['numAnswers']))
        {
            answerRows2[i*2+0].show();
            answerRows2[i*2+1].show();
        }
        else
        {
            answerRows2[i*2+0].hide();
            answerRows2[i*2+1].hide();
        }
    }
    Accepting.append(table2);
    percent = $('<h5 />').text('0/'+participants_.length+' (0%) of responses are in.').attr({align:'center'});
    Accepting.append(percent);
    Accepting.append($('<div />').text('Stop Collecting Reponses').attr({align:'center'}).addClass('grey').click(function(){if(state_.acceptingResponses === 'true'){$(this).text('Make New Question');addPoints();}else{$(this).text('Stop Collecting Reponses');isAccepting = false;refresh();}}));
    
    superGroup2.append(Writing);
    superGroup2.append(Accepting);
    
    superGroup2.append($('<br>'));
    pointsButton = $('<div />').text((state_.pointsOn==='true')?'Hide Points':'Show Points').attr({align:'center'}).addClass('grey').click(function(){gapi.hangout.data.submitDelta({'pointsOn':(state_.pointsOn === 'true')?'false':'true'});});
    superGroup2.append(pointsButton);
    
    peopleTable = $('<table />');
    for(var i = 0; i < participants_.length; i++)
    {
        if(state_[makeUserKey(participants_[i].id,'points')])
        {
            var tableRow = $('<tr />');
            tableRow.append($('<td />').append($('<p />').text(participants_[i].person.displayName)).width('140px').attr({align:'right'}));
            tableRow.append($('<td />').append($('<div />').text("-")).width('15px').addClass('inc').attr({align:'center','data-id':participants_[i].id}).click(decrease));
            peoplePoints[i] = $('<div />').text(state_[makeUserKey(participants_[i].id,'points')]);
            tableRow.append($('<td />').append(peoplePoints[i]).width('15px'));
            tableRow.append($('<td />').append($('<div />').text("+")).width('15px').addClass('inc').attr({align:'center','data-id':participants_[i].id}).click(increase));
            if(participants_[i].id !== getUserHangoutId())
            {
                peopleTable.append(tableRow);
            }
        }
    }
    superGroup2.append(peopleTable);
    handsButton = $('<div />').text((state_.handsOn==='true')?'Turn Off Hands':'Turn On Hands').attr({align:'center'}).addClass('grey').click(function(){
                                                                                                                                              var delta = {};
                                                                                                                                              delta['handsOn'] = (state_.handsOn === 'true')?'false':'true';
                                                                                                                                              delta['largestHand'] = '0';
                                                                                                                                              gapi.hangout.data.submitDelta(delta);
                                                                                                                                              });
    superGroup2.append(handsButton);
    
    if(isleader)
    {
        superGroup1.hide();
        superGroup2.show();
    }else{
        superGroup1.show();
        superGroup2.hide();
    }
    
    if(isAccepting)
    {
        Accepting.show();
        Writing.hide();
    }else{
        Accepting.hide();
        Writing.show();
    }
    
    body.append(superGroup1);
    body.append(superGroup2);
    body.append($('<br>'));
    body.append($('<br>'));
    body.append($('<div />').append($('<a href="https://docs.google.com/document/d/1hIqemgZO8x7qSOqW4GhYPAFDuL7c8pUXiF7jLinzFHI/edit" target="_blank"/>').text('Q & A Instructions')).attr({align:'center'}));
    body.append($('<br>'));
    hostRequest = $('<div />').text('Request to be the Host').addClass('grey').attr({align:'center'}).click(function(){gapi.hangout.data.submitDelta({'wantstobeleader':getUserHangoutId(),'wantstobeleadername':gapi.hangout.getLocalParticipant().person.displayName});});
    if(isleader)
    {
        hostRequest.hide();
    }
    else
    {
        hostRequest.show();
    }
    body.append(hostRequest);
}

function submitResponse(){
    if(myAnswer != '0')
    {
        $(this).hide();
        var delta = {};
        delta[makeUserKey(getUserHangoutId(),'answer')] = myAnswer;
        gapi.hangout.data.submitDelta(delta);
        submitted.text((state_['acceptingResponses']==='true' && myAnswer !== '0')?'Answer submitted. Please wait for everyone to submit their answers.':'Waiting for a new question.').show();
    }
}

function decrease(){
    var delta = {};
    delta[makeUserKey($(this).attr('data-id'),'points')] = ''+(parseInt(state_[makeUserKey($(this).attr('data-id'),'points')]) - 1);
    gapi.hangout.data.submitDelta(delta);
}

function increase(){
    var delta = {};
    delta[makeUserKey($(this).attr('data-id'),'points')] = ''+(parseInt(state_[makeUserKey($(this).attr('data-id'),'points')]) + 1);
    gapi.hangout.data.submitDelta(delta);
}

function addPoints(){
    var delta = {};
    for(var i = 0; i < participants_.length; i++)
    {
        if(peoplePoints && peoplePoints[i])
        {
            if(state_[makeUserKey(participants_[i].id,'answer')] === state_.correct)
            {
                delta[makeUserKey(participants_[i].id,'points')] = ''+(parseInt(state_[makeUserKey(participants_[i].id,'points')]) + 1);
            }
        }
    }
    delta['acceptingResponses'] = 'false';
    gapi.hangout.data.submitDelta(delta);
}

var oldLargestHand = 0;

function refresh(){
    if(state_['wantstobeleader'] !== '0' && isleader)
    {
        var delta = {};
        if(state_['wantstobeleader'] !== getUserHangoutId())
        {
            var reply = confirm('Do you want to let '+state_['wantstobeleadername']+' become the controller of questions in this hangout? If not, cancel.');
            if(reply)
            {
                delta['leader'] = state_['wantstobeleader'];
            }
        }
        delta['wantstobeleader'] = '0';
        gapi.hangout.data.submitDelta(delta);
    }
    else
    {
        var newParticipants_ = gapi.hangout.getParticipants();
        participants_ = newParticipants_;
        peopleTable.empty();
        for(var i = 0; i < participants_.length; i++)
        {
            if(participants_[i].id !== getUserHangoutId() && state_[makeUserKey(participants_[i].id,'points')])
            {
                var tableRow = $('<tr />');
                tableRow.append($('<td />').append($('<p />').text(participants_[i].person.displayName)).width('140px').attr({align:'right'}));
                tableRow.append($('<td />').append($('<div />').text("-")).width('15px').addClass('inc').attr({align:'center','data-id':participants_[i].id}).click(decrease));
                peoplePoints[i] = $('<div />').text(state_[makeUserKey(participants_[i].id,'points')]);
                tableRow.append($('<td />').append(peoplePoints[i]).width('15px'));
                tableRow.append($('<td />').append($('<div />').text("+")).width('15px').addClass('inc').attr({align:'center','data-id':participants_[i].id}).click(increase));
                peopleTable.append(tableRow);
            }
        }
        var needNewLeader = true;
        for(var i = 0; i < participants_.length && needNewLeader; i++)
        {
            if(participants_[i].id === state_['leader'])
            {
                needNewLeader = false;
            }
        }
        if(needNewLeader && getUserHangoutId() === participants_[0].id)
        {
            
            var delta = {};
            delta['leader'] = getUserHangoutId();
            gapi.hangout.data.submitDelta(delta);
        }
        else
        {
            isleader = getUserHangoutId() === state_.leader;
            
            myAnswer = state_[makeUserKey(getUserHangoutId(),'answer')];
            if(state_.acceptingResponses === 'true' && state_[makeUserKey(getUserHangoutId(),'answer')] === '0'){
                $('.answer').removeClass('orange');
                $('.answer').addClass('blue');
                submit.show();
                submitted.hide();
            }
            else
            {
                submit.hide();
                submitted.show();
                submitted.text((state_['acceptingResponses']==='true' && myAnswer !== '0')?'Answer submitted. Please wait for everyone to submit their answers.':'Waiting for a new question.');
            }
            
            if(state_.acceptingResponses === 'true')
            {
                question.show();
            }
            else
            {
                question.hide();
            }
            
            handsButton.text((state_.handsOn === 'true')?'Turn Off Hands':'Turn On Hands');
            pointsButton.text((state_.pointsOn === 'true')?'Hide Points':'Show Points');
            responseButton.text((state_.responsesOn === 'true')?'Hide Responses':'Show Responses');
            
            if(state_.handsOn === 'true'){
                $('.hands').show();
            }else{
                $('.hands').hide();
            }
            
            if(state_['largestHand'] < oldLargestHand && myHand != 0 && myHand > state_['lastHand'])
            {
                myHand--;
            }
            oldLargestHand = state_['largestHand']
            if(state_.handsOn !== 'true')
            {
                myHand = 0;
                handButton.text((myHand === 0)?'Raise Hand':'Put Down Hand')
            }
            
            var results = [0,0,0,0];
            var total = 0;
            for(var i = 0; i < participants_.length; i++)
            {
                if(peoplePoints && peoplePoints[i] && participants_[i].id !== state_.leader)
                {
                    peoplePoints[i].text(state_[makeUserKey(participants_[i].id,'points')]);
                    switch(state_[makeUserKey(participants_[i].id,'answer')])
                    {
                        case 'A':
                            results[0]++;
                            total++;
                            break;
                        case 'B':
                            results[1]++;
                            total++;
                            break;
                        case 'C':
                            results[2]++;
                            total++;
                            break;
                        case 'D':
                            results[3]++;
                            total++;
                            break;
                    }
                }
            }
            
            var largest = 0;
            for(a in results)
            {
                if(results[a] > largest)
                {
                    largest = results[a];
                }
            }
            
            question.text(state_.question);
            if(question2)
            {
                question2.text(state_.question);
            }
            for(var i = 0; i < 4; i++)
            {
                if(i < state_['numAnswers'])
                {
                    answers[i].text(letters[i] + ': ' + state_['answer'+(i+1)]);
                    if(answers2 && answers2[i])
                    {
                        answers2[i].text(state_['answer'+(i+1)]);
                    }
                    bars[i].text(' ' + results[i]);
                    bars[i].removeClass('green').removeClass('red');
                    if(letters[i] === state_['correct'])
                    {
                        bars[i].addClass('green');
                    }
                    else
                    {
                        bars[i].addClass('red');
                    }
                    if(largest > 0)
                    {
                        bars[i].width((250/largest)*results[i]+10);
                    }
                    else
                    {
                        bars[i].width(10);
                    }
                    if(answerRows[i]){answerRows[i].show();}
                    if(answerRows2[i*2+0]){answerRows2[i*2+0].show();}
                    if(answerRows2[i*2+1]){answerRows2[i*2+1].show();}
                    if(answers[i]){
                        if(state_.acceptingResponses === 'true'){
                            answers[i].show();
                        }else{
                            answers[i].hide();
                        }
                    }
                }
                else
                {
                    if(answerRows[i]){answerRows[i].hide();}
                    if(answerRows2[i*2+0]){answerRows2[i*2+0].hide();}
                    if(answerRows2[i*2+1]){answerRows2[i*2+1].hide();}
                    if(answers[i] || state_.acceptingResponses !== 'true'){answers[i].hide();}
                }
            }
            myPoints = state_[makeUserKey(getUserHangoutId(),'points')];
            if(state_.pointsOn === 'true'){
                pointBar.show();
                pointBar.text('Points: ' + state_[makeUserKey(getUserHangoutId(),'points')]);
            }else{
                pointBar.hide();
            }
            if(participants_.length > 1)
            {
                percent.text(''+total+'/'+(participants_.length-1)+' ('+Math.floor(total*100.0/(participants_.length - 1))+'%) of responses are in.');
            }
            else
            {
                percent.text('Where is everybody? Invite some people to join you in this app and answer your questions!');
            }
            if(isleader)
            {
                superGroup1.hide();
                superGroup2.show();
                hostRequest.hide();
            }else{
                superGroup1.show();
                superGroup2.hide();
                hostRequest.show();
            }
            
            if(isAccepting)
            {
                Accepting.show();
                Writing.hide();
            }else{
                Accepting.hide();
                Writing.show();
            }
            hideAllOverlays();
            createCanvas();
        }
    }
}

var prepareCanvasContext = function(canvas,h,w){
    canvas.canvas.width = w;
    canvas.canvas.height = h;
    canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    canvas.textAlign = "left";
    canvas.textBaseline = "top";
}

var scaleSize = function(maxHeight, width, height){
	var ratio = maxHeight / height;
	width = width * ratio;
	height = maxHeight;
	return[width, height];
}

var overlays = {};

var canvas = null;

var createImageResourceFromCanvas = function(canvas){
	return gapi.hangout.av.effects.createImageResource(canvas.toDataURL());
}

var myPoints = '0';
var myAnswer = 'A';
var myHand = 0;

var createCanvas = function(){
    var canvasContext = canvas.getContext("2d");
    prepareCanvasContext(canvasContext,600,600);
    var followerView = function(){
        canvasContext.save();
        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.restore();
        var color = [221, 75, 57];
        var box_bottom = new Rectangle(0, 45, 450, 20, '#3e3e3e');
        var color_top = 'rgba('+ color[0] +', '+ color[1] +', '+ color[2]+', 1)';
        var box_top = new Rectangle(0, 12, 580, 33, color_top, true);
        if(state_['responsesOn'] === 'true')
        {
            if(myAnswer === '0')
            {
                var answerBox = new Rectangle(13, 10, 40, 50, '#3e3e3e', false);
                answerBox.draw(canvasContext);
            }
            else if(state_['acceptingResponses'] === 'true')
            {
                var answerBox = new Rectangle(13, 10, 40, 50, '#5695E8', false);
                answerBox.draw(canvasContext);
            }
            else
            {
                var color = (myAnswer === state_['correct'])? '#64991e' : '#d81b21';
                var answerBox = new Rectangle(13, 10, 40, 50, color, false);
                answerBox.draw(canvasContext);
                drawTextToCanvas(myAnswer, 20, 10, 40, "white");
            }
        }
        if(state_.pointsOn === 'true')
        {
            var pointBox = new Rectangle(590 - 25*myPoints.length, 10, 25*myPoints.length, 50, '#F2DB57', false);
            pointBox.draw(canvasContext);
            drawTextToCanvas('' + myPoints, 590 - 25*myPoints.length, 10, 40, "black");
        }
        var text_top_color = "black";
        if(state_.handsOn === 'true' && myHand > 0)
        {
            var handImage = gapi.hangout.av.effects.createImageResource('https://staticstoregavin.appspot.com/static/clearHand.png');
            overlays['hand'] = handImage.createOverlay({});
            overlays['hand'].setScale(.15, gapi.hangout.av.effects.ScaleReference.WIDTH);
            overlays['hand'].setPosition(0.42, 0.30);
            if(!isleader)
            {
                overlays['hand'].setVisible(true);
            }
            drawTextToCanvas('' + myHand, 545, 265, 40, "black");
        }
        var followerimage = createImageResourceFromCanvas(canvasContext.canvas);
        overlays['follower'] = followerimage.createOverlay({});
        overlays['follower'].setScale(1, gapi.hangout.av.effects.ScaleReference.WIDTH);
        overlays['follower'].setPosition(0, 0.40);
        if(!isleader)
        {
            overlays['follower'].setVisible(true);
        }
    }
    
    var getWordCut = function(string, from, length)
    {
        for(var i = from + length; i > from && string[i] && string[i] !== ' '; i--){}
        return i;
    };
    
    var leaderView = function(){
        
        
        canvasContext.save();
        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.restore();

        var color = [221, 75, 57];
        
        if(showQuestion && isAccepting)
        {
            var end1 = getWordCut(state_.question,0,40);
            var end2 = getWordCut(state_.question,end1,40);
            var end3 = getWordCut(state_.question,end2,40);
            
            var numRows = 1;
            if(end1 < state_.question.length)
            {
                numRows = 2;
            }
            if(end2 < state_.question.length)
            {
                numRows = 3;
            }
            
            var questionBox = new Rectangle(40, 230 - 25 * numRows + ((state_.numAnswers >= 3)?0:30), 530, (numRows + 1) * 25 - 5, '#3e3e3e');
            questionBox.draw(canvasContext);
            var color_top = 'rgba('+ color[0] +', '+ color[1] +', '+ color[2]+', 1)';
            var text_top_color = "black";
            
            drawTextToCanvas(state_.question.substring(0,end1), 45, 235 - 25 * numRows + ((state_.numAnswers >= 3)?0:30), 25, "white");
            drawTextToCanvas(state_.question.substring(end1+1,end2), 45, 265 - 25 * numRows + ((state_.numAnswers >= 3)?0:30), 25, "white");
            drawTextToCanvas(state_.question.substring(end2+1,end3), 45, 295 - 25 * numRows + ((state_.numAnswers >= 3)?0:30), 25, "white");
            
            var box1 = new Rectangle(50, 260 + ((state_.numAnswers >= 3)?0:30), 240, 30, color_top);
            box1.draw(canvasContext);
            drawTextToCanvas('A: ' + state_.answer1.substring(0,25), 55, 265 + ((state_.numAnswers >= 3)?0:30), 18, "white");
            if(state_.numAnswers >= 2)
            {
                var box2 = new Rectangle(330, 260 + ((state_.numAnswers >= 3)?0:30), 240, 30, color_top);
                box2.draw(canvasContext);
                drawTextToCanvas('B: ' + state_.answer2.substring(0,25), 335, 265 + ((state_.numAnswers >= 3)?0:30), 18, "white");
            }
            if(state_.numAnswers >= 3)
            {
                var box3 = new Rectangle(50, 300, 240, 30, color_top);
                box3.draw(canvasContext);
                drawTextToCanvas('C: ' + state_.answer3.substring(0,25), 55, 305, 18, "white");
            }
            if(state_.numAnswers >= 4)
            {
                var box4 = new Rectangle(330, 300, 240, 30, color_top);
                box4.draw(canvasContext);
                drawTextToCanvas('D: ' + state_.answer4.substring(0,25), 335, 305, 18, "white");
            }
        }
        var leaderimage = createImageResourceFromCanvas(canvasContext.canvas);
        
        overlays['leader'] = leaderimage.createOverlay({});
        overlays['leader'].setScale(1, gapi.hangout.av.effects.ScaleReference.WIDTH);
        overlays['leader'].setPosition(0, 0.40);
        
        if(isleader)
        {
            overlays['leader'].setVisible(true);
        }
    }
    
    followerView();
    leaderView();
    if(isleader)
    {
        overlays['follower'].setVisible(false);
        if(overlays['hand'])
        {
            overlays['hand'].setVisible(false);
        }
    }
    else
    {
        overlays['leader'].setVisible(false);
    }
}

function hideAllOverlays() {
    for (var index in overlays) {
        overlays[index].setVisible(false);
    }
}

var Rectangle = function(x, y, width, height, color, shadow) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.shadow = shadow;
}

Rectangle.prototype.draw = function(context) {
    context.restore();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
    context.shadowColor = null;
    context.shadowBlur  = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
}

var drawTextToCanvas = function(text, x, y, size, color, font){
    var canvasContext = canvas.getContext("2d");
    canvasContext.font = size + "px " + (font ? font : "Arial");
    canvasContext.fillStyle = color || "black";
    canvasContext.fillText(text, x, y);
};

(function() {
 if (gapi && gapi.hangout) {
 
 var initHangout = function(apiInitEvent) {
 if (apiInitEvent.isApiReady) {
 
 state_ = gapi.hangout.data.getState();
 participants_ = gapi.hangout.getParticipants();
 
 var delta = {};
 if(!state_.question)
 {
 state_ = {leader: getUserHangoutId(), question: 'What is 2+3?', numAnswers : '3', answer1: '4', answer2: '5', answer3: '6', answer4: '7', correct: 'B', handsOn: 'true', pointsOn: 'true', responsesOn: 'true', largestHand: '0', acceptingResponses: 'false', lastHand:'0', wantstobeleader:'0', wantstobeleadername: ''};
 delta = {leader: getUserHangoutId(), question: 'What is 2+3?', numAnswers : '3', answer1: '4', answer2: '5', answer3: '6', answer4: '7', correct: 'B', handsOn: 'true', pointsOn: 'true', responsesOn: 'true', largestHand: '0', acceptingResponses: 'false', lastHand:'0', wantstobeleader:'0', wantstobeleadername: ''};
 }
 delta[makeUserKey(getUserHangoutId(),'points')] = '0';
 delta[makeUserKey(getUserHangoutId(),'answer')] = '0';
 delta[makeUserKey(getUserHangoutId(),'hand')] = '0';
 state_[makeUserKey(getUserHangoutId(),'points')] = '0';
 state_[makeUserKey(getUserHangoutId(),'answer')] = '0';
 state_[makeUserKey(getUserHangoutId(),'hand')] = '0';
 
 gapi.hangout.data.submitDelta(delta);
 
 isleader = getUserHangoutId() === state_.leader;
 prepareAppDOM();
 createCanvas();
 
 gapi.hangout.data.onStateChanged.add(function(stateChangeEvent) {
                                      console.log('State Changed!');
                                      updateLocalDataState(stateChangeEvent.state,
                                                           stateChangeEvent.metadata);
                                      refresh();
                                      });
 gapi.hangout.av.onParticipantsChanged.add(function(partChangeEvent) {
                                           updateLocalParticipantsData(partChangeEvent.participants);
                                           });
 
 gapi.hangout.av.setLocalParticipantVideoMirrored(false);
 console.log("mirror: " + gapi.hangout.av.isLocalParticipantVideoMirrored());
 
 if (!state_) {
 var state = gapi.hangout.data.getState();
 var metadata = gapi.hangout.data.getStateMetadata();
 if (state && metadata) {
 updateLocalDataState(state, metadata);
 }
 }
 if (!participants_) {
 var initParticipants = gapi.hangout.getParticipants();
 if (initParticipants) {
 updateLocalParticipantsData(initParticipants);
 }
 }
 
 gapi.hangout.onApiReady.remove(initHangout);
 
 }
 };
 
 gapi.hangout.onApiReady.add(initHangout);
 }
 })();