//Adding items to todo list and display them
window.addEventListener("load", (e) => {
  statesButtons = document.querySelectorAll(".states-buttons");
  const newTodoForm = document.querySelector("#new-todo-form");
  countTodo = document.querySelector(".count");
  listDeleteButton = document.querySelector(".clear-completed-button");

  todos = JSON.parse(localStorage.getItem("todos")) || [];

  newTodoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const todoContent = e.target.elements.content.value;
    const todoChecked = e.target.elements.input.checked;

    const isDuplicate = todos.some((t) => t.content === todoContent);

    if (!isDuplicate && todoContent !== "") {
      const todo = {
        content: todoContent,
        done: todoChecked,
        createdAt: new Date().getTime(),
        state: "All Active",
        number: 1,
      };

      todos.push(todo);

      localStorage.setItem("todos", JSON.stringify(todos));

      e.target.reset();

      DisplayTodos();
    }
  });

  statesButtons.forEach((stateButton) => {
    stateButton.addEventListener("click", (e) => {
      todos = JSON.parse(localStorage.getItem("todos")) || [];

      if (stateButton.classList.contains("all-button")) {
        todos = todos.filter((t) => t.state.split(" ")[0] === "All");
      } else if (stateButton.classList.contains("active-button")) {
        todos = todos.filter((t) => t.state.split(" ")[1] === "Active");
      } else if (stateButton.classList.contains("completed-button")) {
        todos = todos.filter((t) => t.state.split(" ")[1] === "Completed");
      }
      DisplayTodos();
    });
  });

  DisplayTodos();

  DarkTheme();
});

//display function
const DisplayTodos = () => {
  const todoList = document.querySelector("#todo-list");

  todoList.innerHTML = "";

  todos.forEach((todo) => {
    todoItem = document.createElement("div");
    todoItem.classList.add("todo-item");
    todoItem.classList.add("draggable");
    todoItem.classList.add("dark-theme");
    todoItem.draggable = true;

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = todo.done;

    const span = document.createElement("span");
    span.classList.add("bubble");

    const content = document.createElement("div");
    content.classList.add("todo-content");
    content.innerHTML = `<input type="text" class="input-text dark-theme" value="${todo.content}" readonly>`;

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    deleteButton.innerHTML = `<img src="images/icon-cross.svg">`;

    label.appendChild(input);
    label.appendChild(span);
    actions.appendChild(deleteButton);
    todoItem.appendChild(label);
    todoItem.appendChild(content);
    todoItem.appendChild(actions);

    todoList.appendChild(todoItem);

    if (todo.done) {
      todoItem.classList.add("done");
    }

    input.addEventListener("click", (e) => {
      e.preventDefault();
      todo.done = e.target.checked;
      localStorage.setItem("todos", JSON.stringify(todos));

      if (todo.done) {
        todoItem.classList.add("done");
        todo.state = "All Completed";
        localStorage.setItem("todos", JSON.stringify(todos));
      } else {
        todoItem.classList.remove("done");
        todo.state = "All Active";
        localStorage.setItem("todos", JSON.stringify(todos));
      }

      DisplayTodos();
    });

    deleteButton.addEventListener("click", (e) => {
      todos = todos.filter((t) => t != todo);
      localStorage.setItem("todos", JSON.stringify(todos));
      DisplayTodos();
    });
  });

  Drag();

  listDeleteButton.addEventListener("click", (e) => {
    todos = JSON.parse(localStorage.getItem("todos")) || [];

    todos = todos.filter((t) => t.state.split(" ")[1] !== "Completed");

    localStorage.setItem("todos", JSON.stringify(todos));
    DisplayTodos();
  });

  const count = todos.reduce((previous, todo) => {
    return previous + todo.number;
  }, 0);

  countTodo.innerHTML = `${count} items left`;
  const stateClearSection = document.querySelector(".state-clear");
  if (count === 0) {
    stateClearSection.style.borderRadius = `5px 5px 5px 5px`;
  } else {
    stateClearSection.style.borderRadius = `0px 0px 5px 5px`;
  }
};

//dragging function to reorder list
const Drag = () => {
  const listContainer = document.querySelector(".list-container");

  draggables = document.querySelectorAll(".todo-item.draggable");

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
      updateTodoOrder();
    });
  });

  listContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(listContainer, e.clientY);

    const draggable = document.querySelector(".dragging");
    if (draggable !== null) {
      if (afterElement == null) {
        listContainer.appendChild(draggable);
      } else {
        listContainer.insertBefore(draggable, afterElement);
      }
    }
  });

  function getDragAfterElement(listContainer, y) {
    const draggableElements = [
      ...listContainer.querySelectorAll(".todo-item.draggable:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function updateTodoOrder() {
    const orderedTodos = [...document.querySelectorAll(".todo-item")].map(
      (todo, index) => {
        const existingTodo = todos.find(
          (t) => t.content === todo.querySelector(".todo-content input").value
        );
        return {
          ...existingTodo,
          createdAt: new Date().getTime(),
          number: 1,
        };
      }
    );
    todos = orderedTodos;
    localStorage.setItem("todos", JSON.stringify(orderedTodos));
  }
};

//changing theme to dark and vice versa
const DarkTheme = () => {
  let darkMode = localStorage.getItem("darkMode") || "";

  let darkModeToggle = document.querySelector(".theme");

  const themeIcon = document.querySelector(".theme");

  const enableDarkMode = () => {
    document.body.classList.add("darkmode");
    themeIcon.src = "images/icon-moon.svg";
    themeIcon.style.transition = `0.2s linear`;
    localStorage.setItem("darkMode", "darkmode");
  };

  const disableDarkMode = () => {
    document.body.classList.remove("darkmode");
    themeIcon.src = "images/icon-sun.svg";
    themeIcon.style.transition = `0.2s linear`;
    localStorage.setItem("darkMode", null);
  };

  if (darkMode === "darkmode") {
    enableDarkMode();
  } else {
    disableDarkMode();
  }

  darkModeToggle.addEventListener("click", () => {
    darkMode = localStorage.getItem("darkMode");

    if (darkMode !== "darkmode") {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  });
};
