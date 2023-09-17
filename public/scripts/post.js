function copyWindowUrl() {
    navigator.clipboard.writeText(window.location.href);
    alert("Copied URL: " + window.location.href);
}