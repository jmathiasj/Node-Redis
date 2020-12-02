var express=require('express');
var path=require('path');
var logger=require('morgan');
var bodyParser=require('body-parser');
var redis=require('redis');

var app=express();
//create client
// var client=redis.createClient();
var client = redis.createClient(6379,'3.131.254.70');
client.on('connect',function(){
    console.log("Redis server connected");
});
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
//  res.send('Welcome!');


    client.exists('bookss',function(err,reply){
        if(reply===1){

            client.hgetall('bookss', function(err,books){
       
                console.log("done");
                res.render('index',{ books:books, reply:reply});
               
               
           
          
        });
    
        }
        else{
            console.log("empty");
            res.render('index',{ reply:reply});
        }

    });


});




app.post('/book/add', function(req,res){
var newBook={};
newBook.id = req.body.id
newBook.name=req.body.name;
newBook.author=req.body.author;
newBook.cost=req.body.cost;
client.hmset('bookss',['name',newBook.name,'author', newBook.author, 'id', newBook.id, 'cost', newBook.cost], function(err, reply){
if(err){
    console.log(err);
}
console.log(reply);
client.hmset(newBook.id, [
    'name',newBook.name,'author', newBook.author, 'id', newBook.id, 'cost', newBook.cost
  ], function(error, replyy){
    if(err){
      console.log(error);
    }
    console.log(replyy);
    res.redirect('/');
  });

});
});

app.post('/book/search', function(req, res, next){
	console.log(req.body);
  let id = req.body.id;

  client.hgetall(id, function(err, obj){
    if(!obj){
    	console.log('!obj');
      res.render('search', {
        error: 'Book not found!!',books:''
      });
    } else {
    	// console.log('else')
      obj.id = id;
    	console.log(obj)

      res.render('search', {
        book: obj,books:'exists',error:''
      });
    }
  });
});


app.get('/search', function(req, res){
    res.render('search',{
          error: '',
          books:''
        });
  });

app.post('/book/delete/:id', function(req, res,){
    let id=req.params.id
    client.del(req.params.id);
    
    console.log(typeof client.hget('bookss','id'));
    client.hget('bookss','id',function(err,reply){
        if(id == reply){
            console.log(reply)
      console.log('there');
        client.del('bookss')
        res.render('index',{reply:0});
        }
    })
    // if(req.params.id.toString() == client.hget('bookss','id').id.toString() ){
  
    // }
    res.redirect('/');
  }); 
app.listen(3000);
console.log('Server Started on Port 3000');
module.exports=app;
