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
    }).catch(function(err) {
        console.log(err);
    });
}