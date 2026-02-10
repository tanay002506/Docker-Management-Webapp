const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const { stderr, stdout } = require("process");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));


app.get("/", (req,res) => {
    res.sendFile(__dirname+"/index.html")
})

app.post("/launch-container", (req, res) => {
    const { osImage, name } = req.body;

    exec(
        `docker run -d --name ${name} ${osImage} sleep infinity`, (error, stdout, stderr)=>{
            if(error){
                return res.status(500).json({
                    success:false,
                    error:error.message
                });
            }


            res.json({
                success: true,
                message:"Container started sucessfully",
                container: {
                    name: name,
                    image: osImage,
                    status: "running"
                },
            });
        }
    )

})   

app.get("/show_running_images", (req,res)=>{
    exec(
        'docker ps --format "{{.Names}}|{{.Image}}|{{.Status}}"',
        (error, stdout, stderr)=>{

            if(error){
                return res.status(500).json({
                    success:false,
                    error:error.message
                });
            }

            if(!stdout.trim()) {
                return res.json({
                    success:true,
                    running:[]
                });
            }

            const containers =stdout
                .trim()
                .split("\n")
                .map(line =>{

                    const[name, image, status] = line.split("|");
                    return{ name, image, status };
                })
            
            res.json({
                success:true,
                running: containers
            })
        }

    )
})

app.get("/show_all_containers",(req,res)=>{
    exec(
        'docker ps -a --format "{{.Names}}|{{.Image}}|{{.Status}}"',
        (error,stdout, stderr)=>{

            if(error){
                return res.status(500).json({
                    success:false,
                    error:error.message
                });
            }

            if(!stdout.trim()) {
                return res.json({
                    success:true,
                    running:[]
                });
            }

            const containers_all =stdout
                .trim()
                .split("\n")
                .map(line =>{

                    const[name, image, status] = line.split("|");
                    return{ name, image, status };
                })
            
            res.json({
                success:true,
                running: containers_all
            })


        }
    )
});
app.get("/show_available_images", (req,res)=>{
    exec(`docker images --format "{{.Repository}} |  {{.Size}}"`, 
        (error, stdout, stderr)=>{
            if(error){
                return res.status(500).json({
                    success:false,
                    error:error.message
                });
            }
            
            if(!stdout.trim()) {
                return res.json({
                    success:true,
                    running:[]
                });
            }

            const all_images =stdout
                .trim()
                .split("\n")
                .map(line =>{

                    const[image, size] = line.split("|");
                    return{ image, size };
                })
            
            res.json({
                success:true,
                available:all_images
            })
    })
})


//start container from output row

app.post("/start_container", (req, res) => {
    const { name } = req.body;

    exec(`docker start ${name}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error: stderr || error.message
            });
        }

        res.json({
            success: true,
            message: `Container ${name} started`
        });
    });
});


//stop running container from output table

app.post("/stop_container", (req, res) => {
    const { name } = req.body;

    exec(`docker stop ${name}`, (error) => {
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: `Container ${name} stopped`
        });
    });
});


//check for running container 

app.get("/is_container_running/:name", (req, res) => {
    const { name } = req.params;

    exec(
        `docker inspect -f "{{.State.Running}}" ${name}`,
        (error, stdout) => {
            if (error) {
                return res.json({
                    success: true,
                    running: false
                });
            }

            res.json({
                success: true,
                running: stdout.trim() === "true"
            });
        }
    );
});



//delete container from output table 

app.delete("/delete_container", (req, res) => {
    const { name } = req.body;

        exec(
            `docker inspect -f "{{.State.Running}}" ${name}`,
            (err, stdout) => {
                if (!err && stdout.trim() === "true") {
                    return res.status(400).json({
                        success: false,
                        error: "Container is running. Stop it first."
                    });
                }


                exec(`docker rm ${name}`, (error) => {
                    if (error) {
                        return res.status(500).json({
                            success: false,
                            error: error.message
                        });
                    }
                
                    res.json({
                        success: true,
                        message: `Container ${name} deleted`
                    });
                });
            
            }
        )

});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
