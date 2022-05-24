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
    $('#sortDropdown').on('click', '.dropdown-item', setSortBy);
    // display tasks on page load
    getTasks();
}

//---------------------GLOBAL VARIABLES---------------------//

let selectedAccordion = 0;
let sortBy = 'id';

//---------------------SERVER REQUESTS---------------------//

// POST
function addTask() {
    // gather inputs and store in object
    let taskToAdd = {
        title: $('#titleIn').val(),
        description: $('#descriptionIn').val(),
        due_date: $('#due_dateIn').val(),
        priority: $('#priorityIn').val()
    }
    console.log('in addTask', taskToAdd);
    clearInputs();
    // verify that there are valid inputs
    // send post request if so
    // throw alert if not
    if (verifyInputs(taskToAdd)) {
        $.ajax({
            method: 'POST',
            url: '/tasks',
            data: taskToAdd
        }).then(function (response) {
            console.log('back from POST', response);
            getTasks();
        }).catch(function (err) {
            console.log(err);
            alert('error adding task');
        })
    } else {
        alert('Please enter a valid title and due date');
    }
}

// GET
function getTasks() {
    // send get request to server with the global sortBy variable (string for how to order the tasks)
    $.ajax({
        method: 'GET',
        url: `/tasks?sortBy=${sortBy}`
    }).then(function (response) {
        console.log('back from GET', response);
        displayTasks(response);
    }).catch(function (err) {
        console.log(err);
    });
}

// PUT COMPLETE
function completeTask() {
    // target parent accordion item element
    let parEl = $(this).closest('.accordion-item');
    // declare object with the id of the completed task
    let completedTask = {
        id: parEl.data('id'),
    }
    // store id of the selected tast so that it can be configured to be expanded the next time tasks are displayed on the DOM
    selectedAccordion = completedTask.id;
    console.log('in completedTask', completedTask);
    // check to see if the task was completed or not before sending request to toggle it's completion status
    if (parEl.find('.completedTask').text() == 'Not Complete') {
        // if not, record the current time and date and store it in time_completed property in completedTask object
        let timeNow = new Date();
        completedTask.time_completed = `${timeNow.getFullYear()}-${timeNow.getMonth()}-${timeNow.getDate()} ${timeNow.getHours()}:${timeNow.getMinutes()}:${timeNow.getSeconds()}`;
    } else {
        // if so, the task will be reset to uncompleted so set time_completed to null
        completedTask.time_completed = null;
    }
    // send put request to server with completedTask object
    $.ajax({
        method: 'PUT',
        url: `/tasks`,
        data: completedTask
    }).then(function (response) {
        console.log('back from PUT', response);
        getTasks();
    }).catch(function (err) {
        console.log(err);
        alert('error completing task');
    })
}

