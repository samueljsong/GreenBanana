function navigateToLogin () {
    window.location.href = '/login';
}

function showCreateModal() {
    var modal = document.getElementById("backdrop");
    modal.style.display = "block";
}

function showCloseModal() {
    var modal = document.getElementById("backdrop");
    modal.style.display = "none";
}