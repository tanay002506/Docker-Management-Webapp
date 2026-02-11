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

                const launchBtn = createButton("Launch", "btn btn-launch", "launch", row);
                const stopBtn = createButton("Stop", "btn btn-stop","stop",row);
                
                if (row.status && row.status.toLowerCase().includes("up")){
                    launchBtn.disabled = true;
                };

                if (row.status && row.status.toLowerCase().includes("exited")){
                    stopBtn.disabled = true;
                };

                actionTd.append(
                    launchBtn,
                    stopBtn,
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

    //disable delete button if the container is already up
    if (action === "delete" && row.status?.startsWith("Up")) {
        btn.disabled = true;
        btn.title = "Stop the container before deleting";
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
    }

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
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert(data.error || "Failed to launch container");
                return;
            }

            // 🔄 REFRESH TABLE HERE
            document.getElementById("showRunningImages").click();
        })
        .catch(err => {
            console.error(err);
            alert("Server error");
        });
        
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

        const confirmDelete = confirm(
            `Are you sure you want to delete container "${name}"?\n\nThis action cannot be undone`
        );

        if(!confirmDelete)return;

        

        // safe to delete
        fetch("/delete_container", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        })
        .then(async res=>{
            const data = await res.json();

            if(!res.ok){
                alert(data.error || "Failed to delete container");
                return;
            }

            document.getElementById("showAllRunningImages").click();
        }) 
        
        .catch(err => {
            console.error(err);
            alert("Server error");
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

    const nameRegex = /^[a-zA-Z0-9_-]{1,30}$/;

    if (!nameRegex.test(containerName)){
        alert("Invalid container name. \nOnly letters, numbers, '_' and '-' allowed " )
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

        if(!data.success){
            alert(data.error || "failed to create container");
        }
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