const peopleData = fetch('json/peopleData.json').then(res => res.json());
const pictureData = fetch('json/pictureData.json').then(res => res.json());
const languageData = fetch('json/languageData.json').then(res => res.json());
let intervalId;

document.querySelectorAll('.nav-icon').forEach(button => {
    button.addEventListener('click', () => showPage(button.dataset.page));
});

document.querySelectorAll('.book-nav-icon').forEach(button => {
    button.addEventListener('click', () => loadPeople(button.dataset.type));
});

document.getElementById('personCloseButton').addEventListener('click', closePerson);

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId + 'Page').style.display = 'block';
}

async function loadPeople(type) {
    const data = await peopleData;
    const container = document.querySelector('#bookPage .people-container');
    container.innerHTML = '';

    const people = type === 'teacher' ? data.teachers : data.students;
    people.forEach(person => {
        container.innerHTML += `
            <div class="person-item" data-person='${JSON.stringify(person)}'>
                <img src="${person.image[0]}" alt="${person.name}" data-path="${person.image[0]}">
                <div>${person.name}</div>
            </div>
        `;
    });

    document.querySelectorAll('.person-item').forEach(personItem => {
        personItem.addEventListener('click', () => {
            handlePersonClick(JSON.parse(personItem.dataset.person));
        });
    });
}

async function handlePersonClick(person) {
    const languageDataLoaded = await languageData;

    document.getElementById('personItemPage').style.display = 'block';

    document.getElementById('personItemOpen').src = person.image[0];
    document.getElementById('personName').textContent = person.name;
    if (person.hasOwnProperty('nickname')){
        document.getElementById('personName').textContent = person.name + " (aka. " + person.nickname + ")";
    }
    document.getElementById('personInfo').innerHTML = ``;
    document.getElementById('personDescription').textContent = person.description;

    if (isStudent(person)) {
        document.getElementById('personInfo').innerHTML += `
            <div id="personHeight" class="person-attribute">${languageDataLoaded.height}: ${person.height}</div>
            <div id="personBirthday" class="person-attribute">${languageDataLoaded.birthday}: ${person.birthday} (${calculateAge(person.birthday)})</div>
            <div id="personNationality" class="person-attribute">${languageDataLoaded.nationality}: ${person.nationality}</div>
            <div id="personGender" class="person-attribute">${languageDataLoaded.gender}: ${person.gender}</div>
        `;
    } else {
        document.getElementById('personInfo').innerHTML += `
            <div id="personRating" class="person-header">${languageDataLoaded.rating}:</div>
            <div id="personPersonality" class="person-attribute">${languageDataLoaded.personality}: ${person.rating.personality}</div>
            <div id="personLession" class="person-attribute">${languageDataLoaded.lesson}: ${person.rating.lesson}</div>
            <div id="personGrading" class="person-attribute">${languageDataLoaded.grading}: ${person.rating.grading}</div>
            <div id="personKnowledge" class="person-attribute">${languageDataLoaded.knowledge}: ${person.rating.knowledge}</div>
        `;
    }
    document.getElementById('personInfo').innerHTML += `<div id="personComments" class="person-comments">${person.comments[Math.floor(Math.random() * Object.keys(person.comments).length)]}</div>`;

    if (Object.keys(person.image).length > 1){
        const personContainer = document.getElementById('personContainer');
        personContainer.innerHTML += `<div id="nextButton" class="next-button" data-type="next"></div>
        <div id="previousButton" class="previous-button" data-type="previous"></div>`;

        document.getElementById('nextButton').addEventListener('click', () => {changePicture("next", person)});
        document.getElementById('previousButton').addEventListener('click', () => {changePicture("previous", person)});
    }

    const comments = person.comments;
    const commentsLength = Object.keys(comments).length

    intervalId = setInterval(() => {
        let activeIndex = 0;
        const activeText = document.getElementById('personComments').textContent;

        for (let i = 0; i < commentsLength; i++) {
            if(comments[i] === activeText){
                activeIndex = i;
                break;
            }
        }

        let newIndex = activeIndex + 1;

        if (newIndex >= commentsLength) {
            newIndex = 0;
        }

        console.log(newIndex);

        if (comments && commentsLength > 0) {
            document.getElementById('personComments').textContent = comments[newIndex];
        }
    }, 5000);
    
    document.getElementById('personItemPage').scrollTop = 0;
}

function calculateAge(birthdayString) {
    const parts = birthdayString.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    let age = todayYear - year;

    if (todayMonth < month || (todayMonth === month && todayDay < day)) {
        age--;
    }

    return age;
}

