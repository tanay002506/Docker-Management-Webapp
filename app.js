// render table function 
function renderTable(headers, rows, mode) {
    const hasActions =mode ==="running" || mode === "all" ;
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");
    
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    
        // headers
    const headerRow =document.createElement("tr")
    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h.label;
        headerRow.appendChild(th);
    });
        // column for action buttons 
    if(hasActions){
        const actionTh = document.createElement("th");
        actionTh.textContent ="Actions";
        headerRow.appendChild(actionTh);
    }
    
    tableHead.appendChild(headerRow);
        // rows
     rows.forEach(row => {
        const tr = document.createElement("tr");
        // Normal data columns
        headers.forEach(h => {
            const td = document.createElement("td");
            td.textContent = row[h.key] ?? "-";
            tr.appendChild(td);
        });
        // Action buttons column
        if(hasActions){
            const actionTd =document.createElement("td");
            if(mode=="running"){
                actionTd.appendChild(
                    createButton("Stop", "btn btn-stop","stop",row,()=>
                        console.log("Stop:",row)
                    )
                );
            }
            if (mode=="all"){
                actionTd.append(
                    createButton("Launch", "btn btn-launch","launch",row, ()=> console.log("Launch", row)),
                    createButton("Stop", "btn btn-stop","stop",row, ()=> console.log("Stop", row)),
                    createButton("Delete", "btn btn-delete","delete",row, ()=> console.log("Delete", row))
                );
            }
            tr.appendChild(actionTd);
        }
        tableBody.appendChild(tr);
    });
}


//function to create button in each row of the output table 

function createButton(label, className, action, row) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.className = className;
    btn.style.width = "auto";

    btn.dataset.action =action;
    btn.dataset.name=row.name;
    btn.dataset.image=row.image;

    btn.addEventListener("click", handleActionClick);
    return btn;
}


//function to handle table button action 

function handleActionClick(e) {
    const btn = e.target;

    const action = btn.dataset.action;
    const name = btn.dataset.name;
    const image = btn.dataset.image;

    if (action === "launch") {
        fetch("/start_container", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, image })
        })
        
    }

    if (action === "stop") {
        fetch("/stop_container", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert(data.error || "Failed to stop container");
                return;
            }

            // 🔄 REFRESH TABLE HERE
            document.getElementById("showAllRunningImages").click();
        })
        .catch(err => {
            console.error(err);
            alert("Server error");
        });
    }

    if (action === "delete") {
        fetch("/delete_container", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
    }
}



//launch container button

document.getElementById("launchBtn").addEventListener("click", () => {
    const os = document.getElementById("os").value;
    const containerName = document.getElementById("containerName").value;
    if (!os || !containerName) {
        alert("Please select OS and enter container name");
        return;
    }
    const payload = {
        osImage: os,
        name: containerName
    }
    fetch("/launch-container",{
        method:"POST",
        headers :{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(res=>res.json())
    .then(data=>{
        console.log("Response from server :", data);
        alert(
            `Message: ${data.message}\n` +
            `Name: ${data.container.name}\n` +
            `Image: ${data.container.image}\n` +
            `Status: ${data.container.status}`
        );
    })
    .catch(err=>{
        console.log(err);
    })
});


//show running containers button 

document.getElementById("showRunningImages").addEventListener("click", () => {
    fetch("/show_running_images")
        .then(res=>res.json())
        .then(data=>{
            renderTable(
                [
                    {label: "Name", key:"name"},
                    {label: "Image", key:"image"},
                    {label: "Status", key:"status"},
                ],
                data.running,
                "running"
            );
        })
        .catch(err=>{
            console.error(err);
        })
        
});


//show all created containers button

 document.getElementById("showAllRunningImages").addEventListener("click", () => {
    fetch("/show_all_containers")
        .then(res=>res.json())
        .then(data=>{
            renderTable(
                [
                    {label: "Name", key:"name"},
                    {label: "Image", key:"image"},
                    {label: "Status", key:"status"},
    
                ],
                data.running,
                "all"
            );
        })
        .catch(err=>{
            console.error(err);
        })
        
});


//show all available images button 

document.getElementById("showAvailableImages").addEventListener("click", () => {
    fetch("/show_available_images")
        .then(res=>res.json())
        .then(data=>{
            renderTable(
                [
                    {label: "Image", key:"image"},
                    {label: "Size", key:"size"},
                ],
                data.available
            );
        })
        .catch(err=>{
            console.error(err);
        })
        
});