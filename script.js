/**
 * Creates a new DOM element with the specified tag name and text content.
 *
 * @param {string} tagName - The type of HTML element to create (e.g., 'div', 'span', 'li').
 * @param {string} textContent - The text content to set inside the created element.
 * @returns {HTMLElement} The newly created HTML element with the given text.
 */
function createElement(tagName, textContent) {
    const newElement = document.createElement(tagName);
    newElement.textContent = textContent;

    return newElement;
}

/**
 * Initializes interactivity and logic for a single task element.
 * Attaches event listeners for:
 * - Deleting the task
 * - Toggling its status between "pending" and "done"
 * - Editing the task title on double-click
 *
 * @param {Object} params - Configuration object.
 * @param {HTMLElement} params.deleteButton - The delete button for the task.
 * @param {HTMLElement} params.newRow - The task container element (e.g., <li>).
 * @param {HTMLElement} params.taskTitle - The <p> element containing the task title.
 * @param {number} params.taskId - Unique ID of the task.
 * @param {boolean} params.status - Current completion status (true if done).
 * @param {HTMLElement} params.taskList - The task list container element.
 */
function setupTaskInteractions({deleteButton, newRow, taskTitle, taskId, status, taskList}) {
    deleteButton.addEventListener("click", () => {
        taskList.removeChild(newRow);

        const tasks = JSON.parse(localStorage.getItem("tasks"));
        const updateTasks = tasks.filter((task) => task.id !== taskId);
        localStorage.setItem("tasks", JSON.stringify(updateTasks));
    });

    newRow.appendChild(taskTitle);
    newRow.appendChild(deleteButton);

    let isEditing = false;
    let singleClickTimer = null;

    // Toggle task status (done/pending)
    newRow.addEventListener("click", () => {
         if (!singleClickTimer) {
             singleClickTimer = setTimeout(() => {
                 status = !status;

                 const tasks = JSON.parse(localStorage.getItem("tasks"));
                 const index = tasks.findIndex((task) => task.id === taskId);

                 if (index !== -1 && !isEditing) {
                     tasks[index].status = (status) ? "done" : "pending";
                     newRow.style.backgroundColor = (status) ? "#B2FF66" : "#f2f2f2";
                     localStorage.setItem("tasks", JSON.stringify(tasks));
                 }
                 singleClickTimer = null;
             }, 300);
         }
    });

    // Edit task on double-click
    newRow.addEventListener("dblclick", () => {
        if (singleClickTimer) {
            clearTimeout(singleClickTimer);
            singleClickTimer = null;
        }

        const editInput = document.createElement("input");
        editInput.value = taskTitle.textContent;

        const saveButton = createElement('button', 'Save');

        newRow.replaceChild(editInput, taskTitle);
        newRow.replaceChild(saveButton, deleteButton);

        saveButton.onclick = (event) => {
            event.stopPropagation();
            const editedText = editInput.value;
            if (editedText === '') return;

            taskTitle.textContent = editedText;
            newRow.replaceChild(taskTitle, editInput);
            newRow.replaceChild(deleteButton, saveButton);

            // Update localStorage
            const tasks = JSON.parse(localStorage.getItem("tasks"));
            const index = tasks.findIndex((task) => task.id === taskId);
            if (index !== -1) {
                tasks[index].title = editedText;
                localStorage.setItem("tasks", JSON.stringify(tasks));
            }
            isEditing = false;
        };
        isEditing = true;
    });
}

/**
 * Creates and appends a task element to the task list with full interactivity.
 *
 * @param {Object} task - The task data (id, title, status).
 * @param {HTMLElement} taskList - The container to append the task to.
 */
function renderTask(task, taskList) {
    const newRow = document.createElement("li");
    const taskTitle = createElement('p', task.title);
    const deleteButton = createElement('button', 'Delete');

    const taskId = task.id;
    let status = task.status === "done";

    newRow.style.backgroundColor = status ? "#B2FF66" : "#f2f2f2";
    newRow.appendChild(taskTitle);
    newRow.appendChild(deleteButton);
    taskList.appendChild(newRow);


    setupTaskInteractions({
        deleteButton,
        newRow,
        taskTitle,
        taskId : task.id,
        status,
        taskList,
    });
}

/**
 * Handles the addition of a new task to the list and localStorage.
 * Called when the "Add Task" button is clicked.
 *
 * @param {Event} event - The form submit event.
 */
function addTask(event) {
    event.preventDefault();

    const taskList = document.getElementById("task_list");
    const title = document.getElementById("new_task_text").value;
    if (!title) return;
    document.getElementById("new_task_text").value = '';

    const taskId = Date.now();
    const task = {
        id : taskId,
        title,
        status : "pending"
    };

    // Save to localStorage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTask(task, taskList);
}

/**
 * Display all tasks from localStorage in the task list.
 *
 * @param {Event} event - The click event from the "ALL" button.
 */
function showAllTasks(event) {
    event.preventDefault();

    const allButtons = document.getElementsByTagName("button");
    for (const button of allButtons) {
        button.style.background = "#007bff";
    }

    const taskList = document.getElementById("task_list");
    taskList.innerHTML = '';

    const allTasksButton = document.getElementById("all_tasks");
    allTasksButton.style.background = "#0056b3";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
        renderTask(task, taskList);
    });
}

/**
 * Display only the active (pending) tasks from localStorage.
 * Triggered when the "ACTIVE" button is clicked.
 *
 * @param {Event} event - The click event from the button.
 */
function showActiveTasks(event) {
    event.preventDefault();
    const allButtons = document.getElementsByTagName("button");
    for(const button of allButtons) {
        button.style.background = "#007bff";
    }

    const taskList = document.getElementById("task_list");
    taskList.innerHTML = '';

    const activeTasksButton = document.getElementById("active_tasks");
    activeTasksButton.style.backgroundColor = "#0056b3";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const activeTasks = tasks.filter((task) => task.status === "pending");
    activeTasks.forEach((task) => {
        renderTask(task, taskList);
    })
}

/**
 * Display only the completed (done) tasks from localStorage.
 * Triggered when the "COMPLETED" button is clicked.
 *
 * @param {Event} event - The click event from the button.
 */
function showComplitedTasks(event) {
    event.preventDefault();

    const allButtons = document.getElementsByTagName("button");
    for(const button of allButtons) {
        button.style.background = "#007bff";
    }

    const taskList = document.getElementById("task_list");
    taskList.innerHTML = '';

    const complitedTasksButtons = document.getElementById("complited_tasks");
    complitedTasksButtons.style.background = "#0056b3";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const complitedTasks = tasks.filter((task) => task.status === "done");

    complitedTasks.forEach((task) => {
        renderTask(task, taskList);
    });
}

/**
 * Clears all tasks marked as "done" (completed) from both the UI and localStorage.
 * Triggered when the "CLEAR COMPLITED" button is clicked.
 */
function clearComplitedTasks(event) {
    event.preventDefault();

    const taskList = document.getElementById("task_list");

    const tasks = JSON.parse(localStorage.getItem("tasks"))  || [];
    const remainingTasks = tasks.filter((task) => task.status !== "done");

    localStorage.setItem("tasks", JSON.stringify(remainingTasks));

    [...taskList.children].forEach((li) => {
        if (li.style.background === "#B2FF66") {
            taskList.removeChild(li);
        }
    })

    showAllTasks(event);
}

// Load all tasks on page load
window.addEventListener("load", showAllTasks);
