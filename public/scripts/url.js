let timer = 5;

function redirect() {
    let timerdom = document.getElementById("timer");
    timerdom.innerHTML = timer;
    if (timer == 0) {
        window.location.href = url;
    } else {
        timer--;
    }
}

window.onload = redirect;
setInterval(redirect, 1000);