var menu = false;

function togglemenu() {
    var navmenu = document.getElementById("navmenu");
    var menubtn = document.getElementById("navmenubtn");    
    if (menu == false) {
        navmenu.style.display = "flex";
        menubtn.style.borderBottom = "solid 1px #6ed9a0";
        menubtn.style.textShadow =  "0px 0px 20px #6ed9a0";
        menu = true;
    } else {
        navmenu.style.display = "none";
        menubtn.style.borderBottom = null;
        menubtn.style.textShadow =  null;
        menu = false;
    }
}

window.onclick = function(e) {
    var navmenu = document.getElementById("navmenu");
    var menubtn = document.getElementById("navmenubtn");
    if (!e.target.matches('.navmenu')) {
        navmenu.style.display = "none";
        menubtn.style.borderBottom = null;
        menubtn.style.textShadow =  null;
        menu = false;
    }
}