const listContainer = document.querySelector("[data-list-container]");
const addNewList = document.querySelector("[data-new-list]");
const listTemplate = document.getElementById("list-template");
const taskTemplate = document.getElementById("task-template-container");
const taskTemplateItem = document.getElementById("task-template-item");

const listDisplayContainer = document.querySelector("[data-list-display-container]");
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const taskContainer = document.querySelector("[data-tasks]");
const newTaskForm = document.querySelector("[data-new-task-form]")
const newTaskInput = document.querySelector("[data-new-task-input]")

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
    const selectedList = lists.find(list => list.id === selectedListId)
    const deleteBtn = document.querySelectorAll("[data-delete-btn]");
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
     const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
      selectedTask.complete = e.target.checked
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
    createDeleteBtn(deleteBtn);
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
        taskElement.classList.add("tab-pane")
        taskElement.classList.add("fade")
        taskElement.id =  `list-${list.id}`;
        taskElement.setAttribute("role","tabpanel")  
      if (list.id == selectedListId) {
        taskElement.classList.add("active");
        taskElement.classList.add("show");
      }
      taskContainer.appendChild(taskElement);
    });

    lists.forEach(list => {
      const id = list.id
      list.tasks.forEach(task=> {
        const taskElement = document.importNode(taskTemplateItem.content, true);
        const checkBox = taskElement.querySelector("input");
        const label = taskElement.querySelector("label")
        const taskContainer = document.querySelector(`#list-${id}`)
          checkBox.id = task.id;
          checkBox.checked = task.complete;
          label.htmlFor = task.id;    
          label.append(task.name)
        taskContainer.appendChild(taskElement);
      })
  });
}
function renderTaskCount(selectedList) {
  const incompleteTasks = selectedList.tasks.filter(task => !task.complete).length
  const taskString = incompleteTasks === 1 ? "task" : "tasks"
    listCountElement.innerText = `${incompleteTasks} ${taskString} remaining`
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
  newElem.textContent = value;
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

function createDeleteBtn(element) {
  element.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "i") {
      lists = lists.filter(
        (list) => e.target.parentNode.id !== `delete-${list.id}`
      );
    } else {
      lists = lists.filter((list) => e.target.id !== `delete-${list.id}`);
    }
    selectedListId = null
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































// let todoList = {
//   todos: [],
//   addTodo: function (todoText) {
//     this.todos.push({
//       todoText: todoText,
//       completed: false,
//     });
//   },
//   deleteTodo: function (position) {
//     this.todos.splice(position, 1);
//   },
//   toggleCompleted: function (position) {
//     let todo = this.todos[position];
//     todo.completed = !todo.completed;
//   },
//   toggleAll: function () {
//     let totalTodos = this.todos.length;
//     let completedTodos = 0;

//     //Get the number of completed todos
//     this.todos.forEach(function (todo) {
//       if (todo.completed) {
//         completedTodos++;
//       }
//     });

//     this.todos.forEach(function (todo) {
//       if (completedTodos === totalTodos) {
//         todo.completed = false;
//       } else {
//         todo.completed = true;
//       }
//     });
//   },
// };

// let handlers = {
//   addTodo: function () {
//     let addTodoTextInput = document.getElementById("addTodoTextInput");
//     todoList.addTodo(addTodoTextInput.value);
//     addTodoTextInput.value = "";
//     view.displayTodos();
//   },
//   toggleAll: function () {
//     todoList.toggleAll();
//     view.displayTodos();
//   },
//   deleteTodo: function (position) {
//     todoList.deleteTodo(position);
//     view.displayTodos();
//   },
//   toggleCompleted: function (position) {
//     todoList.toggleCompleted(position);
//     view.displayTodos();
//   },
// };

// let view = {
//   displayTodos: function () {
//     let todosUl = document.querySelector("ul");
//     todosUl.innerHTML = "";

//     todoList.todos.forEach(function (todo, index) {
//       let todoLi = document.createElement("li");

//       let todoTextWithCompletion = "";
//       if (todo.completed) {
//         todoTextWithCompletion = "(x) " + todo.todoText;
//       } else {
//         todoTextWithCompletion = "( ) " + todo.todoText;
//       }

//       // todoLi.id = index;
//       todoLi.dataset.listId = index;
//       todoLi.className = "list-group-item";

//       todoLi.textContent = todoTextWithCompletion;
//       todoLi.appendChild(this.createToggleButton());
//       todoLi.appendChild(this.createDeleteButton());
//       todosUl.appendChild(todoLi);
//     }, this);
//   },
//   createDeleteButton: function () {
//     let deleteButton = document.createElement("button");
//     let spanElement = document.createElement("span");

//     spanElement.className = "badge badge-primary badge-pill";
//     spanElement.appendChild(deleteButton);

//     deleteButton.textContent = "X";
//     deleteButton.className = "deleteButton";
//     return spanElement;
//   },
//   createToggleButton: function () {
//     let toggleButton = document.createElement("button");
//     let spanElement = document.createElement("span");

//     spanElement.className = "badge badge-primary badge-pill";
//     spanElement.appendChild(toggleButton);

//     toggleButton.textContent = "O";
//     toggleButton.className = "toggleButton";
//     return spanElement;
//   },
//   setUpEventListener: function () {
//     let todosUl = document.querySelector("ul");
//     if (todosUl !== null) {
//       todosUl.addEventListener("click", function (e) {
//         let elementClicked = e.target;
//         if (elementClicked.className === "deleteButton") {
//           const index = elementClicked.parentNode.parentNode.getAttribute(
//             "data-list-id"
//           );
//           handlers.deleteTodo(parseInt(index));
//         } else if (elementClicked.className === "toggleButton") {
//           const index = elementClicked.parentNode.parentNode.getAttribute(
//             "data-list-id"
//           );
//           handlers.toggleCompleted(parseInt(index));
//         }
//       });
//     }
//   },
// };

// view.setUpEventListener();
