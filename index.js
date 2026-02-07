const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const { stderr } = require("process");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.sendFile(__dirname+"/index.html")
})
app.post("/launch-container", (req, res) => {
    const { osImage, name } = req.body;

    console.log("Received from frontend:");
    console.log("OS Image:", osImage);
    console.log("Container Name:", name);

    // Later you can run:
    // docker run -d --name name osImage

    res.json({
        success: true,
        message: `Container '${name}' with image '${osImage}' received`
    });
});

app.get("/show_running_images", (req,res)=>{
    exec(
        'docker ps --format "{{.Names}}|{{.Image}}|{{.Status}}"',
        (error, stdout, stderr)=>{

            if(error){
                return res.status(500).json({
                    sucess:false,
                    error:error.message
                });
            }

            if(!stdout.trim()) {
                return res.json({
                    sucess:true,
                    runnning:[]
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
                    sucess:true,
                    runnning:[]
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
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
