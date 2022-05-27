const _addr = "http://localhost:5000";
const _addr1 = "http://178.57.218.210:198";
const _token = "pdebbd1b-8aba-434f-9bf6-";
let commandTypeList;

getCommandTypes();

// Получить список команд
async function getCommandTypes() {

    const url = new URL(_addr + "/commands/types");
    const params = { token: _token };
    url.search = new URLSearchParams(params).toString();
    document.querySelector('input[name="cmdId"]').value = "0";

    const response = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if (response.ok) {
        const commands = await response.json();
        commandTypeList = commands.items;
        // console.log(commandTypeList);
        const options = document.querySelector("select");
        commandTypeList.forEach(command => options.append(createOptionRow(command)));
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}


// Создание строки для списка выбора
function createOptionRow(command) {

    const option = document.createElement("option");
    option.setAttribute("value", command.id);
    option.innerHTML = "&#xB7; " + command.name;

    return option;
}

function detectCommand(option) {
    const selCmd = commandTypeList.find(item => item.id == option.value);
    const cmdIdInput = document.querySelector('input[name="cmdId"]');
    cmdIdInput.value = option.value;

    const rowParams = document.getElementById("row_params");        // убрать параметры предыдущей команды
    if (rowParams) rowParams.remove();                     

    const tblParams = document.getElementById("tbl_params");
    let tr;

    // Показываем параметры команды
    if (selCmd.parameter_name1 || selCmd.parameter_name2 || selCmd.parameter_name3) {
        tr = document.createElement("tr");
        tr.setAttribute("id", "row_params");
    }

    for (let i = 1; i <= 3; i++) { 
        if (selCmd[`parameter_name${i}`]) {
            const td = document.createElement("td");
            td.innerHTML = `${selCmd[`parameter_name${i}`]}<br><input name="param${i}" value="${selCmd[`parameter_default_value${i}`]}" >`;
            tr.append(td);
        }
    }
    
    if (tr) tblParams.append(tr);
}

// Отправка команды на сервер
async function sendCommand() {

    const command = new Object();
    cleanError();
    
    const cmdIdInput = document.querySelector('input[name="cmdId"]');
    command["command_id"] = parseInt(cmdIdInput.value, 10);
    const terminalId = document.getElementById("terminalId").value;

    if (!command["command_id"]) {
        showError("Выберите команду");
        return;
    }

    for (let i = 1; i <= 3; i++) {
        const param = document.querySelector(`input[name="param${i}"]`);
        if (param && param.value && !isNaN(param.value))
            command[`parameter${i}`] = parseInt(param.value, 10);
    }
    
    if (terminalId && !isNaN(terminalId)) {

        console.log(`Терминал: ${parseInt(terminalId)}`)
        console.log(command);

        const url = new URL(`${_addr}/terminals/${terminalId}/commands`);
        const params = { token: _token };
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(command)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            if (data.success)
                document.getElementById("cmdHistory").append(createResponseRow(data.item));
        } else {
            showError(`[HTTP] Status: ${response.status}, Comment: ${response.statusText}`);
        }

    } else {
        showError("Введите корректный номер терминала");
    }
}

function showError(message) {
    const textboxError = document.getElementById("errorMessage");
    textboxError.style.display = "block";
    textboxError.insertAdjacentText("beforeend", " " + message + ";");
}

function cleanError() {
    const textboxError = document.getElementById("errorMessage");
    textboxError.style.display = "none";
    textboxError.innerText = "Ошибка: ";
}

let rowNumber = 0;

// Создание строки для таблицы ответов
function createResponseRow(data) {

    const tr = document.createElement("tr");

    let td = document.createElement("td");
    td.append(++rowNumber);
    tr.append(td);

    td = document.createElement("td");
    td.append(data.time_created);
    tr.append(td);

    td = document.createElement("td");
    const selCmd = commandTypeList.find(item => item.id == data.command_id);
    td.append(selCmd.name);
    tr.append(td);

    td = document.createElement("td");
    td.append(data.parameter1);
    tr.append(td);

    td = document.createElement("td");
    td.append(data.parameter2);
    tr.append(td);

    td = document.createElement("td");
    td.append(data.parameter3);
    tr.append(td);

    td = document.createElement("td");
    td.append(data.state_name);
    tr.append(td);

    return tr;
}