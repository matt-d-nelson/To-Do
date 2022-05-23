$(document).ready(onReady);

function onReady() {
    console.log('JQ');
    // add task
    $('#addTaskOpen').on('click', clearInputs);
    $('#addTask').on('click', addTask);
    // confirm and delete task
    $('#tasksOut').on('click', '.deleteButton', confirmDelete);
    $('#deleteModal').on('click', '.deleteButton', deleteTask);
    // complete task
    $('#tasksOut').on('click', '.completeButton', completeTask);
    // edit task
    $('#tasksOut').on('click', '.editButton', editWindow);
    $('#editModal').on('click', '.editButton', editTask);
    // sort task table
    $('#sortDropdown').on('click', '.dropdown-item' ,setSortBy);
    $('#sortButton').on('click', '.dropdown-item' ,getTasks);
    // display tasks automatically
    getTasks();
}

//---------------------GLOBAL VARIABLES---------------------//

let selectedAccordion = 0;
let sortBy = 'id';

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
    clearInputs();
    if (verifyInputs(taskToAdd)) {
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
    } else {
        alert('Please enter a valid title and due date');
    }
}

// GET
function getTasks() {
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

// PUT COMPLETE
function completeTask() {
    let parEl = $(this).closest('.accordion-item');
    let completedTask = {
        id: parEl.data('id'),
    }
    selectedAccordion = completedTask.id;
    console.log('in completedTask', completedTask);
    if (parEl.find('.completedTask').text() == 'Not Complete') {
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

// PUT EDIT TASK
function editTask() {
    selectedAccordion = $(this).data('id');
    let updatedTask = {
        id: $(this).data('id'),
        title: $('#editTitle').val(),
        description: $('#editDescription').val(),
        due_date: $('#editDate').val(),
        priority: $('#editPriority').val()
    };
    console.log('in editTask', updatedTask);
    if (verifyInputs(updatedTask)) {
        $.ajax({
            method: 'PUT',
            url: `/tasks/update`,
            data: updatedTask
        }).then(function(response) {
            console.log('back from PUT', response);
            getTasks();
        }).catch(function(err) {
            console.log(err);
            alert('error updating task');
        })
    } else {
        alert('Please enter a valid title and due date');
    }   
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
        arrayToDisplay[i].due_date = formatDueDateForDom(arrayToDisplay[i].due_date);
        // format time_completed
        arrayToDisplay[i].time_completed = formatTimeCompleted(arrayToDisplay[i].time_completed);
        // check to see if the accordion should be collapsed
        let thisCollapsed = checkCollapsed(arrayToDisplay[i].id)
        el.append(`
            <div class="accordion-item" data-id="${arrayToDisplay[i].id}">
                <h2 class="accordion-header" id="heading${i}">
                    <button class="accordion-button ${thisCollapsed[0]} titleTask" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">
                        ${arrayToDisplay[i].title}
                    </button>
                </h2>
                <div id="collapse${i}" class="accordion-collapse collapse ${thisCollapsed[1]}" data-bs-parent="#tasksOut">
                    <div class="accordion-body container">
                        <div class="row">
                            <div class="col-6">
                                <label><strong><u>Description</u></strong><div class="descriptionTask">${arrayToDisplay[i].description}</div></label>
                            </div>  
                            <div class="col-6">
                                <label><strong><u>Due Date</u></strong><div class="due_dateTask">${arrayToDisplay[i].due_date.slice(0,10)}</div></label>
                                <br>
                                <label><strong><u>Priority</u></strong><div class="priorityTask">${arrayToDisplay[i].priority}</div></label>
                                <br>
                                <label><strong><u>Time Completed</u></strong><div class="completedTask">${arrayToDisplay[i].time_completed}</div></label>
                            </div>  
                        </div>
                        <div class="row pt-3">
                            <div class="btn-group" role="group">
                                <button class="deleteButton btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
                                <button class="completeButton btn btn-outline-success">${checkComplete(arrayToDisplay[i].completed)}</button>
                                <button class="editButton btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }
}

function checkCollapsed(idToCheck) {
    if(selectedAccordion === idToCheck) {
        return ['','show'];
    }
    return ['collapsed',''];
}

function formatTimeCompleted(timeIn) {
    if (timeIn == null) {
        return 'Not Complete';
    }
    let dateObj = new Date(timeIn);

    let formattedMin = (dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes();

    let formattedDate = `${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getFullYear()}
        ${dateObj.getHours()}:${formattedMin}`;
    return formattedDate;
}

function formatDueDateForDom(timeIn) {
    // timeIn format YYYY-MM-DDT(timezone data)
    // split string on - and T to get individual m,d,y
    let formattedDate = timeIn.split(/[-T]/);
    // return as MM/DD/YYYY
    return `${formattedDate[1]}-${formattedDate[2]}-${formattedDate[0]}`;
}

function formatDueDateForEdit(timeIn) {
    let formattedDate = timeIn.split('-');
    return `${formattedDate[2]}-${formattedDate[0]}-${formattedDate[1]}`;
}

function confirmDelete() {
    // gather task info from clicked button
    let parEl = $(this).closest('.accordion-item');
    let taskToDelete = {
        id: parEl.data('id'),
        title: parEl.find('.titleTask').text()
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

function editWindow() {
    // gather title, description, due_date, and priority
    let parEl = $(this).closest('.accordion-item');
    let taskData = {
        id: parEl.data('id'),
        title: parEl.find('.titleTask').text().trim(),
        description: parEl.find('.descriptionTask').text(),
        due_date: formatDueDateForEdit(parEl.find('.due_dateTask').text()),
        priority: parEl.find('.priorityTask').text()
    }
    console.log('in editWindow',taskData);
    // created inputs in the edit modal filled with gathered task data
    let el = $('#editModalBody');
    el.empty();
    el.append(`
        <table>
            <tr>
                <th>Title</th>
            </tr>
            <tr>
                <td><input id="editTitle" type="text" value="${taskData.title}"></td>
            </tr>
            <tr>
                <th>Description</th>
            </tr>
            <tr>
                <td><textarea id="editDescription" type="text">${taskData.description}</textarea></td>
            </tr>
            <tr>
                <th>Due Date</th>
            </tr>
            <tr>
                <td><input type="date" id="editDate" value="${taskData.due_date}"></td>
            </tr>
            <tr>
                <th>Priority</th>
            </tr>
            <tr>
                <td><select id="editPriority">
                    <option value="1" ${checkSelected(taskData.priority,'low')}>low</option>
                    <option value="2" ${checkSelected(taskData.priority,'medium')}>medium</option>
                    <option value="3" ${checkSelected(taskData.priority,'high')}>high</option>
                </select></td>
            </tr>
        </table> 
    `);
    // create cancel and confirm buttons
    el = $('#editModalFooter');
    el.empty();
    el.append(`
        <button data-bs-dismiss="modal">Cancel</button>
        <button data-id="${taskData.id}" class="editButton" data-bs-dismiss="modal">Update</button>
    `);
}

function checkSelected(priorityIn,thisPriority) {
    if(priorityIn == thisPriority) {
        return 'selected="selected"';
    }
    return '';
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

function clearInputs() {
    $('#titleIn').val('');
    $('#descriptionIn').val('');
    $('#due_dateIn').val('');
    $('#priorityIn').val('1');
}

function verifyInputs(inputsToVerify) {
    if (inputsToVerify.title === '' || inputsToVerify.due_date === '') {
        return false;
    }
    return true;
}

function setSortBy() {
    sortBy = $(this).data('sort');
    selectedAccordion = 0;
    console.log('in setSortBy', sortBy);
    getTasks();
}