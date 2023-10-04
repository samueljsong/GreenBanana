function navigateToLogin() {
    window.location.href = '/login';
}

function createID(){
    console.log(crypto.randomUUID());
}

function TextPost(hits, html, css, js, text_id, username){
    this.hits = hits;
    this.html = html;
    this.css = css;
    this.js = js;
    this.text_id = text_id;
    this.username = username
    // Creating div card
    let postCard = document.createElement('div');
    postCard.className = 'text-container'
    let iframe = document.createElement('iframe');
    iframe.style.height = '70%'
    iframe.style.width = '90%'
    iframe.style.backgroundColor = 'white'
    iframe.className = "output";
    this.outputElement = iframe;

    // editing ui
    let hitsContainer = document.createElement('div');
    let name = document.createElement('p');
    name.innerText = '@' + this.username;
    let generalDiv = document.createElement('div');
    generalDiv.className = 'general-container';
    let hitsNumber = document.createElement('p');
    let hitsImage = document.createElement('img');
    hitsContainer.className = 'post-hits-container';
    hitsNumber.innerText = this.hits;
    hitsImage.src = '/assets/heart.png';
    generalDiv.appendChild(hitsImage)
    generalDiv.appendChild(hitsNumber)
    hitsContainer.appendChild(name);
    hitsContainer.appendChild(generalDiv);

    let editContainer = document.createElement('div');
    editContainer.className = 'edit-container'
    let editButton = document.createElement('button');
    editButton.innerText = 'VIEW'

    editContainer.appendChild(hitsContainer);
    editContainer.appendChild(editButton);


    postCard.className = "post text-post";
    postCard.classList.add('hide');

    postCard.appendChild(iframe);
    postCard.appendChild(editContainer);
    //Assigning div card
    this.postCard = postCard;

    editButton.addEventListener('click', () => {
        window.location.href = `/post/text/${this.text_id}`;
    })
}

function createTextPostsAndAppend(hits, html, css, js, text_id, username){
    let tempCard = new TextPost(hits, html, css, js, text_id, username);
    document.getElementById('textPost-container').appendChild(tempCard.postCard);
    tempCard.outputElement.contentDocument.body.innerHTML = tempCard.html + "<style>" +
    `
    *{
        overflow: hidden;
    }
    ` +  tempCard.css + "</style>"
}