

function runCode () {
    let htmlCode = document.getElementById('html-code');
    let cssCode = document.getElementById('css-code');
    let jsCode = document.getElementById('js-code');

    let output = document.getElementById('output').contentDocument;
    output.body.innerHTML = "<script>" + jsCode.value + "</script>" + htmlCode.value + "<style>" + cssCode.value + "</style>";
    // try{
    //     eval(jsCode.value);
    //     output.contentDocument.eval(jsCode.value);
    // } catch (err) {
    //     console.log("fix your js")
    // }
    // output.contentWindow.eval(jsCode.value);
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
    runCode();

    let htmlField = document.getElementById('html-code');
    let cssField = document.getElementById('css-code');
    let jsField = document.getElementById('js-code');
    enableTab(htmlField);
    enableTab(cssField);
    enableTab(jsField);
})

function copyUrl() {
    navigator.clipboard.writeText(window.location.href);
    alert("Copied URL: " + window.location.href);
}
