function ImagePost(url, type, id, public_id, hits){
    this.url = url;
    this.id = id;
    this.public_id = public_id;
    this.type = type;
    this.hits = hits;

    // Creating div card
    let postCard = document.createElement('div');
    postCard.className = "post";
    postCard.classList.add('hide');

    let tempImage = document.createElement('img');
    tempImage.src = this.url;
    postCard.appendChild(tempImage);


    //Assigning div card
    this.postCard = postCard;

    // Opening image
    this.postCard.addEventListener('click', () => {
        navigator.clipboard.writeText(this.url);
        alert("Copied URL: " + this.url);
    })

    this.postCard.addEventListener('mouseover', () => {
        
    })
}

function createImagePostsAndAppend(url, type, id, public_id, hits){
    let tempCard = new ImagePost(url, type, id, public_id, hits);
    document.getElementById('img-container').appendChild(tempCard.postCard);
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

