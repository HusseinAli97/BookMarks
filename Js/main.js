// ! ************************* Selected Elements *************************
const siteNameInput = document.querySelector("#siteName");
const siteUrlInput = document.querySelector("#siteUrl");
const addBtn = document.querySelector("#addBtn");
const tableBody = document.querySelector("#tableBody");
const localStorageKey = "bookmarks";
let visitMoment = '';
let bookmarkList = [];

// ! ************************* Local Storage Functions *************************
// Check if local storage has data or not and send to display if yes
(function initialize() {
    if (localStorage.getItem(localStorageKey)) {
        bookmarkList = JSON.parse(localStorage.getItem(localStorageKey));
        displayBookmarks(bookmarkList);
    }
})();

// Store data in local storage
function storeBookmarksInLocalStorage(bookmarks) {
    localStorage.setItem(localStorageKey, JSON.stringify(bookmarks));
}

// ! ************************* Events Function *************************
function attachEventListeners() {
    addBtn.addEventListener('click', addBookmark);
    document.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') {
            addBookmark();
        }
    });
    siteNameInput.addEventListener('input', validateSiteName);
    siteUrlInput.addEventListener('input', validateSiteUrl);
}
attachEventListeners();

// ! ************************* Add Bookmark Function *************************
function addBookmark() {
    const bookmark = {
        name: siteNameInput.value,
        url: siteUrlInput.value,
        editDate: moment().format("MMMM Do YYYY, h:mm:ss a"),
        visitDate: visitMoment,
    };

    if (isValidBookmark()) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be added!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, add it!'
        }).then((result) => {
            if (result.isConfirmed) {
                bookmarkList.push(bookmark);
                storeBookmarksInLocalStorage(bookmarkList);
                displayBookmarks(bookmarkList);
                clearInputs();
                showSuccessToast(`${bookmark.name} added successfully`);
                siteNameInput.classList.remove("is-valid");
                siteUrlInput.classList.remove("is-valid");
            }
        });
    } else {
        if (!validateSiteName(siteNameInput.value) && !validateSiteUrl(siteUrlInput.value)) {
            showFailed(`Please enter a valid site name and URL.`);
        } else if (!validateSiteName(siteNameInput.value)) {
            showFailed(`Please enter a valid site name containing at least 3 characters.`);
        } else {
            showFailed(`Please enter a valid URL. Example: https://google.com`);
        }
    }
}

// ! ************************* Clear Inputs *************************
function clearInputs() {
    siteNameInput.value = "";
    siteUrlInput.value = "";
}

// ! ************************* Display Bookmark Function *************************
function displayBookmarks(bookmarks) {
    let content = '';
    for (let i = 0; i < bookmarks.length; i++) {
        const { name, url, editDate, visitDate } = bookmarks[i];
        content += `
        <tr>
            <th scope="row" class="py-3 text-white">${i + 1}</th>
            <td class="py-3 text-uppercase text-white">${name}</td>
            <td class="py-3 text-white">${url}</td>
            <td>
                <button class="btn btn-info w-100 visitBtn" data-index="${i}">
                    <i class="fa-solid text-white fa-eye"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-danger w-100 delBtn" data-index="${i}">
                    <i class="fa-solid text-white fa-trash"></i>
                </button>
            </td>
            <td class="py-3 text-white">${editDate}</td>
            <td class="py-3 text-white">${visitDate}</td>
        </tr>`;
    }
    tableBody.innerHTML = content;
    setEventsToDisplay();
}
function setEventsToDisplay() {
    const delBtns = document.querySelectorAll(".delBtn");
    const visitBtns = document.querySelectorAll(".visitBtn");
    delBtns.forEach((delBtn) => {
        delBtn.addEventListener('click', (e) => {
            deleteBookmark(Number(e.target.getAttribute("data-index")));
        });
    });
    visitBtns.forEach((visitBtn) => {
        visitBtn.addEventListener('click', (e) => {
            visitMoment = moment().format('D/M/YYYY,HH:mmA');
            addVisitLink(Number(e.target.getAttribute("data-index")), visitMoment);
        });
    });
}
function addVisitLink(index, visitMoment) {
    bookmarkList[index].visitDate = visitMoment;
    storeBookmarksInLocalStorage(bookmarkList);
    displayBookmarks(bookmarkList);
    window.open(`https://${bookmarkList[index].url}`, '_blank');
}

// ! ************************* Delete Bookmark Function *************************
function deleteBookmark(index) {
    Swal.fire({
        icon: 'error',
        title: 'Delete',
        text: 'Are you sure you want to delete this bookmark?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            bookmarkList.splice(index, 1);
            storeBookmarksInLocalStorage(bookmarkList);
            displayBookmarks(bookmarkList);
            showSuccessToast(`Bookmark deleted successfully`);
        } else {
            return;
        }
    });
}
// ! ************************* Validation *************************
function validateSiteName() {
    const regexName = /^[a-zA-Z0-9]{3,}$/gi;
    if (regexName.test(siteNameInput.value)) {
        siteNameInput.classList.replace("is-invalid", "is-valid");
        return true;
    } else {
        siteNameInput.classList.add("is-invalid");
        return false;
    }
}
function validateSiteUrl() {
    const regexUrl = /^(?:https?:\/\/)?[a-zA-Z0-9-]{2,256}\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
    if (regexUrl.test(siteUrlInput.value)) {
        siteUrlInput.classList.replace("is-invalid", "is-valid");
        return true;
    } else {
        siteUrlInput.classList.add("is-invalid");
        return false;
    }
}
function isValidBookmark() {
    return validateSiteName() && validateSiteUrl();
}

// ! ************************* Sweet Alert Functions *************************
function showSuccessToast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    Toast.fire({
        icon: 'success',
        title: message
    });
}

function showFailed(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
    });
}