// PUT EDIT TASK
function editTask() {
    // store id of selected accordion for expansion
    selectedAccordion = $(this).data('id');
    // gather inputs from the edit window and store them in updatedTask object
    let updatedTask = {
        id: $(this).data('id'),
        title: $('#editTitle').val(),
        description: $('#editDescription').val(),
        due_date: $('#editDate').val(),
        priority: $('#editPriority').val()
    };
    console.log('in editTask', updatedTask);
    // verify that the inputs hold the required data
    // send put request with the updatedTask if so, alert user if not
    if (verifyInputs(updatedTask)) {
        $.ajax({
            method: 'PUT',
            url: `/tasks/update`,
            data: updatedTask
        }).then(function (response) {
            console.log('back from PUT', response);
            getTasks();
        }).catch(function (err) {
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
    }).then(function (response) {
        console.log('back from DELETE', response);
        getTasks();
    }).catch(function (err) {
        console.log(err);
        alert('error deleting task');
    })
}

//---------------------VARIOUS---------------------//
//------------DOM MANIPULATION------------//

function displayTasks(arrayToDisplay) {
    // target and empty tasksOut accordion
    el = $('#tasksOut');
    el.empty();
    // loop through the tasks array
    for (let i = 0; i < arrayToDisplay.length; i++) {
        // adjust background color of current accordion based on priority/completed/due_date
        let backgroundClass = calculateBackgroundColor(arrayToDisplay[i]);
        // convert priority from int to string
        arrayToDisplay[i].priority = convertPriority(arrayToDisplay[i].priority);
        // format due_date from YYYY-MM-DD to MM-DD-YYYY
        arrayToDisplay[i].due_date = formatDueDateForDom(arrayToDisplay[i].due_date);
        // format time_completed from UTC to MM-DD-YYYY HH:SS
        arrayToDisplay[i].time_completed = formatTimeCompleted(arrayToDisplay[i].time_completed);
        // check to see if the accordion should be collapsed or expanded
        let thisCollapsed = checkCollapsed(arrayToDisplay[i].id)
        // append tasksOut with an accordion item for each task
        // store id in parent accordion-item element
        // wrap in div for backgroudClass so that the expanded button can inherit it
        // thisCollapsed[0] will return 'collapsed' or '' depending on if this index's id is the same as global selectedAccordion variable
        // thisCollapsed[1] will return 'show' or '' in the same way
        // checkComplete will return 'Complete' or 'Incomplete' as a label for the button
        // edit and delete buttons toggle respective modals
        el.append(`
            <div class="accordion-item" data-id="${arrayToDisplay[i].id}">
                <div class="${backgroundClass}">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${thisCollapsed[0]} ${backgroundClass} titleTask" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">
                            <strong>${arrayToDisplay[i].title}</strong>
                        </button>
                    </h2>
                    <div id="collapse${i}" class="accordion-collapse collapse  ${thisCollapsed[1]}" data-bs-parent="#tasksOut">
                        <div class="accordion-body container">
                            <div class="row">
                                <div class="col-6">
                                    <label><strong><u>Description</u></strong><div class="descriptionTask">${arrayToDisplay[i].description}</div></label>
                                </div>  
                                <div class="col-6">
                                    <label><strong><u>Due Date</u></strong><div class="due_dateTask">${arrayToDisplay[i].due_date.slice(0, 10)}</div></label>
                                    <br>
                                    <label><strong><u>Priority</u></strong><div class="priorityTask">${arrayToDisplay[i].priority}</div></label>
                                    <br>
                                    <label><strong><u>Time Completed</u></strong><div class="completedTask">${arrayToDisplay[i].time_completed}</div></label>
                                </div>  
                            </div>
                            <div class="row pt-3">
                                <div class="btn-group" role="group">
                                    <button class="deleteButton btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
                                    <button class="completeButton btn btn-success">${checkComplete(arrayToDisplay[i].completed)}</button>
                                    <button class="editButton btn btn-secondary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
}

function confirmDelete() {
    // target parent accordion-item and gather task info
    let parEl = $(this).closest('.accordion-item');
    let taskToDelete = {
        id: parEl.data('id'),
        title: parEl.find('.titleTask').text()
    };
    console.log('in confirm delete', taskToDelete);
    // target deleteModalBody
    let el = $('#deleteModalBody');
    el.empty();
    // append with text confirmation including task name
    el.append(`<h6>Are you sure you would like to delete ${taskToDelete.title}?</h6>`);
    // target deleteModalFooter
    el = $('#deleteModalFooter');
    el.empty();
    // append with Cancel and Delete buttons, store this task's id in the delete button
    el.append(`
        <button data-bs-dismiss="modal" class="btn btn-secondary">Cancel</button>
        <button data-id="${taskToDelete.id}" class="deleteButton btn btn-danger" data-bs-dismiss="modal">Delete</button>`
    );
}

function editWindow() {
    // gather title, description, due_date, and priority from parent accordion-item
    let parEl = $(this).closest('.accordion-item');
    let taskData = {
        id: parEl.data('id'),
        title: parEl.find('.titleTask').text().trim(),
        description: parEl.find('.descriptionTask').text(),
        due_date: formatDueDateForEdit(parEl.find('.due_dateTask').text()),
        priority: parEl.find('.priorityTask').text()
    }
    console.log('in editWindow', taskData);
    // target editModalBody
    let el = $('#editModalBody');
    el.empty();
    // append with inputs containing data from the accordion item that was clicked
    // checkSelected will return selected="selected" if the priority matches the option's priority
    el.append(`
        <div class="container">
            <div class="row">
                <label><strong>Name</strong><input id="editTitle" type="text" class="w-100" value="${taskData.title}"></label>
            </div>
            <div class="row">
                <label><strong>Description</strong><textarea id="editDescription" class="w-100" type="text">${taskData.description}</textarea></label>
            </div>
            <div class="row">
                <div class="col">
                    <label><strong>Due Date</strong><input type="date" id="editDate" value="${taskData.due_date}"></label>
                </div>
                <div class="col">
                    <label><strong>Priority</strong>
                        <select id="editPriority" class="w-100">
                            <option value="1" ${checkSelected(taskData.priority, 'low')}>low</option>
                            <option value="2" ${checkSelected(taskData.priority, 'medium')}>medium</option>
                            <option value="3" ${checkSelected(taskData.priority, 'high')}>high</option>
                        </select>
                    </label>
                </div>
            </div>
        </div>      
    `);
    // create Cancel and Update buttons, store this task's id in the Update button
    el = $('#editModalFooter');
    el.empty();
    el.append(`
        <button class="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-secondary editButton" data-id="${taskData.id}" class="editButton" data-bs-dismiss="modal">Update</button>
    `);
}

function calculateBackgroundColor(taskToCalculate) {
    // used in displayTasks to set the background-color class for each task
    // make background green if the task is completed
    if (taskToCalculate.completed) { return 'complete'; }
    let returnClass = '';
    // check to see what priority the task is to set base level background class
    switch (taskToCalculate.priority) {
        case 1:
            returnClass = 'low';
            break;
        case 2:
            returnClass = 'medium';
            break;
        case 3:
            returnClass = 'high';
            break;
        default:
            break;
    }
    // check to see how much time there is before the due date
    let timeDue = new Date(taskToCalculate.due_date).getTime();
    let timeNow = new Date().getTime();
    let timeUntilDue = timeDue - timeNow;
    const oneDay = 86400000;
    // concatenate base level class with 1,2,3 to change opacity depending on how long it is from now to the task's due date
    if (timeUntilDue > oneDay * 7) {
        return returnClass += '3';
    }
    if (timeUntilDue > oneDay) {
        return returnClass += '2';
    }
    return returnClass += '1';
}

function setSortBy() {
    // set global sortBy variable from dropdown to send with getTasks 
    sortBy = $(this).data('sort');
    // innitialize selectedAccordion to 0 so that all accordion-items are collapsed
    selectedAccordion = 0;
    console.log('in setSortBy', sortBy);
    // update DOM
    getTasks();
}

function checkCollapsed(idToCheck) {
    // used in displayTasks to set a task's accordion element to be expanded if it is the most recently selected
    if (selectedAccordion === idToCheck) {
        return ['', 'show'];
    }
    return ['collapsed', ''];
}

function checkSelected(priorityIn, thisPriority) {
    // used in editWindow to set the value of the priority select
    if (priorityIn == thisPriority) {
        return 'selected="selected"';
    }
    return '';
}

function checkComplete(completedIn) {
    // used in displayTasks to set the lable for the Complete button
    if (!completedIn) {
        return 'Complete';
    }
    return 'Incomplete';
}

//------------FORMATTING------------//
function formatTimeCompleted(timeIn) {
    // if the task isn't complete, return
    if (timeIn == null) {
        return 'Not Complete';
    }
    // create a new date object from the UTC data from SQL
    let dateObj = new Date(timeIn);
    // add a 0 to minutes if it is under 10 (to avoid times like 5:4 instead of 5:04)
    let formattedMin = (dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes();
    // format date as MM-DD-YYYY @ HH:MM and return
    let formattedDate = `${dateObj.getMonth()}-${dateObj.getDate()}-${dateObj.getFullYear()}
        @ ${dateObj.getHours()}:${formattedMin}`;
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
    // convert from SQL date format YYYY-MM-DD to MM-DD-YYYY and return
    let formattedDate = timeIn.split('-');
    return `${formattedDate[2]}-${formattedDate[0]}-${formattedDate[1]}`;
}

function convertPriority(priorityIn) {
    // convert priority from SQL int to user friendly string
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

//------------INPUTS------------//

function clearInputs() {
    $('#titleIn').val('');
    $('#descriptionIn').val('');
    $('#due_dateIn').val('');
    $('#priorityIn').val('1');
}

function verifyInputs(inputsToVerify) {
    // used in addTask and editTask to verify that all tasks have a name and due_date before sending to the server
    if (inputsToVerify.title === '' || inputsToVerify.due_date === '') {
        return false;
    }
    return true;
}