const listContainer = document.querySelector("[data-list-container]");
const addNewList = document.querySelector("[data-new-list]");
const listTemplate = document.getElementById("list-template");
const taskTemplate = document.getElementById("task-template");


const listDisplayContainer = document.querySelector("[data-list-display-container]");
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const taskContainer = document.querySelector("[data-tasks]");

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_kEY = "task.selectedListId";

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_kEY);

addNewList.addEventListener("click", () => {
  const list = createList();
  lists.push(list);
  saveAndRender();
});

$(listContainer).on("shown.bs.tab", (e) => {
  if (e.target.tagName.toLowerCase() === "input" || "a") {
    selectedListId = e.target.dataset.listId;
  } 
  saveAndRender();
});





function renderList() {
  lists.forEach((list) => {
    const listElement = document.importNode(listTemplate.content, true);

    const listItem = listElement.querySelector(".list-group-item");
    const deleteBtn = listElement.querySelector("button");

    const container = document.getElementById("list-tab");

    listItem.setAttribute("href", `#list-${list.id}`);
    listItem.id = `list-${list.id}-list`;
    listItem.dataset.listId = list.id;
    listItem.value = list.name;

    deleteBtn.id = `delete-${list.id}`;

    createDeleteBtn(deleteBtn);

    if (list.id == selectedListId) {
      listItem.classList.add("active");
      listItem.classList.add("show");
      deleteBtn.style.display = ""
    }

    container.appendChild(listElement);

    if (list.hasItrendered) {
      replaceElement(listItem, "a", list.id);
    }
  });
}

function renderTask(selectedList) {

  selectedList.tasks.forEach(task => {

  const taskElement = document.importNode(taskTemplate.content, true);
  const tasks = taskElement.querySelector(".tab-pane")

  lists.forEach(list => {
    tasks.id =  `list-${list.id}`;
    setTimeout(()=> {
      if (selectedListId === list.id) {
        tasks.classList.add("active")
        tasks.classList.add("show")
      }
    },200);
  });

    const checkBox = taskElement.querySelector("input");
    checkBox.id = task.id;
    checkBox.checked = task.complete;

    const label = taskElement.querySelector("label")
    label.htmlFor = task.id;    
    label.append(task.name)
    taskContainer.appendChild(taskElement);
  })
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
    newElem.setAttribute(attr.name, attr.value);
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
    tasks: [
      {
        name: "feed the cat",
        id: "23",
        complete: false
      },
      {
        name: "prepare food",
        id: "45",
        complete: false
      },
      {
        name: "Do laundry",
        id: "13",
        complete: false
      }
      
    ],
    hasItrendered: false,
  };
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
  if(selectedListId == null) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    listTitleElement.innerText = selectedList.name;
    // renderTasnkCount(selectedList);
    clearElement(taskContainer);
    renderTask(selectedList)
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
