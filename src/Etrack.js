function logout() {
    firebase.auth().signOut().then(function () {
        showMessage({ 'message': 'Logout Success' }, 'success');
        showView("loginForm");
        resetLoginSignUpFormViews();
    }).catch(function (error) {
        showMessage(error, 'error');
    });
}

function signUp() {
    const username = document.getElementById('inputUserName').value;
    const password = document.getElementById('inputPassword').value;
    const auth = firebase.auth();
    var promise = auth.createUserWithEmailAndPassword(username, password);
    promise
        .then(() => { showUserData(username); })
        .catch(err => showMessage(err, 'error'));
}


function signUp() {
    const username = document.getElementById('inputSignUpEmail').value;
    const password = document.getElementById('inputSignUpPassword').value;
    const auth = firebase.auth();
    createNewUser()
        .then(() => {
            auth.createUserWithEmailAndPassword(username, password)
                .then(() => {
                    showUserData(username);
                })
                .catch(err => showMessage(err, 'error'));
        })
        .catch(err => showMessage(err, 'error'));
}


function login() {
    const username = document.getElementById('inputUserName').value;
    const password = document.getElementById('inputPassword').value;
    const auth = firebase.auth();
    var promise = auth.signInWithEmailAndPassword(username, password);
    promise
        .then((a, b, c) => { showUserData(username); })
        .catch(err => showMessage(err, 'error'));
}

function showMessage(p_messageObject, p_messageType) {
    console.log(p_messageType, ": ", p_messageObject);
    var l_objMsgContainer = document.getElementById('cntErrorMessage');
    l_objMsgContainer.innerHTML = "";
    var l_className = p_messageType == "success" ? 'successMessage' : 'errorMessage';
    l_objMsgContainer.innerHTML += p_messageObject.message;
    l_objMsgContainer.classList.add(l_className);
    setTimeout(() => {
        l_objMsgContainer.innerHTML = "";
        l_objMsgContainer.classList.remove(l_className);
    }, 5000);
}

function showUserData(username) {
    currentUserData = {};
    if (username != "") {
        var l_userDataPromise = getUserData();

        l_userDataPromise.then((snapshot) => {
            var l_userObject = getChildObjectByCondition(snapshot.val(), "email", username);
            currentUserData = l_userObject;
            document.getElementById('usernameHeader').innerHTML = l_userObject["userName"];
            document.getElementById('accBalance').innerText = l_userObject["accountBalance"];

            var l_dataTable = document.getElementById('userDataTable').getElementsByTagName('tbody')[0];
            l_dataTable.innerHTML = "";
            if (l_userObject.hasOwnProperty("transactionData") && l_userObject["transactionData"].hasOwnProperty("newUser")) {
                delete l_userObject["transactionData"]["newUser"];
            }
            Object.keys(l_userObject["transactionData"]).forEach((record) => {
                var l_txnType = l_userObject["transactionData"][record]["TxnType"];
                var l_txnAmount = l_userObject["transactionData"][record]["TxnAmount"];
                var l_txnDescription = l_userObject["transactionData"][record]["TxnDescription"];
                var row = l_dataTable.insertRow(l_dataTable.rows.length);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = l_txnAmount;
                cell2.innerHTML = l_txnDescription;
                cell3.innerHTML = l_txnType;
            });

            showView("userContent");
            resetInputValues();
            toggleComponentVisibility("logoutButton", true, "inline-block");
        });
    } else {
        showView("loginForm");
    }
}

function getChildObjectByCondition(p_object, p_key, p_value) {
    var keys = Object.keys(p_object);
    var l_currentUserObject;
    keys.forEach((rec) => {
        if (p_object[rec][p_key] === p_value) {
            l_currentUserObject = p_object[rec];
        }
    });
    return l_currentUserObject;
}

function resetLoginSignUpFormViews() {
    var l_loginEmail = document.getElementById('inputUserName');
    var l_loginPassword = document.getElementById('inputPassword');
    l_loginEmail.value = "";
    l_loginPassword.value = "";

    var l_signUpEmail = document.getElementById('inputSignUpEmail');
    var l_signUpPassword = document.getElementById('inputSignUpPassword');
    l_signUpEmail.value = "";
    l_signUpPassword.value = "";

    toggleComponentVisibility("logoutButton", false);
}

function helpTextClicked(event) {
    if (event.target.innerText == "Login") {
        showView("loginForm");
        resetLoginSignUpFormViews();
    } else if (event.target.innerText == "Sign Up") {
        showView("signUpForm");
        resetLoginSignUpFormViews();
    }
}

