/* eslint-disable require-jsdoc */
const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());

app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(400).json({error: 'User not found'});
  }
  request.user = user;
  return next();
}

function checksExistsUserTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos;

  const todo = todos.find(todo => id === todo.id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userAlreadyExists = users.some(
      (user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({error: 'User already exists'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  // Retorna lista de tarefas do usuaário que é passado pelo headers ausando o Middleware 
  return response.status(200).json(user.todos)

  // Nao usei esta resposta porque só retorna um JSON de successo e envia un post (mas aqui usamos o GET)
  // return response.status(200).json({message: 'Success'}).send();

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Passo os valores pelo body (title e deadline)
  const { title, deadline } = request.body;
  const { user } = request;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date
  };

  user.todos.push(todo);

  return response.status(201).json(todo).send();

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { id } = request.params;
  const { todo } = request;

  todo.done = true

  return response.status(201).json(todo);
});



app.delete('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo.id, 1);

  return response.status(204).json(user.todos);

});

app.get('/users', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const {user} = request;
  return response.status(200).json(user)
})

module.exports = app;

