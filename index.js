const listContainer = document.querySelector("[data-list-container]");
const addNewList = document.querySelector("[data-new-list]");
const listTemplate = document.getElementById("list-template");
const taskTemplate = document.getElementById("task-template");

const listDisplayContainer = document.querySelector("[data-list-display-container]");
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const taskContainer = document.querySelector("[data-tasks]");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_kEY = "task.selectedListId";

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_kEY);

newTaskForm.addEventListener("submit", e => {
  e.preventDefault();
  const taskName = newTaskInput.value
  if(taskName === null || taskName === "") return;
  const task = createTask(taskName);
    newTaskInput.value = "";
  const selectedList = lists.find(list=> list.id === selectedListId);
    selectedList.tasks.push(task)
  saveAndRender();
})

addNewList.addEventListener("click", () => {
  const list = createList();
  lists.push(list);
  saveAndRender();
});


listContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input" || "a") {
    selectedListId = e.target.dataset.listId;
    save();
    const selectedList = lists.find(list => list.id === selectedListId);
    renderTaskCount(selectedList);
    const deleteBtn = document.querySelectorAll("[data-delete-list]");
    deleteBtn.forEach(btn => {
      if(`delete-${selectedList.id}` === btn.id) {
        btn.style.display = "";
      } else {
        btn.style.display = "none";
      }
    })
  } 
  if (e.target.tagName.toLowerCase() === "a") {
    const selectedList = lists.find(list => list.id === selectedListId)
      listDisplayContainer.style.display = "";
      listTitleElement.innerText = selectedList.name.toUpperCase();
  }
});

taskContainer.addEventListener("click", (e) => {
  if(e.target.tagName.toLowerCase() === "input") {
     const selectedList = lists.find(list => list.id === selectedListId);
     const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
      selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
})

function renderList() {
  lists.forEach((list) => {
    const listElement = document.importNode(listTemplate.content, true);
    const listItem = listElement.querySelector(".list-group-item");
    const deleteBtn = listElement.querySelector("button");
      listItem.setAttribute("href", `#list-${list.id}`);
      listItem.id = `list-${list.id}-list`;
      listItem.dataset.listId = list.id;
      listItem.value = list.name;
      deleteBtn.id = `delete-${list.id}`;
    createDeleteListBtn(deleteBtn);
    if (list.id == selectedListId) {
      listItem.classList.add("active");
      listItem.classList.add("show");
      deleteBtn.style.display = "";
    }
    listContainer.appendChild(listElement);
    if (list.hasItrendered) {
      replaceElement(listItem, "a", list.id);
    }
  });
}

function renderTask() {
    lists.forEach(list => {
      const taskElement = document.createElement("div");
        taskElement.classList.add("tab-pane");
        taskElement.classList.add("fade");
        taskElement.id =  `list-${list.id}`;
        taskElement.setAttribute("role","tabpanel");
      if (list.id == selectedListId) {
        taskElement.classList.add("active");
        taskElement.classList.add("show");
      }
      taskContainer.appendChild(taskElement);
    });

    lists.forEach(list => {
      const id = list.id
      list.tasks.forEach(task=> {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkBox = taskElement.querySelector("input");
        const label = taskElement.querySelector("label")
        const taskContainer = document.querySelector(`#list-${id}`);
        const clearCompleteTasksButton = taskElement.querySelector("[data-delete-task]");
          createDeleteTaskBtn(clearCompleteTasksButton);
          checkBox.id = task.id;
          checkBox.checked = task.complete;
          label.htmlFor = task.id;    
          label.append(toTitleCase(task.name));
        taskContainer.appendChild(taskElement);
      })
  });
}

const toTitleCase = (phrase) => {
  return phrase
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function renderTaskCount(selectedList) {
  const incompleteTasks = selectedList.tasks.filter(task => !task.complete).length;
  const taskString = incompleteTasks === 1 ? "task" : "tasks";
    listCountElement.innerText = `${incompleteTasks} ${taskString} remaining`;
}

function replaceElement(source, newType, elementTargetId) {
  // Create the document fragment
  const frag = document.createDocumentFragment();
  // Fill it with what's in the source element
  while (source.firstChild) {
    frag.appendChild(source.firstChild);
  }
  // Create the new element
  const newElem = document.createElement(newType);
  // Empty the document fragment into it
  newElem.appendChild(frag);

  //Declare the value of the Source element("input")
  let value = source.value;

  lists.forEach((list) => {
    if (list.id == elementTargetId) {
      list.name = value;
    }
  });
  newElem.textContent = toTitleCase(value);
  //Copu each attribute to the new element("a")
  [...source.attributes].forEach((attr) => {
    if(attr.name !== "onkeypress" && attr.name !== "placeholder" && attr.name !== "type") {
      newElem.setAttribute(attr.name, attr.value);
    }
  });
  // Replace the source element with the new element on the page
  source.parentNode.replaceChild(newElem, source);
}

function submitList(e) {
  if (e.key === "Enter" && e.target.value !== "") {
    const elmTarget = e.target;
    const id = elmTarget.getAttribute("data-list-id");
    replaceElement(elmTarget, "a", id);
    lists.forEach((list) => {
      if (list.id === id) {
        list.hasItrendered = !list.hasItrendered;
      }
    });
    saveAndRender();
  }
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createList() {
  return {
    name: "",
    id: Date.now().toString(),
    tasks: [],
    hasItrendered: false,
  };
}
function createTask(name) {
  return {
    id: Date.now().toString(),
    name: name,
    complete: false
  }
}

function createDeleteTaskBtn(element) {
  element.addEventListener("click", e => {
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender();
  })
}

function createDeleteListBtn(element) {
  element.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "i") {
      lists = lists.filter((list) => e.target.parentNode.id !== `delete-${list.id}`);
    } else {
      lists = lists.filter((list) => e.target.id !== `delete-${list.id}`);
    }
    selectedListId = null;
    saveAndRender();
  });
}

function saveAndRender() {
  save();
  render();
}

function render() {
  clearElement(listContainer);
  renderList();

  const selectedList = lists.find(list => list.id === selectedListId)
  if(selectedList == null ) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    listTitleElement.innerText = selectedList.name.toUpperCase();
    renderTaskCount(selectedList)
    clearElement(taskContainer);
    renderTask();
  }
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_kEY, selectedListId);
}

render();

