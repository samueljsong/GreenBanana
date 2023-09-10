var menu = false;

function togglemenu() {
    var myDropdown = document.getElementById("navmenu");
    if (menu == false) {
        myDropdown.style.display = "flex"
        menu = true;
    } else {
        myDropdown.style.display = "none";
        menu = false;
    }
}

window.onclick = function(e) {
    var myDropdown = document.getElementById("navmenu");
    if (!e.target.matches('.navmenu')) {
        myDropdown.style.display = "none";
        menu = false;
    }
}