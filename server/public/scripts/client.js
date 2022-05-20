$(document).ready(onReady);

function onReady() {
    console.log('JQ');
    getTasks();
}

function getTasks() {
    $.ajax({
        method: 'GET',
        url: '/tasks'
    }).then(function(response) {
        console.log('back from GET', response);
        displayTasks(response);
    }).catch(function(err) {
        console.log(err);
    });
}

function displayTasks(arrayToDisplay) {
    el = $('#tasksOut');
    el.empty();
    for(let i = 0; i < arrayToDisplay.length; i++) {
        el.append(`
            <tr>
                <td>${arrayToDisplay[i].title}</td>
                <td>${arrayToDisplay[i].description}</td>
                <td>${arrayToDisplay[i].due_date}</td>
                <td>${arrayToDisplay[i].priority}</td>
                <td>${arrayToDisplay[i].completed}</td>
            </tr>
        `)
    }
}