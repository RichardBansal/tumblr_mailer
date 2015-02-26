var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');

var mandrill_client = new mandrill.Mandrill('8ZsuwmXqdO7ob1ya-7fZRQ');
var csvFile = fs.readFileSync('friend_list.csv','utf8');
var emailTemplate  = fs.readFileSync('email_template.ejs','utf8');

// console.log(csvParse(csvFile));

function csvParse(csvFile){
	header = csvFile.slice(0,csvFile.indexOf('\n'));
	headerArr = header.split(","); //keys
	
	lineDataArr = csvFile.split('\n');

	var csvData = [];

	for(var i = 1;i < lineDataArr.length;i++){
		line = lineDataArr[i].split(",");
		//console.log(line.length)
		if(line.length<=1){break;}
		var temp = {};
		for(var j =0;j<headerArr.length;j++){
			//console.log(headerArr[j],line[j])
			temp[headerArr[j]] = line[j]
			//csvData[i][headerArr[j]] = line[j];
		}
		csvData.push(temp);
	}

	return csvData;
}

friendList = csvParse(csvFile);

// var customizedTemplate = ejs.render(emailTemplate,{firstName:firstName,numMonthsSinceContact:numMonthsSinceContact});

// Authenticate via OAuth
// var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'F6wyRMUawpr9pZFRal8qKEc8mbk3kyalAHwvZmxydRzgbNkko3',
  consumer_secret: 'avcjKelKqjSYNviCsooovPvzA3JNIikrpNbbQYDXpdxyA6xHV3',
  token: 'hzTErustgRemia3g5jOvU65In4ByGTqzHIQFOfGVT9CDAff8Pq',
  token_secret: '9blBcawi9B6ZpND2JP8Ja5YP4dftz79Z1VrYEyD6EbFuKhnJEi'
});

// Make the request
client.userInfo(function (err, data) {
    // ...
});



client.posts('ram-on-js.tumblr.com',function(err,blog){
	var latestPosts = [];
	var blogPosts = blog.posts.slice();
	var today = new Date().getDate();

	blogPosts.forEach(function(post){
		var temp = {};
		var postDate = new Date(post.date);
		if((today - postDate.getDate()) <= 25){
			// latestPosts.push('first');
			temp = {
				url:post.post_url,
				title:post.title
			}
			// temp.title = post.title;
			latestPosts.push(temp);
		}
		//console.log(post.post_url,post.date,post.title);
		//if(post.date)
	});
	embedTemplate(latestPosts);
	//console.log(latestPosts);
});

// var customizedTemplate;
function embedTemplate(latestPosts){
	friendList.forEach(function(row){
		var firstName = row["firstName"];
		var numMonthsSinceContact = row["numMonthsSinceContact"];
		var email = row["emailAddress"];
		var lastName = row['lastName'];
		// var templateCopy = emailTemplate;

		// templateCopy = templateCopy
		// .replace(/FIRST_NAME/gi,firstName)
		// .replace(/NUM_MONTHS_SINCE_CONTACT/gi,numMonthsSinceContact);

		//console.log(templateCopy)
		var customizedTemplate = ejs.render(
			emailTemplate,
			{
				firstName:firstName,
				numMonthsSinceContact:numMonthsSinceContact,
				latestPosts:latestPosts
			});
		//console.log(customizedTemplate);
		sendEmail(firstName+' '+lastName,email, 'Richard Bansal','richard.bansal@gmail.com','Coffee??',customizedTemplate);
	});
}

function sendEmail(to_name,to_email, from_name,from_email, subject, message_html){
	var message = {
		"html": message_html,
		"subject":subject,
		"from_email":from_email,
		"from_name":from_name,
		"to": 	[{
					"email": to_email,
					"name": to_name
				}],
		"important":false,
		"track_opens":true,
		"auto_html":false,
		"preserve_recipients":true,
		"merge":false,
		"tags": ["Fullstack_Tumblrmailer_Workshop"]
	};

	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message":message,"async":async,"ip_pool":ip_pool},
								  function(result){
								  	console.log(message);
								  	console.log(result);
								  },
								  function(e){
								  	console.log('A mandrill error occured: ' + e.name + '-' + e.message);
								  });
}