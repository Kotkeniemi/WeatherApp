const express = require('express');
const session = require('express-session');
const bodyP = require('body-parser');
const app = express();
app.use(bodyP.urlencoded ({
    extended:true
}));
const cookieExpire = 1000 * 60 * 60 * 24
const users = [
    {id: 1, name:'Aaron',email:'aeliahoo@gmail.com', password:'secret'}
]

const {
    PORT = 3000,
    NODE_NEW = 'development',
    SESSION_NAME = 'sid',
    SESSION_TIME = cookieExpire,
    SESSION_SECRET = 'shhh we got a secret/string/going\on'

}=process.env
const IN_PROD = NODE_NEW === 'production'; // will be false for users

app.use(session ({
   name: SESSION_NAME,
   resave:false,
   saveUninitialized:false,
   secret:SESSION_SECRET,
    cookie:{
        maxAge: SESSION_TIME,
        sameSite: true,
        secure: IN_PROD,
    }
}));
// function redirector() {
//     window.location = "http//:localhost3000/index.html"
// }

const redirectUser=(req,res,next)=>{
    if(!req.session.userId){
        res.redirect('/login') // redirect to login
    }
    else{
        next();
        //redirect('/')?
    }
}
const redirectToHome=(req,res,next)=>{
    if(req.session.userId){
        res.redirect('/home') // try index.html
    }
    else{
        next();
    }
}
// main page
app.get('/', (req,res)=> {
    const {userId}=req.session
    res.send(`
    <h1>Welcome</h1>
    ${userId ? `
    <a href='/home'> Home </a>
    <form method='post'  action='/logout'>
    <button>Logout</button>
    </form> `:`
    <a href='/login'>Login</a>
    <a href='/register'>Register</a>
    `}
    `)
});
app.get('/home', redirectUser,(req,res,next)=> {
    const user = users.find( user => user.id === req.session.userId)
    if(user){
      res.sendFile(__dirname + '/views/index.html');
     // var thing = location = "/views/index.html";
    }
    else{res.redirect('/login');}
   /* res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
    <li>Name:${user.name}</li>
    <li>Email:${user.email}</li>
    </ul>
    `) */
});
app.get('/login', redirectToHome,(req,res)=> {
   res.send(
    `
    <h1>Login</h1>
    <form method='post' action='/login'>
    <input type ='email' name='email' placeholder='Email' required />
    <input type ='password' name='password' placeholder='Password' required />
    <input type ='submit'/>
    </form>
    <a href='/register' />
    `

   )
});
app.get('/register',redirectToHome, (req,res)=> {
    res.send(
        `
        <h1>Register</h1>
        <form method='post' action='/register'>
        <input type ='name' name='name' placeholder='Name' required />
        <input type ='email' name='email' placeholder='Email' required />
        <input type ='password' name='password' placeholder='Password' required />
        <input type ='submit'/>
        </form>
        <a href='/login' />
        `
       )
});
app.post('/login', redirectToHome,(req,res)=> {
    const {email, password} = req.body;
    if(email && password){
        const user = users.find(user => user.email === email && user.password === password)
        if(user){
            req.session.userId = user.id;
           res.sendFile(__dirname +  '/views/index.html');
           //var thing2 = location= "/views/index.html";;
        }
    }
    res.redirect('/login');
});
app.post('/register',redirectToHome, (req,res)=> {
    const {name,email, password} = req.body;
    if(name&&email&&password){
        const exists = users.some(
            user => user.email === email
        )
        if(!exists){
            const user = {
                id: users.length+1,
                name,
                email,
                password
            }
            users.push(user);
            req.session.userId = user.id
            return res.redirect('/home');
        }
    }
    res.redirect('/register');
});
app.post('/logout',redirectUser, (req,res)=> {
    req.session.destroy(err=> {
        if(err){
            return res.redirect('/home');
        }
        res.clearCookie(SESSION_NAME);
        res.redirect('/login');
    });
});


app.listen(PORT, () => console.log(
    `http:localhost:${PORT}`
));