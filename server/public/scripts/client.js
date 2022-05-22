$(document).ready(onReady);

function onReady() {
    console.log('JQ');
    // add task
    $('#addTask').on('click', addTask);
    // confirm and delete task
    $('#tasksOut').on('click', '.deleteButton', confirmDelete);
    $('#deleteModal').on('click', '.deleteButton', deleteTask);
    // complete task
    $('#tasksOut').on('click', '.completeButton', completeTask);
    // sort task table
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
    let parEl = $(this).closest('tr');
    let completedTask = {
        id: parEl.data('id'),
    }
    if (parEl.find('td:eq(4)').text() == 'false') {
        let timeNow = new Date();
        completedTask.time_completed = `${timeNow.getFullYear()}-${timeNow.getMonth()}-${timeNow.getDate()} ${timeNow.getHours()}:${timeNow.getMinutes()}:${timeNow.getSeconds()}`;
    } else {
        completedTask.time_completed = null;
    }
    console.log('in completeTask', completedTask);
    $.ajax({
        method: 'PUT',
        url: `/tasks`,
        data: completedTask
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
    // gather id from clicked modal button
    let idToDelete = $(this).data('id');
    console.log('in deleteTask', idToDelete);
    // send delete request
    $.ajax({
        method: 'DELETE',
        url: `/tasks?id=${idToDelete}`
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
        // convert priority from int to string
        arrayToDisplay[i].priority = convertPriority(arrayToDisplay[i].priority);
        // format due_date 
        arrayToDisplay[i].due_date = formatDueDate(arrayToDisplay[i].due_date);
        // format time_completed
        arrayToDisplay[i].time_completed = formatTimeCompleted(arrayToDisplay[i].time_completed);
        el.append(`
            <tr data-id="${arrayToDisplay[i].id}">
                <td>${arrayToDisplay[i].title}</td>
                <td>${arrayToDisplay[i].description}</td>
                <td>${arrayToDisplay[i].due_date.slice(0,10)}</td>
                <td>${arrayToDisplay[i].priority}</td>
                <td>${arrayToDisplay[i].completed}</td>
                <td>${arrayToDisplay[i].time_completed}</td>
                <td><button class="deleteButton" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
                <td><button class="completeButton">${checkComplete(arrayToDisplay[i].completed)}</button></td>
            </tr>
        `)
    }
}

function formatTimeCompleted(timeIn) {
    if (timeIn == null) {
        return '';
    }
    let dateObj = new Date(timeIn);
    let formattedDate = `${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getFullYear()}
        ${dateObj.getHours()}:${dateObj.getMinutes()}`;
    return formattedDate;
}

function formatDueDate(timeIn) {
    // timeIn format YYYY-MM-DDT(timezone data)
    // split string on - and T to get individual m,d,y
    let formattedDate = timeIn.split(/[-T]/);
    // return as MM-DD-YYYY
    return `${formattedDate[1]}-${formattedDate[2]}-${formattedDate[0]}`;
}

function confirmDelete() {
    // gather task info from clicked button
    let parEl = $(this).closest('tr');
    let taskToDelete = {
        id: parEl.data('id'),
        title: parEl.find('td:eq(0)').text()
    };
    console.log('in confirm delete', taskToDelete);
    // create modal body text with task name
    let el = $('#deleteModalBody');
    el.empty();
    el.append(`<h6>Are you sure you would like to delete ${taskToDelete.title}?</h6>`);
    // create modal footer with id in button
    el = $('#deleteModalFooter');
    el.empty();
    el.append(`
        <button data-bs-dismiss="modal">Cancel</button>
        <button data-id="${taskToDelete.id}" class="deleteButton" data-bs-dismiss="modal">Delete</button>`
    );
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