function onSubmitClick() {
    var l_txnType = document.getElementById('cmbTxnType').value;
    var l_txnAmount = document.getElementById('txnAmount').value;
    var l_txnDescription = document.getElementById('txnDescription').value;
    var l_dataTable = document.getElementById('userDataTable').getElementsByTagName('tbody')[0];
    currentUserData["accountBalance"] = Number(currentUserData["accountBalance"]) + Number(l_txnType == "Credit" ? l_txnAmount : -l_txnAmount);
    currentUserData["transactionData"][Object.keys(currentUserData["transactionData"]).length] = {
        "Date": new Date(),
        "TxnType": l_txnType,
        "TxnAmount": l_txnAmount,
        "TxnDescription": l_txnDescription
    };
    var updateNode = '/User Data/' + "user" + currentUserData["userId"];
    var updates = {};
    updates[updateNode] = currentUserData;
    firebase.database().ref().update(updates);

    var row = l_dataTable.insertRow(l_dataTable.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = l_txnAmount;
    cell2.innerHTML = l_txnDescription;
    cell3.innerHTML = l_txnType;
    document.getElementById('accBalance').innerText = currentUserData["accountBalance"];
    resetInputValues();
}

function resetInputValues() {
    var l_txnType = document.getElementById('cmbTxnType');
    var l_txnAmount = document.getElementById('txnAmount');
    var l_txnDescription = document.getElementById('txnDescription');

    l_txnType.value = "Credit";
    l_txnAmount.value = "";
    l_txnDescription.value = "";
}

function getUserData(user) {
    var database = firebase.database();
    return database.ref('/User Data/').once('value');
}

function showView(p_viewName) {
    const viewNames = ["loginForm", "userContent", "signUpForm"];
    viewNames.forEach((rec) => {
        let l_component = document.getElementById(rec);
        if (rec != p_viewName) {
            l_component.style.display = "none";
        } else {
            l_component.style.display = "block";
        }
    });
}

function toggleComponentVisibility(p_componentId, p_visible, p_displayType) {
    const l_component = document.getElementById(p_componentId);
    if (p_visible) {
        if (p_displayType) {
            l_component.style.display = p_displayType;
        } else {
            l_component.style.display = "block";
        }
    } else {
        l_component.style.display = "none";
    }
}

function createNewUser() {
    var l_promise = new Promise((resolve, reject) => {
        var l_userDataPromise = getUserData();
        l_userDataPromise
            .then((snapshot) => {
                let newEmail = document.getElementById('inputSignUpEmail').value;
                let newPassword = document.getElementById('inputSignUpPassword').value;
                let newUsername = document.getElementById('inputSignUpUsername').value;
                let newAccountBalance = document.getElementById('inputSignUpAccountBalance').value;
                if (!ValidateEmail(newEmail)) {
                    throw 'Email';
                } else if (newPassword == "") {
                    throw 'Password';
                }
                else if (newUsername == "") {
                    throw 'Username';
                } else if (newAccountBalance == "") {
                    throw 'Account Balance';
                } else {
                    var l_userDataTemplate = getUserDataTemplate();
                    var l_userObject = snapshot.val();
                    var l_newUserId = Object.keys(l_userObject).length + 1;
                    l_userDataTemplate['userId'] = l_newUserId;
                    l_userDataTemplate['email'] = newEmail;
                    l_userDataTemplate['userName'] = newUsername;
                    l_userDataTemplate['accountBalance'] = newAccountBalance;
                    var updateNode = '/User Data/user' + l_newUserId;
                    var updates = {};
                    updates[updateNode] = l_userDataTemplate;
                    firebase.database().ref().update(updates);
                }
                resolve(true);
            })
            .catch(err => {
                if (err == "Email") {
                    err = { 'message': 'You have entered an invalid email address!' };
                } else if (err == "Password") {
                    err = { 'message': 'Password is required!' };
                } else if (err == "Username") {
                    err = { 'message': 'Username is required!' };
                } else if (err == "Account Balance") {
                    err = { 'message': "Account Balance is required!" };
                }
                showMessage(err, 'error')
            });
    });
    return l_promise;
}

function ValidateEmail(mail) {
    return true;
    /*     if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
            return true;
        }
        return false; */
}

function getUserDataTemplate() {
    return {
        "userId": 1,
        "email": "",
        "userName": "",
        "accountBalance": "",
        "transactionData": { "newUser": true }
    }
}