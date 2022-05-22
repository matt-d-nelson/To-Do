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
    // edit task
    $('#tasksOut').on('click', '.editButton', editWindow);
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
    console.log();
    if (parEl.find('.completedTask').text() == 'false') {
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
        arrayToDisplay[i].due_date = formatDueDateForDom(arrayToDisplay[i].due_date);
        // format time_completed
        arrayToDisplay[i].time_completed = formatTimeCompleted(arrayToDisplay[i].time_completed);
        el.append(`
            <tr data-id="${arrayToDisplay[i].id}">
                <td class="titleTask">${arrayToDisplay[i].title}</td>
                <td class="descriptionTask">${arrayToDisplay[i].description}</td>
                <td class="due_dateTask">${arrayToDisplay[i].due_date.slice(0,10)}</td>
                <td class="priorityTask">${arrayToDisplay[i].priority}</td>
                <td class="completedTask">${arrayToDisplay[i].completed}</td>
                <td>${arrayToDisplay[i].time_completed}</td>
                <td><button class="deleteButton" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
                <td><button class="completeButton">${checkComplete(arrayToDisplay[i].completed)}</button></td>
                <td><button class="editButton" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button></td>
            </tr>
        `)
    }
}

function formatTimeCompleted(timeIn) {
    if (timeIn == null) {
        return '';
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
    let parEl = $(this).closest('tr');
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
    let parEl = $(this).closest('tr');
    let taskData = {
        id: parEl.data('id'),
        title: parEl.find('.titleTask').text(),
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
                <th>Name</th>
            </tr>
            <tr>
                <td id="editName"><input type="text" value="${taskData.title}"></td>
            </tr>
            <tr>
                <th>Description</th>
            </tr>
            <tr>
                <td id="editDescription"><input type="text" value="${taskData.description}"></td>
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