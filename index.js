document.addEventListener("DOMContentLoaded", function () {
    const userForm = document.getElementById("userForm")
    const userTableBody = document.getElementById("userTableBody")
    const workoutList = document.getElementById("workoutList")
    const progressForm = document.getElementById("progressForm")
    const progressTracker = document.getElementById("progressTracker")
    const motivationalQuote = document.getElementById("motivationalQuote")
    
    //function to GET motivational tips and display them at intervals of 5 seconds
    let tips = []
    function fetchMotivationalTips() {
        fetch("http://localhost:3000/motivational_tips")
            .then(response => response.json())
            .then(data => {
                tips = data
                displayRandomTip()
                setInterval(displayRandomTip, 5000)
            })
    }

    function displayRandomTip() {
        const randomIndex = Math.floor(Math.random() * tips.length)
        motivationalQuote.innerText = tips[randomIndex].tip
    }

    //function to POST user data to db.json
    function postUserData() {
        const userData = {
            name: document.getElementById("name").value,
            bodyType: document.getElementById("bodyType").value,
            workoutCategory: document.getElementById("workoutCategory").value,
            workoutDays: document.getElementById("workoutDays").value
        }

        return fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(() => {
            userForm.reset()
            displayUsers()
        })
    }

    userForm.addEventListener("submit", function(event) {  //submit event
        event.preventDefault()
        postUserData()
    })


    //function to GET and display user data in a table
    function displayUsers() {
        fetch("http://localhost:3000/users")
            .then(response => response.json())
            .then(data => {
                userTableBody.innerHTML = ""
                data.forEach((user, index) => {
                    const row = document.createElement("tr")
                    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.name}</td>
                    <td>${user.bodyType}</td>
                    <td>${user.workoutCategory}</td>
                    <td>${user.workoutDays}</td>
                    <td>
                        <button class="delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                `
                    userTableBody.appendChild(row)
                })
                document.querySelectorAll(".delete-btn").forEach(button => {
                    button.addEventListener("click", function() {  //click event
                        const userId = this.getAttribute("data-id")
                        deleteUser(userId)
                    })
            })
        })
    }
    
    //function to DELETE user from db.json
    window.deleteUser = function(id) {
        fetch(`http://localhost:3000/users/${id}`, {
            method: "DELETE"
        }).then(() => displayUsers())
    }
    

    //function to GET workout data and display it 
    function getWorkoutData() {
        fetch("http://localhost:3000/workouts")
            .then(response => response.json())
            .then(workouts => {
                workoutList.innerHTML = ""
                workouts.forEach(workout => {
                    const li = document.createElement("li")
                    li.textContent = `${workout.name} (${workout.category})`
                    li.style.cursor = "pointer"
                    li.addEventListener("mouseover", () => li.style.backgroundColor = "#ffccdb") //mouseover event
                    li.addEventListener("mouseout", () => li.style.backgroundColor = "") //mouseout event
                    li.addEventListener("click", () => showExercises(workout.id)) //click event 
                    workoutList.appendChild(li)
                })
            })
    }

    //function to show exercises under the workout category clicked
    function showExercises(workoutId) {
        fetch(`http://localhost:3000/workouts/${workoutId}`)
            .then(response => response.json())
            .then(workout => {
                const exerciseList = document.getElementById("exerciseList")
                exerciseList.innerHTML = `<h3>Exercises for ${workout.name}</h3>`
                workout.exercises.forEach(exercise => {
                    const li = document.createElement("li")
                    li.innerHTML = `
                        <input type="checkbox" id="exercise-${exercise.id}" />
                        ${exercise.type} - ${exercise.duration}
                    `
                    exerciseList.appendChild(li)
                })
                exerciseList.style.display = "block"
            })
    }

    progressForm.addEventListener("submit", function(event) { //submit event
        event.preventDefault()
        const selectedExercises = []
        const exercises = document.querySelectorAll("#exerciseList input[type='checkbox']:checked")

        exercises.forEach(exercise => {
            const exerciseId = exercise.id.split('-')[1]
            selectedExercises.push(exerciseId)
        })
        //POST progress data to db.json
        selectedExercises.forEach(exerciseId => {
            fetch("http://localhost:3000/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ exerciseId, status: "In Progress" }) 
            }).then(() => displayProgress())
        })
    })

    //function to GET and display progress data
    function displayProgress() {
        fetch("http://localhost:3000/progress")
            .then(response => response.json())
            .then(progressData => {
                progressTracker.innerHTML = ""
                const progressTable = document.createElement("table")
                const headerRow = document.createElement("tr")
                headerRow.innerHTML = `<th>Status</th><th>Actions</th>`
                progressTable.appendChild(headerRow)

                progressData.forEach(progress => {
                    const row = document.createElement("tr")
                    row.innerHTML = `
                        <td>${progress.status}</td>
                        <td>
                            <button class="update-btn" data-id="${progress.id}">Update Status</button>
                            <button class="delete-progress-btn" data-id="${progress.id}">Delete</button>
                        </td>
                    `
                    progressTable.appendChild(row)
                })

                progressTracker.appendChild(progressTable)

                document.querySelectorAll(".update-btn").forEach(button => {
                    button.addEventListener("click", function() {
                        const progressId = this.getAttribute("data-id")
                        updateProgress(progressId)
                    })
                })
                document.querySelectorAll(".delete-progress-btn").forEach(button => {
                    button.addEventListener("click", function() {
                        const progressId = this.getAttribute("data-id")
                        deleteProgress(progressId)
                    })
                })
            })
    }

    //function to PATCH progress in db.json
    function updateProgress(id) {
        const newStatus = prompt("Enter new status (Completed, In Progress, Not Completed):")
        if (newStatus) {
            fetch(`http://localhost:3000/progress/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            }).then(() => displayProgress())
        }
    }

    //function to DELETE progress in db.json
    function deleteProgress(id) {
        fetch(`http://localhost:3000/progress/${id}`, {
            method: "DELETE"
        }).then(() => displayProgress());
    }
    
    fetchMotivationalTips()
    displayUsers()
    getWorkoutData()
    displayProgress()
})
