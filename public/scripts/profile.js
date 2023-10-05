function ImagePost(url, type, id, public_id, hits){
    this.url = url;
    this.id = id;
    this.public_id = public_id;
    this.type = type;
    this.hits = hits;

    // Creating div card
    let postCard = document.createElement('div');
    postCard.className = "post";
    postCard.classList.add('image-post-card');
    postCard.classList.add('hide');
    postCard.style.backgroundColor = 'black';

    let tempImage = document.createElement('img');
    tempImage.src = this.url;
    postCard.appendChild(tempImage);

    let hitsContainer = document.createElement('div');
    let hitsNumber = document.createElement('p');
    let hitsImage = document.createElement('img');
    hitsContainer.className = 'hitsContainer';
    hitsNumber.innerText = hits;
    hitsImage.src = '/assets/heart.png';
    hitsContainer.appendChild(hitsImage);
    hitsContainer.appendChild(hitsNumber);
    hitsContainer.style.display = 'none';

    postCard.appendChild(hitsContainer);

    //Assigning div card
    this.postCard = postCard;
    
    // Opening image
    this.postCard.addEventListener('click', () => {
        // navigator.clipboard.writeText(this.url);
        // alert("Copied URL: " + this.url);
        window.location.href = `/post/${type}/${public_id}`;
    })

    this.postCard.addEventListener('mouseover', () => {
        hitsContainer.style.display = 'flex'
    })

    this.postCard.addEventListener('mouseleave', () => {
        hitsContainer.style.display = 'none'
    })
}

function LinkPost(hits, url, url_short, link_id, domain){
    this.hits = hits;
    this.url = url;
    this.url_short = url_short;
    this.link_id = link_id;
    this.domain = domain;

    let postCard = document.createElement('div');
    postCard.className = 'link-post-card'
    let urlShort = document.createElement('a');
    urlShort.innerText = domain + '/url/' +url_short;
    urlShort.href = '/url/' +url_short;
    
    let hitsContainer = document.createElement('div');
    hitsContainer.className = 'link-hits-container'
    let hitsLink = document.createElement('img');
    hitsLink.src = '/assets/heart.png';
    hitsLink.className = 'link-hearts';
    let hitsNum = document.createElement('p');
    hitsNum.innerText = this.hits;
    hitsContainer.appendChild(hitsLink);
    hitsContainer.appendChild(hitsNum);

    let deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete'
    deleteButton.className = 'link-delete-button';

    let copyUrlButton = document.createElement('button');
    copyUrlButton.innerText = 'Copy URL'
    copyUrlButton.className = 'link-url-button';

    postCard.appendChild(urlShort);
    postCard.appendChild(hitsContainer);
    postCard.appendChild(copyUrlButton);
    postCard.appendChild(deleteButton);

    postCard.classList.add('post');
    postCard.classList.add('show');
    this.postCard = postCard;

    

    deleteButton.addEventListener('click', async () => {
        await fetch(`/post/url/${this.link_id}/delete`, {
            method: 'post'
        })
        .then(location.replace(window.location.href))
    })

    copyUrlButton.addEventListener('click',() => {
        navigator.clipboard.writeText(domain + '/url/' +url_short);
        alert(`URL: ${domain + '/url/' +url_short} has been copied.`);
    })
    
}

function TextPost(hits, html, css, js, text_id){
    this.hits = hits;
    this.html = html;
    this.css = css;
    this.js = js;
    this.text_id = text_id;
    // Creating div card
    let postCard = document.createElement('div');
    postCard.className = 'text-container'
    let iframe = document.createElement('iframe');
    iframe.style.height = '90%'
    iframe.style.width = '65%'
    iframe.style.backgroundColor = 'white'
    iframe.className = "output";
    this.outputElement = iframe;

    // editing ui
    let hitsContainer = document.createElement('div');
    let hitsNumber = document.createElement('p');
    let hitsImage = document.createElement('img');
    hitsContainer.className = 'post-hits-container';
    hitsNumber.innerText = this.hits;
    hitsImage.src = '/assets/heart.png';
    hitsContainer.appendChild(hitsImage);
    hitsContainer.appendChild(hitsNumber);

    let editContainer = document.createElement('div');
    editContainer.className = 'edit-container'
    let editButton = document.createElement('button');
    editButton.innerText = 'Edit'
    let deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete'

    editContainer.appendChild(hitsContainer);
    editContainer.appendChild(editButton);
    editContainer.appendChild(deleteButton);

    postCard.className = "post text-post";
    postCard.classList.add('hide');
    // postCard.style.backgroundColor = 'black';

    postCard.appendChild(iframe);
    postCard.appendChild(editContainer);
    //Assigning div card
    this.postCard = postCard;

    editButton.addEventListener('click', () => {
        window.location.href = `/post/text/${this.text_id}`;
    })

    deleteButton.addEventListener('click', async () => {
        await fetch(`/post/text/${this.text_id}/delete`, {
            method: 'post'
        })
        .then(location.replace(window.location.href))
    })
}


function createImagePostsAndAppend(url, type, id, public_id, hits){
    let tempCard = new ImagePost(url, type, id, public_id, hits);
    document.getElementById('img-container').appendChild(tempCard.postCard);
}

function createLinkPostsAndAppend(hits, url, url_short, link_id, domain){
    let tempCard = new LinkPost(hits, url, url_short, link_id, domain);
    document.getElementById('link-container').appendChild(tempCard.postCard);
}

function createTextPostsAndAppend(hits, html, css, js, text_id){
    let tempCard = new TextPost(hits, html, css, js, text_id);
    document.getElementById('txt-container').appendChild(tempCard.postCard);
    tempCard.outputElement.contentDocument.body.innerHTML = tempCard.html + "<style>" +
    `
    *{
        overflow: hidden;
    }
    ` +  tempCard.css + "</style>"
}


function activate(id) {
    type = ['link', 'txt', 'img'];

    let element = document.getElementById(id);
    if (element.classList.contains("active")){
        return;
    }

    for (let i = 0; i < type.length; i++){
        if(type[i] === id){
            element.classList.add("active");
            element.classList.remove("inactive")

            document.getElementById(`${id}-container`).classList.remove('hide');
            document.getElementById(`${id}-container`).classList.add('show');
            let children = document.getElementById(`${id}-container`).getElementsByClassName('post');
            for (let i = 0; i < children.length; i++){
                children[i].classList.add('show')
                children[i].classList.remove('hide')
            }
           

        }else{
            let temp = document.getElementById(type[i])
            temp.classList.remove('active');
            temp.classList.add("inactive");
            document.getElementById(`${type[i]}-container`).classList.remove('show');
            document.getElementById(`${type[i]}-container`).classList.add('hide');
            let children = document.getElementById(`${type[i]}-container`).getElementsByClassName('post');
            for (let i = 0; i < children.length; i++){
                children[i].classList.remove('show')
                children[i].classList.add('hide')
            }
        }
    }
}

