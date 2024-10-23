document.addEventListener('DOMContentLoaded', function () {
    loadTable();
});

function loadTable() {
    fetch('http://localhost:8080/studentInfo')
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Received students data:', data);
            let table = document.getElementById('studentList');

            let body = `<tr>
                        <th>Image</th>
                        <th>Student ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Grade</th>
                        <th>Address</th>
                        <th>Email</th>
                        <th>Contact Number</th>
                        <th>Action</th>
                    </tr>`;
            
            data.forEach(element => {
                body += ` <tr>
                          <td><img src="data:image/jpeg;base64,${element.image}" alt="Student Image" class="student-image"></td>
                          <td>${element.stdId}</td>
                          <td>${element.firstName}</td>
                          <td>${element.lastName}</td>
                          <td>${element.age}</td>
                          <td>${element.grade}</td>
                          <td>${element.address}</td>
                          <td>${element.email}</td>
                          <td>${element.contact}</td>
                          <td>
                          <button class="btn btn-secondary" onclick="editStudent(${element.stdId})">Edit</button>
                          <button class="btn btn-danger" onclick="deleteStudent(${element.stdId})">Delete</button>
                          </td>
                      </tr>`;
            });
            table.innerHTML = body;
        })
        .catch(error => {
            console.error('Error loading table:', error);
        });
}

function addStudent() {

    const studentDatas = fillData();
    if (!studentDatas) { return; }

    let firstName = document.getElementById('txtFirstName').value;
    let lastName = document.getElementById('txtLastName').value;
    let age = document.getElementById('txtAge').value;
    let grade = document.getElementById('txtGrade').value;
    let address = document.getElementById('txaAddress').value;
    let email = document.getElementById('txtEmail').value;
    let contact = document.getElementById('txtContact').value;
    let imageInput = document.getElementById('image');

    if (imageInput) {
        if (imageInput.files[0].size >= 1000000) {
            alert("Image file is too large!");
            imageInput.value = null;
            return;
        }
    }

    let formData = new FormData();
    let studentData = {
        firstName: firstName,
        lastName: lastName,
        age: age,
        grade: grade,
        address: address,
        email: email,
        contact: contact
    };

    formData.append('student', new Blob([JSON.stringify(studentData)], {
        type: 'application/json'
    }));
    formData.append('image', imageInput.files[0]);

    fetch('http://localhost:8080/studentInfo/addStudent', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            loadTable();
            clearForm();
            alert("Student Added Successfully !");
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


function editStudent(stdId) {
    localStorage.setItem('studentId', stdId);
    window.location.href = 'editForm.html';
}


function loadEditForm() {

    const id = localStorage.getItem('studentId');

    if (id) {
        fetch(`http://localhost:8080/studentInfo/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                let student;
                student = data;

                if (student) {
                    console.log('Student data:', student);
                    document.getElementById('txtFirstName').value = student.firstName;
                    document.getElementById('txtLastName').value = student.lastName;
                    document.getElementById('txtAge').value = student.age;
                    document.getElementById('txtGrade').value = student.grade;
                    document.getElementById('txaAddress').value = student.address;
                    document.getElementById('txtEmail').value = student.email;
                    document.getElementById('txtContact').value = student.contact;

                    localStorage.setItem("currentimage", JSON.stringify(student.image));
                }
            })
            .catch(error => {
                console.error('Error fetching student data:', error);
            });
    } else {
        console.error('No student ID found in localStorage');
        alert("No student found !");
    }
}


function updateStudent() {
    const id = localStorage.getItem('studentId');

    if (!id) {
        console.log('No student ID found in localStorage');
        alert("Student is not updated");
        return;
    }

    const studentDatas = fillData();
    if (!studentDatas) { return; }

    let firstName = document.getElementById('txtFirstName').value;
    let lastName = document.getElementById('txtLastName').value;
    let age = document.getElementById('txtAge').value;
    let grade = document.getElementById('txtGrade').value;
    let address = document.getElementById('txaAddress').value;
    let email = document.getElementById('txtEmail').value;
    let contact = document.getElementById('txtContact').value;
    let imageInput = document.getElementById('image');

    if (imageInput) {
        if (imageInput.files[0].size >= 1000000) {
            alert("Image file is too large!");
            imageInput.value = null;
            return;
        }
    }

    const formData = new FormData();
    const studentData = {
        "stdId": id,
        "firstName": firstName,
        "lastName": lastName,
        "age": age,
        "grade": grade,
        "address": address,
        "email": email,
        "contact": contact,
    };

    formData.append('student', new Blob([JSON.stringify(studentData)], { type: 'application/json' }));
    if (imageInput && imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    fetch(`http://localhost:8080/studentInfo/updateStudent/${id}`, {
        method: 'PUT',
        body: formData,
    })
        .then(response => response.text())
        .then(result => {
            console.log('Success update:', result);
            alert("Student Updated Successfully !");
            loadTable();
            window.location.href = 'index.html';
        })
        .catch(error => console.error(error));
}



function deleteStudent(stdId) {
    localStorage.setItem('studentId', stdId);
    const id = localStorage.getItem('studentId');

    if (!id) {
        console.log('No student ID found in localStorage');
        alert("Student is not delete");
        return;
    }

    const requestOptions = {
        method: "DELETE",
        redirect: "follow"
    };

    const askSure = confirm(`Are you sure you want to delete the student in this ID ${id}`);
    
    if (!askSure) {
        console.log('Delete canceled');
        alert("Delete canceled !");
        return;
    }

    fetch(`http://localhost:8080/studentInfo/deleteStudent/${id}`, requestOptions)
        .then((response) => {
            if (response.ok) {
                if (askSure) {
                    console.log('Student deleted successfully');
                    loadTable();
                    alert("Student deleted successfully !");
                }
            } else {
                console.log('Error deleting student:', response.status);
                alert("Error deleting student !");
            }
            response.text();
        })
        .then((result) => {
            console.log(result);
        })
        .catch((error) => console.error(error));

}


function clearForm() {
    document.getElementById('txtFirstName').value = '';
    document.getElementById('txtLastName').value = '';
    document.getElementById('txtAge').value = '';
    document.getElementById('txtGrade').value = '';
    document.getElementById('txaAddress').value = '';
    document.getElementById('txtEmail').value = '';
    document.getElementById('txtContact').value = '';
    document.getElementById('image').value = '';
}


function fillData() {
    let firstName = document.getElementById('txtFirstName').value;
    let lastName = document.getElementById('txtLastName').value;
    let age = document.getElementById('txtAge').value;
    let grade = document.getElementById('txtGrade').value;
    let address = document.getElementById('txaAddress').value;
    let email = document.getElementById('txtEmail').value;
    let contact = document.getElementById('txtContact').value;
    let imageInput = document.getElementById('image');

    if (!firstName || !lastName || !age || !grade || !address || !email || !contact || !imageInput.files[0]) {
        return alert("Please fill in all fields");
    }

    return {
        firstName,
        lastName,
        age,
        grade,
        address,
        email,
        contact,
        image: imageInput.files[0]
    };
}
