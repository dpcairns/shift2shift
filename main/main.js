import { logout, createTodo, getEmployee, getTodo, completeTodo, deleteTodo, getShiftNotes, createShiftNote, deleteShiftNote, checkAuth } from '../fetch-utils.js';
import { renderShiftNote, renderTodo } from '../render-utils.js';
const logoutButton = document.querySelector('#logout');

checkAuth();

const todosEl = document.querySelector('.todosContainer');
const shiftNotesEl = document.querySelector('.shiftNotesContainer');
const todosForm = document.querySelector('#todoListForm');
const shiftNotesForm = document.querySelector('#shiftNotesForm');
const deleteAllNotes = document.querySelector('.delete');

const chatButtonEl = document.querySelector('#chat');

chatButtonEl.addEventListener('click', async () => {
    window.location.href = '../chat';
});

logoutButton.addEventListener('click', async () => {
    await logout();
    window.location.href = '../';
});

window.addEventListener('load', async () => {
    const user = await getEmployee();
    await fetchAndDisplay();
    if (user.is_admin) {
        alert(`Your business code is ${user.business_code}`);
    }
    if (user.is_admin === false){ deleteAllNotes.style.display = 'none';}
});

todosForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    
    const user = await getEmployee();
    const business_code = user.business_code;
    const data = new FormData(todosForm);
    const todoObj = data.get('todo');
    const urgencyObj = data.get('urgency');

    await createTodo({
        todo_name: todoObj,
        urgency: urgencyObj,
        business_code: business_code,
    });

    todosForm.reset();
    await fetchAndDisplay();
});

shiftNotesForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    const user = await getEmployee();
    const business_code = user.business_code;
    const data = new FormData(shiftNotesForm);
    const shiftNoteObj = data.get('shiftNotes');

    await createShiftNote({
        note: shiftNoteObj,
        business_code: business_code,
        sent_by: user.name
    });

    shiftNotesForm.reset();
    await fetchAndDisplay();
});

async function fetchAndDisplay() {

    //Todos Fetch and Display
    todosEl.textContent = '';
    const user = await getEmployee();
    const business_code = user.business_code;
    const todos = await getTodo({ business_code });

    for (let todo of todos) {
        const todoContainer = document.createElement('div');
        const todoEl = await renderTodo(todo);
        todoContainer.classList.add('todo-box');
        todoContainer.append(todoEl);
        if (todo.urgency === 1){
            todoEl.classList.add('low-urgency');
        } else if (todo.urgency === 2) {
            todoEl.classList.add('medium-urgency');
        } else {
            todoEl.classList.add('high-urgency');
        }
        todoEl.addEventListener('click', async () => {
            await completeTodo(todo.id, user.name);
            await fetchAndDisplay();
        });

        if (user.is_admin) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', async () => {
                await deleteTodo(todo.id);
                await fetchAndDisplay();
            });

            todoContainer.append(deleteButton);
        }

        todosEl.append(todoContainer);
    }

    //Shift Notes Fetch and Display
    shiftNotesEl.textContent = '';
    const shiftNotes = await getShiftNotes({ business_code });

    for (let shiftNote of shiftNotes) {
        const shiftNoteEl = await renderShiftNote(shiftNote);
        shiftNotesEl.append(shiftNoteEl);
    }
}

deleteAllNotes.addEventListener('click', async () => {
    const user = await getEmployee();
    await deleteShiftNote(user.business_code);
    fetchAndDisplay();
});