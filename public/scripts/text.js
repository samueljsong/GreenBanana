function runCode () {
    let htmlCode = document.getElementById('html-code');
    let cssCode = document.getElementById('css-code');
    let jsCode = document.getElementById('js-code');

    let output = document.getElementById('output').contentDocument;
    output.body.innerHTML = htmlCode.value + "<style>" + cssCode.value + "</style>";
    output.contentWindow.eval(jsCode.value);
}

function enableTab (element) {
    element.onkeydown = function(e) {
        if (e.keyCode === 9) {
            this.setRangeText(
                '\t',
                this.selectionStart,
                this.selectionStart,
                'end'
            )
            return false;
        }
    };
}

window.addEventListener('load', () => {
    let htmlField = document.getElementById('html-code');
    let cssField = document.getElementById('css-code');
    let jsField = document.getElementById('js-code');
    enableTab(htmlField);
    enableTab(cssField);
    enableTab(jsField);
})