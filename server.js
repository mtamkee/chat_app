/*
Features checklist
randomly generated username :done
scroll-text                 :done
chat log history            :done
display current users       :done
change username             :done
change username color       :done
cookies                     :done
emoji replacement           :done
*/
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let cookieParser = require('cookie-parser');
users = [];
connected_sockets = [];
message_history = [];
limited_history = [];
coloring = [];
server.listen(3000);
console.log('server running on port 3000');
//create route
app.get('/', function(post,reset){
    reset.sendFile(__dirname + '/index.html');
});

app.use(cookieParser());
//open a socket connection
io.sockets.on('connection',function(socket){
    connected_sockets.push(socket);
    var connection_length = connected_sockets.length;
    console.log('Active Sockets: %s', connection_length);

    socket.on('new user', function(user_name){
        socket.username = user_name;
        users.push(user_name);
        updateUsernames();  
        coloring.push('red');
        console.log('names:', user_name);
        console.log('here are the users: ',users);
        socket.emit('change name', user_name);
        //emit past 200 messages so that users can see prior chat.
        let display_messages = get_200_messages(message_history);
        console.log("this is the message history: ", display_messages);
        socket.emit('load messages',display_messages);
    });
    
    //function gets the most recent 200 messages in the message_history array.
    function get_200_messages(message_history){
        limited_history = message_history.slice(0,200)
        return limited_history;
    };
    //disconnect a socket.
    socket.on('disconnect',function(){
        
        let index = users.indexOf(socket.username);
        users.splice(index, 1);
        updateUsernames();
    var connections_index = connected_sockets.indexOf(socket);
    connected_sockets.splice(connections_index,1);
    console.log('Unactive sockets: %s', connection_length);
    });
    //send message
    //get the time 
    let time = display_metrics();
    // Display a message
    socket.on('send message', function(incoming_messages){
        let key_word_array = incoming_messages.split(" ");
        let command_word = key_word_array[0];
        let index = users.indexOf(socket.username);
        console.log("this is the color",coloring[index])
        let newColor = "blue";
        // Checking to see if user wants to change name
        //uses === to ensure that the value and type are the same
        if(command_word === "/name")
        {
            let new_Name = key_word_array[1];
            //check if the list "users" contains the new name
            if(!users.includes(new_Name))
            {
                //if "users" does not contain the requested new name, call the name change function
                change_user(new_Name,index, users);
            }
            else
            {
                //tell them that the name is taken. 
                console.log("name exists");
                incoming_messages = "The name already exists.";
            }
        }

        // checking to see if user wants to change colour
        else if(command_word === "/color")
        {   
            let some_num = parseInt(key_word_array[1]);
            console.log("key word is: ", key_word_array);
            //key word is:  [ '/color', '990000' ]
            //color change is reguested in formar RRGGBB so parse out each part of the string that corresponds to a color.
            let color_val = some_num.toString();
            let red_color = color_val.slice(0,2);
            let green_color = color_val.slice(2,4);
            let blue_color =  color_val.slice(4,6); 
            console.log("red is: ",Number(red_color));
            console.log("green is:",Number(green_color));
            console.log("blue is: ", Number(blue_color));
            //check if the requested color change is invalid.
            if((red_color < 0) || (red_color > 99) || (green_color < 0) || (green_color > 99) || (blue_color < 0) || (blue_color > 99))
            {
                console.log("Color values were not accepted. Please enter them in RRGGBB format.");
                incoming_messages = "Could not change color";
            }
            else
            {
                //create an RGB string
                newColor = "rgb(" + red_color + ", " + green_color + ", " + blue_color + ")";
                console.log("this is the new color: ", newColor);
                //add the new color to the new index
                coloring[index] = newColor;
                console.log("this is the color index: ", coloring[index]);
            }
        }
        console.log("this is the command word: ", command_word);
        console.log("This is the keyword: ", key_word_array);
        let emoji_boolean = "";
        emoji_boolean = emoji_finder(key_word_array);
        console.log("This is some value: ",emoji_boolean);

        //check if there is an emoji.
        if(emoji_boolean == true){
            console.log("there is an emoji");
            let some_emoji = "";
            //call the emoji replace function. 
            some_emoji = emojie_replace(incoming_messages);
            console.log("This is some incoming_messages: ", some_emoji);
            //create message content with the new string 
            let messageContent = '<div class="well">(' + time +') ' + socket.username + ': ' +some_emoji  +'</div>';
            console.log("this is the message content: ",messageContent);
            message_history.push(messageContent);

            //emit the message to the front end
            io.sockets.emit('send message', some_emoji, time, users[index], coloring[index]);
            console.log("this is the new color",coloring[index])
        }
        else{
            //if there is not an emoji, just print the message which is the orginial string "incoming_messages"
        let messageContent = '<div class="well">(' + time +') ' + socket.username + ': ' + incoming_messages +'</div>';
        message_history.push(messageContent);
            //emit the message to the front end.
        io.sockets.emit('send message', incoming_messages, time, users[index], coloring[index]);
        console.log("this is the new color",coloring[index])

        }
        
    });
    //Function will take in incoming_messages as an argument then replace the corresponding text with emojies and returns a string. 
    function emojie_replace(incoming_messages){
        const emoji_transform = ["😁","🙁","😲","💓","😍","😘","🥺","😎","🐕"];
        var e_smile = incoming_messages.includes(":)");
        var e_sad = incoming_messages.includes(":(");
        var e_o = incoming_messages.includes(":o");
        var e_heart = incoming_messages.includes("<3");
        var e_hear_eyes = incoming_messages.includes(":)<3");
        var e_kiss = incoming_messages.includes(";)<3");
        let emoji_string = "";
        var e_string_1 = "";
        var e_string_2 = "";
        var e_string_3 = "";
        var e_string_4 = "";
        var e_string_5 = "";
        var e_string_6 = "";
        var e_string_7 = "";
        let finished_string = "";
        console.log("smile: ",e_smile);
        console.log("scared: ",e_o);
        console.log("sad: ",e_sad);
        e_string_1 = incoming_messages.replace(":)",emoji_transform[0]);
        e_string_2 = e_string_1.replace(":(",emoji_transform[1]);
        e_string_3 = e_string_2.replace(":o",emoji_transform[2]);
        e_string_4 = e_string_3.replace("<3",emoji_transform[3]);
        e_string_5 = e_string_4.replace(":heart",emoji_transform[4]);
        e_string_6 = e_string_5.replace(":kiss",emoji_transform[5]);
        e_string_7 = e_string_6.replace(":dog",emoji_transform[8]);
        emoji_string = e_string_7.replace(":puppy",emoji_transform[6]);
        finished_string =emoji_string.replace(":cool",emoji_transform[7]);
        return finished_string;
        
    }
    function emoji_finder(word_array){
        
        const emojies = [":)",":(",":o",":heart","<3",":kiss",":puppy",":cool",":dog"];
        //searches in the message if there is an emoji
        var bool_val = (emojies.some(element => word_array.includes(element)));
        if (bool_val = true){
            console.log("this is the word array: ",word_array)
            console.log("We found an emoji");
            
        }
        else{
            console.log("we messed up");
            
        }
        //returns a boolean value to show if an emoji is found.
        return bool_val
    }

    function change_user(new_Name,index){
                var temp_name = new_Name
                socket.emit('change name', temp_name);
                //changes name in the users array
                users[index] = temp_name;
                console.log("user index: ", users[index]);
                //updates the socket user name
                socket.username = temp_name;
                console.log("socket username: ",socket.username)
                updateUsernames();
                console.log("updated users: ", socket.username);
    }
    //new user
    
    function updateUsernames(){
        io.sockets.emit('get users', users);
        
    }
});


