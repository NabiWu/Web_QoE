// start test:
var getOder = require('../models/random');
var fs = require('fs');

const vid_folder = "poke5";
var vid_path = "./videos/" + vid_folder;
var video_url = "https://raw.githubusercontent.com/tony-ou/web_QoE/main/videos/" + vid_folder + "/";

var num_vids;

fs.readdir(vid_path, function(err, files) {
    num_vids = files.length;
    console.log(vid_path + " has " + num_vids + " files");
});

var post_example = async (ctx, next) => {
    ctx.render('example.html', {
    });
}

var post_start = async (ctx, next) => {
    var active_time = parseFloat(ctx.request.body.active_time);
    var browserName = ctx.request.body.browser;
       var mturkID = ctx.request.body.MTurkID;
    var device = 'N/A';
    var age = ctx.request.body.age;
    var network = ctx.request.body.network;
    var video_order = [];
    for (let i = 0; i < 1; i++) {
        temp = [...getOder(0,1)]
        for (let j = 0 ;j <2; j++){
	    temp2 = [...getOder(0,1)];
	    video_order.push(1 + i * 4  + temp[j]*2 + temp2[0]);
	    video_order.push(1 + i * 4 + temp[j]*2 + temp2[1]);
	}
    }
    video_order.push(5);

	console.log(video_order);
    //var video_order = [1,2,3,4,5,6,7]
    console.log(mturkID, device, age);
    var start = new Date().getTime();
   


 
    let user = {
        mturkID : mturkID,
        device : device,
        age : age,
        network : network,
        video_order : video_order,
        count : 0,
        result : [],
        video_time : [],
        grade_time : [],
        active_video_time: [],
        active_grade_time : [],
        test: [],
        start : start,
        instruction: active_time,
        play: [],
        pause: [],
        seek: [],
        browser: browserName,
        reference: [],
        return : [],
        training : 0,
	timestamp: Date.now()
    };
console.log(Date.now())
    for (i = 0; i < num_vids; i++)
    {
        user.video_time.push(0);
        user.grade_time.push(0);
        user.active_video_time.push(0);
     	user.active_grade_time.push(0);
        user.play.push(0);
        user.pause.push(0);
        user.seek.push(0);
        user.return.push(0)
        user.reference.push(0)
    }
    
    var video_src = video_url + user.video_order[user.count] + ".mp4";
    var title = user.count + "/" + num_vids;
    user.count += 1;
	    let value =  Buffer.from(JSON.stringify(user)).toString('base64');
    ctx.cookies.set('name', value);
    ctx.render('2video.html', {
    title: title,  video_src: video_src
    });
}

var post_grade= async (ctx, next) => {
	var active_time = parseFloat(ctx.request.body.active_time);
    var play = parseFloat(ctx.request.body.play);
    var pause = parseFloat(ctx.request.body.pause);
    var seek = parseFloat(ctx.request.body.seek);
    console.log(active_time)
    var user = ctx.state.user;
    var end = new Date().getTime();
    var exe_time = end - user.start;
    user.video_time[user.count-1] += exe_time;
    user.active_video_time[user.count-1] += active_time;
    user.play[user.count-1] += play;
    user.pause[user.count-1] += pause;
    user.seek[user.count-1] += seek;
    console.log(user.active_video_time)
    
    user.start = end;
    
    let value =  Buffer.from(JSON.stringify(user)).toString('base64');
    ctx.cookies.set('name', value);

    var title = user.count + "/" + num_vids;
    ctx.render('grade.html', {
        title: title, count: user.count, num_vids: num_vids
    });
}




var post_back2video = async (ctx, next) => {
    var user = ctx.state.user;
    var video_src = video_url + user.video_order[user.count - 1] + ".mp4";
    var active_time = parseFloat(ctx.request.body.active_time);
    var end = new Date().getTime();
    var exe_time = end - user.start;
    user.grade_time[user.count-1] += exe_time;
    user.return[user.count-1] += 1;
    if (!isNaN(active_time))
    {
        user.active_grade_time[user.count-1] += active_time;
    }
    user.start = end;
    let value =  Buffer.from(JSON.stringify(user)).toString('base64');
    console.log(user.active_grade_time)
    ctx.cookies.set('name', value);
    var title = user.count + "/" + num_vids;
    if (true) { 
        ctx.render('2video.html', {
        title: title,  video_src: video_src
        });
    }
}