function changePicture(direction, person) {
    let activeImage;

    if (isStudent(person)) {
        activeImage = "image/student/" + document.getElementById('personItemOpen').src.split('image/student/')[1].replaceAll("%20", " ");
    }else{
        activeImage = "image/teacher/" + document.getElementById('personItemOpen').src.split('image/teacher/')[1].replaceAll("%20", " ");
    }

    let activeImageIndex = 0;

    for(let i = 0; i < Object.keys(person.image).length; i++) {
        if (person.image[i] === activeImage) {
            activeImageIndex = i;
            break;
        }
    }

    (direction === 'next') ? activeImageIndex ++ : activeImageIndex--;

    if (activeImageIndex < 0)
        activeImageIndex = Object.keys(person.image).length - 1;
    else if (activeImageIndex >= Object.keys(person.image).length)
        activeImageIndex = 0;

    document.getElementById('personItemOpen').src = person.image[activeImageIndex];
}

function isStudent(person){
    return person.hasOwnProperty('height');
}

async function loadPictures() {
    const data = await pictureData;
    const container = document.querySelector('#galleryPage .picture-container');
    container.innerHTML = '';

    const columnCount = 4; // Amount of Columns
    let columns = [];

    for (let i = 0; i < columnCount; i++) {
        columns.push(document.createElement('div'));
        columns[i].className = 'gallery-column';
        container.appendChild(columns[i]);
    }

    data.pictures.forEach((pic, index) => {
        const picDiv = document.createElement('div');
        picDiv.className = 'gallery-item';

        if (pic.image.includes(".mp4") || pic.image.includes(".mov") || pic.image.includes(".MOV")){
            picDiv.innerHTML = `<div style="position: relative; display: inline-block;">
                  <video src="${pic.image}" alt="Video" data-data='${JSON.stringify(pic)}' style="width: 100%; height: auto;"></video>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <button style="background-color: rgba(0, 0, 0, 0.5); border: none; padding: 10px 20px; border-radius: 5px; color: white; cursor: pointer;">▶ Play</button>
                  </div>
                </div>`;
        } else{
            picDiv.innerHTML = `<img src="${pic.image}" alt="Image" data-data='${JSON.stringify(pic)}'>`;
        }
        columns[index % columnCount].appendChild(picDiv);
    });

    document.querySelectorAll('.gallery-item img, .gallery-item video').forEach(img => {
        img.addEventListener('click', () => {
            openImage(JSON.parse(img.dataset.data));
        });
    });
}

function openImage(data) {
    const container = document.getElementById('galleryItemPage');
    const path = data.image;
    container.innerHTML = '<button class="close-button" aria-label="Close image" id="imageCloseButton"></button>';

    if (path.includes(".mp4") || path.includes(".mov") || path.includes(".MOV")) {
        container.innerHTML += '<video controls class="gallery-item-video-open">\n' +
            `<source src="${path}" type="video/mp4" id="galleryItemVideoOpen"> Your browser does not support the video tag.\n` +
            '</video>';
    } else {
        container.innerHTML += `<img id="galleryItemOpen" class="gallery-item-open" src="${path}" alt=""/>`;
    }

    container.innerHTML += '<div class="persons-container" id="personsContainer"></div>'
    const personsContainer = document.getElementById('personsContainer');

    for (let i = 0; i < Object.keys(data.persons).length; i++) {
        personsContainer.innerHTML +=
            '<div class="persons-person">' +
                `<img src="image/student/${data.persons[i]} - 1.png" alt="Picture">\n` +
                `<p>${data.persons[i]}</p>\n` +
            '</div>';
    }

    document.getElementById('imageCloseButton').addEventListener('click', closeImage);
    document.getElementById('galleryItemPage').style.display = 'block';
}

function closeImage() {
    document.getElementById('galleryItemPage').style.display = 'none';
}

function closePerson() {
    document.getElementById('personItemPage').style.display = 'none';

    document.getElementById("nextButton").remove();
    document.getElementById("previousButton").remove();

    clearInterval(intervalId);
}

function onLoad() {
    showPage('book');
    loadPeople('student')
    loadLanguage();
    waitForPictures();
}

async function waitForPictures(){
    await pictureData;
    loadPictures();
}

async function loadLanguage() {
    const data = await languageData;
    document.getElementById('teachersLabel').textContent = data.teachers;
    document.getElementById('studentsLabel').textContent = data.students;
}