function display_metrics(){
    var date = getDate();
    var time = getTime();
    let metric = "";
    metric = date + ", " + time;
    return metric;
}

function getTime(){
    let time = "";
    let date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var seconds = date.getSeconds

    if(minute <= 9){
        minute = "0" + minute;
    }
    //PM AM calculation
    if(hour > 12){
        hour = hour - 12;
        time = hour + ":" + minute + "pm";
    }
    else {
        displayTime = hour + ":" + minute + "am"
    }
    return time;

}
function getDate(){
    let display_date = "";
    let date = new Date();
    let year = date.getFullYear();
    let day = date.getDay();
    let month_num = date.getMonth();
    let m = g_month(month_num);
    let d = g_day(day);
    month_day_year = m + d + year;

    return month_day_year;
}
function g_day(day){
    var  day = day + 1
    let suffix = ""
    if(day == 1 || day == 21){
        suffix = "st, ";  
    }
    else if(day == 2 ||day == 22){
        suffix = "nd, ";
    }
    else if(day == 3 || day == 23){
        suffix = "rd, ";
    }
    else {
        suffix = "th, "
    }
    let d = day + suffix;
    return d;
}
function g_month(month_num){
    switch (month_num){
        case 0:
            month = "January ";
            break;
        case 1: 
            month = "February ";
            break;
        case 2: 
            month = "March ";
            break;
        case 3:
            month = "April ";
            break;
        case 4:
            month = "May ";
            break;
        case 5:
            month = "June ";
            break;
        case 6: 
            month = "July ";
            break;
        case 7: 
            month = "August ";
            break;
        case 8:
            month = "September ";
            break;
        case 9: 
            month = "October ";
            break;
        case 10: 
            month = "November ";
            break;
        case 11:
            month = "December ";
            break;
    }
    return month;
}
console.log(getDate());