var post_next = async (ctx, next) => {
    var user = ctx.state.user;
    var active_time =parseFloat(ctx.request.body.active_time);
    console.log(active_time)
    var grade = ctx.request.body.sentiment;
    var end = new Date().getTime();
    var exe_time = end - user.start;

    console.log(user.count)  
        var attention_test = Number(ctx.request.body.blur)+ Number(ctx.request.body.stall); 
    user.test.push(attention_test);
    user.result.push(grade);
    

    user.grade_time[user.count-1] += exe_time;
	user.active_grade_time[user.count-1] += active_time;


    user.start = end;
    if(user.count < num_vids) {
        var video_src = video_url + user.video_order[user.count] + ".mp4";
        user.count = user.count + 1;
        var title = user.count + "/" + num_vids;

        // set new cookie
        let value =  Buffer.from(JSON.stringify(user)).toString('base64');
        ctx.cookies.set('name', value);
        if  (true) {
            ctx.render('2video.html', {
                title: title,  video_src: video_src
            });
        }
    }
    else {
         // set new cookie
        let value =  Buffer.from(JSON.stringify(user)).toString('base64');
        ctx.cookies.set('name', value);
        ctx.render('reason.html', {
            title: 'Post Survey Question'
        });
    }
}

var post_end = async (ctx, next) => {
    var user = ctx.state.user;
    
    // set user reason
    var attention_check = ctx.request.body.sentiment
    var reason = ctx.request.body.Reason;
    console.log("reason is " + reason + "\n");
    user.reason = reason;
    attention_check = attention_check || -1;
    user.attention_check = attention_check
    console.log(user.attention_checking);
    // record results
    console.log(user.result);
    var filename = "./results/" + user.mturkID + ".txt";
    var write_data = [];
    var write_test = [];
    var write_video_time = [], write_grade_time =[];
    var write_active_video_time = [], write_active_grade_time = []
    var write_play = [], write_seek = []
    var write_reference = [], write_pause = []
    var write_return = []
     var write_attention_check = user.attention_check 
        console.log(user.play)
        console.log(user.reference)
    for(var i in user.video_order) {
        write_data[user.video_order[i] - 1] = user.result[i];
        write_test[user.video_order[i] - 1] = user.test[i];
        write_video_time[user.video_order[i] - 1] = user.video_time[i];
        write_grade_time[user.video_order[i] - 1] = user.grade_time[i];
		write_active_video_time[user.video_order[i] - 1] = user.active_video_time[i];
        write_active_grade_time[user.video_order[i] - 1] = user.active_grade_time[i];

        write_play[user.video_order[i] - 1] = user.play[i];
        write_pause[user.video_order[i] - 1] = user.pause[i];
        write_seek[user.video_order[i] - 1] = user.seek[i];
        write_reference[user.video_order[i] -1 ]= user.reference[i];
write_return[user.video_order[i] -1 ]= user.return[i];
        write_timestamp = user.timestamp;
	    if (i == 2)
            write_return[user.video_order[i] -1 ]-=1
    }
    fs.writeFile(filename, write_data + '\n'+ user.video_order + '\n' + 
                write_video_time + '\n' + write_active_video_time + '\n'
                 + write_grade_time + '\n' + write_active_grade_time + '\n' + user.mturkID + '\n' 
                 + user.device + '\n' + user.age + '\n' 
                 + user.network + '\n' + user.reason +'\n'+ user.browser + '\n' + user.instruction + '\n'+ user.training + '\n' +
                 write_play + '\n' + write_pause + '\n' + write_seek + '\n' + write_reference + '\n' + write_return + '\n'
                 + write_test + '\n' + String(write_attention_check) + '\n' + String(write_timestamp), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    // clear cookie
    ctx.cookies.set('name','');
    
    var return_code = vid_folder;
    ctx.render('ending.html', {
        title: 'Thank you', return_code:return_code
    });
}
                 

module.exports = {
    'POST /start' : post_start,

    'POST /grade': post_grade,
    'POST /back2video':post_back2video,

    'POST /next' : post_next,
    'POST /end' : post_end,


};
