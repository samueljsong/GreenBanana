function navigateToLogin () {
    window.location.href = '/login';
}

function openModal() {
    var backdrop = document.getElementById("backdrop");
    backdrop.style.display = "block";
    var modal = document.getElementById("formcont");
    modal.style.display = "flex";
}

function closeModal() {
    var backdrop = document.getElementById("backdrop");
    backdrop.style.display = "none";
    var modal = document.getElementById("formcont");
    modal.style.display = "none";
}