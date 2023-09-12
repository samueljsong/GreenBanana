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
        }else{
            let temp = document.getElementById(type[i])
            temp.classList.remove('active');
            temp.classList.add("inactive");
        }
    }
}