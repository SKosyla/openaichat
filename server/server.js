import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import session from 'express';
import pkg from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

const users = [{username: "admin", password: "password"}]; // In-memory storage of users

app.get('/', (req, res) => {
    if(req.session.user){
        res.status(200).send({
            message: 'Hello from CodeX!',
        });
    } else {
        res.redirect('/login');
    }
});

app.post('/', async (req, res) => {
    if(req.session.user){
        try {
            const prompt = req.body.prompt;
            const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: `${prompt}`,
              temperature: 0,
              max_tokens: 3000,
              top_p: 1,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });

            res.status(200).send({
              bot: response.data.choices[0].text
            });

        } catch (error) {
            console.error(error)
            res.status(500).send(error || 'Something went wrong');
        }
    } else {
        res.redirect('/login')
    }
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    // check if the input values match the correct credentials
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.status(401).json({message: "Invalid username or password. Please try again."});
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(5000, () => console.log('AI server started on https://openaichat-fvp3.onrender.com'))