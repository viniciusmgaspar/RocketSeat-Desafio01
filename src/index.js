const express = require("express")
const {v4: uuidv4} = require('uuid')
const cors = require("cors")

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistUserAccount(request, response, next){
    const { username } = request.headers;
    
    const user = users.find((user)=> user.username === username)

    if(!user){
        return response.status(400).json({error: "user not found"})
    }

    request.user = user

    return next();

}

app.post("/users", (request, response) =>{
    const {name, username} = request.body;

    const userAlreadyExists = users.some(
        (users) => users.username === username
    )

    if (userAlreadyExists) {
        return response.status(400).json({ "error": "Users already exist"})
    }
    const user = {
        id: uuidv4(),
        name,
        username,
        created_at: new Date(),
        todos: []
    }
    users.push(user);
    
    return response.status(201).json(user);
})

app.get("/todos", checkExistUserAccount,(request, response) => {
    const {user} = request
    

    return response.json(user.todos)
})

app.post("/todos", checkExistUserAccount, (request,response)=>{
    const {title,deadline} = request.body;

    const {user} = request;

    const createTodo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    user.todos.push(createTodo);

    return response.status(201).json(createTodo);
})

app.put("/todos/:id", checkExistUserAccount, (request, response) =>{
    const {title, deadline} = request.body;
    const {id} = request.params
    const {user} = request;

    const todo = user.todos.find(todo => todo.id === id)

    if (!todo){
        return response.status(404).json({error: "Todo not found"})
    }

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).json(todo);
})

app.patch("/todos/:id/done", checkExistUserAccount, (request, response) =>{
    const {id} = request.params
    const {user} = request;

    const todo = user.todos.find(todo => todo.id === id)

    if (!todo){
        return response.status(404).json({error: "Todo not found"})
    }
    todo.done = true;

    return response.status(201).json(todo);
})

app.delete("/todos/:id", checkExistUserAccount,(request, response) => {
    const {user} = request
    const {id} = request.params;

    const todoIndex = user.todos.findIndex(todo => todo.id === id)

    if (todoIndex === -1){
        return response.status(404).json({error: "Todo not found"})
    }

    user.todos.splice(todoIndex, 1)

    return response.status(204).send()
})

module.exports = app;