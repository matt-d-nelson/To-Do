$(document).ready(onReady);

function onReady() {
    console.log('JQ');

    $('#addTask').on('click', addTask);
    $('#tasksOut').on('click', '.deleteButton', deleteTask);
    $('#tasksOut').on('click', '.completeButton', completeTask);
    $('#sortButton').on('click', getTasks);

    getTasks();
}

//---------------------SERVER REQUESTS---------------------//

// POST
function addTask() {
    //todo: add input verification
    let taskToAdd = {
        title: $('#titleIn').val(),
        description: $('#descriptionIn').val(),
        due_date: $('#due_dateIn').val(),
        priority: $('#priorityIn').val()
    }
    console.log('in addTask', taskToAdd);

    $.ajax({
        method: 'POST',
        url: '/tasks',
        data: taskToAdd
    }).then(function(response) {
        console.log('back from POST', response);
        getTasks();
    }).catch(function(err) {
        console.log(err);
        alert('error adding task');
    })
}

// GET
function getTasks() {
    let sortBy = $('#sortByIn').val();
    $.ajax({
        method: 'GET',
        url: `/tasks?sortBy=${sortBy}`
    }).then(function(response) {
        console.log('back from GET', response);
        displayTasks(response);
    }).catch(function(err) {
        console.log(err);
    });
}

// PUT
function completeTask() {
    let completedId = $(this).closest('tr').data('id');
    $.ajax({
        method: 'PUT',
        url: `/tasks?id=${completedId}`
    }).then(function(response) {
        console.log('back from PUT', response);
        getTasks();
    }).catch(function(err) {
        console.log(err);
        alert('error completing task');
    })
}

// DELETE
function deleteTask() {
    let parEl = $(this).closest('tr');
    let taskToDelete = {
        id: parEl.data('id'),
        title: parEl.find('td:eq(0)').text()
    };
    console.log('in deleteTask', taskToDelete);
    // todo: add bootstrap verification before sending delete req
    $.ajax({
        method: 'DELETE',
        url: `/tasks?id=${taskToDelete.id}`
    }).then( function(response) {
        console.log('back from DELETE', response);
        getTasks();
    }).catch( function(err) {
        console.log(err);
        alert('error deleting task');
    })
}

//---------------------VARIOUS---------------------//

function displayTasks(arrayToDisplay) {
    el = $('#tasksOut');
    el.empty();
    for(let i = 0; i < arrayToDisplay.length; i++) {
        //convert priority from int to string
        arrayToDisplay[i].priority = convertPriority(arrayToDisplay[i].priority);
        el.append(`
            <tr data-id="${arrayToDisplay[i].id}">
                <td>${arrayToDisplay[i].title}</td>
                <td>${arrayToDisplay[i].description}</td>
                <td>${arrayToDisplay[i].due_date.slice(0,10)}</td>
                <td>${arrayToDisplay[i].priority}</td>
                <td>${arrayToDisplay[i].completed}</td>
                <td><button class="deleteButton">Delete</button></td>
                <td><button class="completeButton">${checkComplete(arrayToDisplay[i].completed)}</button></td>
            </tr>
        `)
    }
}

function convertPriority(priorityIn) {
    switch (priorityIn) {
        case 1:
            return 'low';
        case 2:
            return 'medium';
        case 3: 
            return 'high';
        default:
            return;
    }
}

function checkComplete(completedIn) {
    if (!completedIn) {
        return 'Complete';
    }
    return 'Incomplete';
}